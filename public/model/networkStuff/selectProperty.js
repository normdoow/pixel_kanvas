//module for selecting a property
var selectProperty = (function() {
    
    var pixelDataRef;       //reference to the database
    var userDataRef;
	var myContext;
	var myCanvas;
    var currTileX;      //the current tileX and tileY that the mouse is on
    var currTileY;
    var selectedTiles;
    var propertyOwned;      //propertyOwned se we can hold on to it for switchCursor
    var inSelectProperty = false;       //used for redraw
    var mouseCanX;
    var mouseCanY;
    
	var init = function (canvas, context) {
        pixelDataRef = firebaseApp.getPixelDataRef();
        userDataRef = firebaseApp.getUserDataRef();
        myContext = context;
        myCanvas = canvas;
        setCanvasSizeSmall();   //so that the user can choose a gridd
        propertyOwned = false;
        selectedTiles = [];
        inSelectProperty = true;
	};
    
    //return if this module has been initialized yet
    var setInSelectProperty = function (val) {
        inSelectProperty = val;
    }
    
    //return if this module has been initialized yet
    var getInSelectProperty = function () {
        return inSelectProperty;
    }
    
    var setCanvasSizeSmall = function () {
        can.setPixSize(4);
        redraw.draw();
    };
    
    var getSelectedTiles = function () {
        return selectedTiles;  
    };
    
    //function for updating mouseX and mouseY when your mouse moves
    var updateOnMouseMove = function(e) {
        e.preventDefault();
        var offset = $('canvas').offset();
        var canMouse
        mouseCanX = (e.pageX - offset.left);
        mouseCanY = (e.pageY - offset.top);
        drawWithNewMouseCoords();
    };

    //draws with the global mouse coords
    var drawWithNewMouseCoords = function (isFromPanning) {     //isFrom panning is a flag that makes it so we always draw
        var mouseX = Math.floor(mouseCanX / can.getPixSize());
        var mouseY = Math.floor(mouseCanY / can.getPixSize());
        var dbCoordX = can.getPosX() + mouseX;
        var dbCoordY = can.getPosY() - mouseY;
        var tileX = Math.floor(dbCoordX / 100);
        var tileY = Math.floor(dbCoordY / 100);
        var coordX = (tileX * 100) - can.getPosX();
        var coordY = can.getPosY() - (tileY * 100 + 100);
        if(!propertyOwned) switchCursor(coordX, coordY, mouseCanX, mouseCanY);
        //if the mouse is moving to a new tile
        if(tileX != currTileX || tileY != currTileY || isFromPanning) {
            currTileX = tileX;
            currTileY = tileY;
            returnOwner(tileX, tileY).then(function(snapshot) {        //return the  ownerData
                var owner = snapshot.val();
                eraseCanvas();
                if(owner != null || tileX < 0 || tileY < 0) {                            //if the property is already owned or is a negative tile
                    drawBadSquare(coordX, coordY);
                    propertyOwned = true;           //set the propertyOwned se we can hold on to it for switchCursor
                    if(owner != null) {             //already an owner
                        var ownerData = owner.split(":");
                        var name = ownerData[0];     //get name of owner
                        drawHugeButton(coordX, coordY);
                        writeOwner(coordX, coordY, "Owned by " + name, 0);
                    } else {
                        drawMediumButton(coordX, coordY);
                        writeNegativeText(coordX, coordY, "Can't Buy in Negative Coordinates", 0);
                    }
                } else {                //property that is up for grabs
                    drawSquare(coordX, coordY);     //draw the square
                    write(coordX, coordY, "Add Tile", 4.5);
                    propertyOwned = false;          //set the propertyOwned se we can hold on to it for switchCursor
                }
                drawSelectedTiles();
            });
        }
    };
    
    var clickedMouse = function(e) {
        e.preventDefault();
        var offset = $('canvas').offset();
        var canMouse
        var mouseCanX = (e.pageX - offset.left);
        var mouseCanY = (e.pageY - offset.top);
        var mouseX = Math.floor(mouseCanX / can.getPixSize());
        var mouseY = Math.floor(mouseCanY / can.getPixSize());
        var dbCoordX = can.getPosX() + mouseX;
        var dbCoordY = can.getPosY() - mouseY;
        var tileX = Math.floor(dbCoordX / 100);
        var tileY = Math.floor(dbCoordY / 100);
        var coordX = (tileX * 100) - can.getPosX();
        var coordY = can.getPosY() - (tileY * 100 + 100);
        returnOwner(tileX, tileY).then(function(snapshot) {        //return the  owned
            var owner = snapshot.val();
            if(owner == null) {                             //if the property isn't already owned
                if(isWithinButton(coordX, coordY, mouseCanX, mouseCanY)) {
                    var tileStr = tileX + ":" + tileY;
                    if(doesArrayContainString(selectedTiles, tileStr)) {
                        removeFromSelectedTiles(tileStr);
                        eraseCanvas();
                        drawSquare(coordX, coordY);
                        write(coordX, coordY, "Add Tile", 4.5);
                        if(selectedTiles.length == 0) selectPropertyController.disableBuyButton(true);
                    } else {
                        addToSelectedTiles(tileStr);
                        eraseCanvas();
                        drawSquare();
                        write(coordX, coordY, "Remove", 5.5);
                        selectPropertyController.disableBuyButton(false);
                    }
                    drawSelectedTiles();
                    selectPropertyController.updateTiles(selectedTiles);        //update the tiles shown in the modal
                }
            }
        });
    };
    
    //true or false if the x and y is within the add property button
    var isWithinButton = function(x, y, mouseCanX, mouseCanY) {
        var size = can.getPixSize();
        var startX = (x + 33) * size;
        var startY = (y + 45) * size;
        var endX = startX + (33 * size);
        var endY = startY + (10 * size);
        return (mouseCanX >= startX && mouseCanX <= endX &&
                    mouseCanY >= startY && mouseCanY <= endY)
    };
    
    //make the cursor different based on if it is on the addProperty button
    var switchCursor = function (x, y, mouseCanX, mouseCanY) {   //coords of mouse in the canvas
        if(isWithinButton(x, y, mouseCanX, mouseCanY)) {
            $('#propertyCanvas').css('cursor', "pointer");     
        } else {
            $('#propertyCanvas').css('cursor', cursor.getCurrentCursor());
        }
    };
    
    //drawSquare on coordX and coordY
    var drawSquare = function (x, y) {
        var size = can.getPixSize();
        myContext.beginPath();
        myContext.rect(x * size, y * size, 100 * size, 100 * size);
        myContext.lineWidth = 3;
        myContext.globalAlpha = 0.3;
        myContext.fillStyle = 'black';
        myContext.strokeStyle = '#FF9900';
        myContext.fill();
        myContext.globalAlpha = 1;      //make line not have alpha
        myContext.stroke();
        myContext.closePath();
        drawAddPropertyButton(x, y);
    };
    
    //drawSquare on coordX and coordY that shows that they can't buy that property
    var drawBadSquare = function (x, y) {
        var size = can.getPixSize();
        myContext.beginPath();
        myContext.rect(x * size, y * size, 100 * size, 100 * size);
        myContext.lineWidth = 3;
        myContext.globalAlpha = 0.5;
        myContext.fillStyle = 'red';
        myContext.strokeStyle = 'black';
        myContext.fill();
        myContext.globalAlpha = 1;      //make line not have alpha
        myContext.stroke();
        myContext.closePath();
        myContext.beginPath();
        myContext.lineWidth = 7;
        myContext.moveTo(x * size, y * size);
        myContext.lineTo((x + 100) * size, (y + 100) * size);
        myContext.moveTo((x + 100) * size, y * size);
        myContext.lineTo(x * size, (y + 100) * size);
        myContext.stroke();
        myContext.closePath();
        drawAddPropertyButton(x, y);
    };
    
    var drawSelectedTiles = function () {
        for (var k = 0; k < selectedTiles.length; k++) {
            var coords = selectedTiles[k].split(":");
            var tileX = parseInt(coords[0]);
            var tileY = parseInt(coords[1]);
            var coordX = (tileX * 100) - can.getPosX();
            var coordY = can.getPosY() - (tileY * 100 + 100);
            drawSquare(coordX, coordY);
            write(coordX, coordY, "Remove", 5.5);
        }
    };
    
    //draws a box for the button
    var drawAddPropertyButton = function (x, y) {
        var size = can.getPixSize();
        myContext.beginPath();
        myContext.rect((x + 33) * size, (y + 45) * size, 33 * size, 10 * size);
        myContext.fillStyle = '#FF9900';
        myContext.fill();
        myContext.closePath();
    };
    
    //draws a box for the background of bad box
    var drawMediumButton = function (x, y) {
        var size = can.getPixSize();
        myContext.beginPath();
        myContext.rect((x + 10) * size, (y + 45) * size, 80 * size, 10 * size);
        myContext.fillStyle = 'black';
        myContext.fill();
        myContext.closePath();
    };
    
    //draws a box for the background of bad box
    var drawHugeButton = function (x, y) {
        var size = can.getPixSize();
        myContext.beginPath();
        myContext.rect((x + 2) * size, (y + 45) * size, 96 * size, 10 * size);
        myContext.fillStyle = 'black';
        myContext.fill();
        myContext.closePath();
    };
    
    //writes the text that you want on the canvas
    var write = function (x, y, text, sidePadding) {
        var size = can.getPixSize();
        myContext.beginPath();
        myContext.font = 18 + "px Lucida Sans Unicode";
        myContext.fillStyle = "black";
        myContext.fillText(text, (x + 33 + 2.5 + sidePadding) * size , (y + 45 + 6.5) * size);
        myContext.closePath();
    };
    
    //used to write error message for negative coordinates
    var writeNegativeText = function (x, y, text, sidePadding) {
        var size = can.getPixSize();
        myContext.beginPath();
        myContext.font = 18 + "px Lucida Sans Unicode";
        myContext.fillStyle = "white";
        myContext.fillText(text, (x + 13.5 + sidePadding) * size , (y + 45 + 6.5) * size);
        myContext.closePath();
    };
    
    //writes the text that tells who the owner of the square is
    var writeOwner = function (x, y, text, sidePadding) {
        var size = can.getPixSize();
        myContext.beginPath();
        myContext.font = 18 + "px Lucida Sans Unicode";
        myContext.fillStyle = "white";
        myContext.fillText(text, (x + 4 + sidePadding) * size , (y + 45 + 6.5) * size);
        myContext.closePath();
    };
    
    //helper function for deleting stuff
    var eraseCanvas = function () {
        myContext.save();
        myContext.setTransform(1, 0, 0, 1, 0 ,0);
        myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
    };
    
    //gives the selectedTiles to the user
    var giveProperty = function () {
        var user = firebaseApp.getUser();
        var username, uid;
        if(user) {
            username = user.displayName;
            uid = user.uid;
            selectedTiles.forEach(function(tileStr) {
                var coords = tileStr.split(":");
                var tileX = parseInt(coords[0]);
                var tileY = parseInt(coords[1]);
                pixelDataRef.child("tile" + tileX + ":" + tileY)
                            .child("owner")
                            .set(username + ':' + uid);
                userDataRef.child(uid)                  //set the user data with the tiles they own
                            .child('tiles')
                            .child("tile" + tileX + ":" + tileY)
                            .set("tile" + tileX + ":" + tileY);
            }, this);
            userTiles.setUserTiles(uid);                //set the menu so that it shows the new boughten tiles
            redraw.resetSavedData();                    //redraw so that if they have borders they are shown
        } else {
            console.log('error buying property');
            //TODO do something like make them log in
        }
    };
    
    //returns promise of true or false based on if the tile is owned
    var returnOwner = function (tileX, tileY) {
        var ownerRef = pixelDataRef.child("tile" + tileX + ":" + tileY).child('owner');
        return ownerRef.once('value');
    }
    
    //adds a tile to the array of selected tiles
    var addToSelectedTiles = function (tileStr) {
        selectedTiles.push(tileStr);
    };
    
    //removes from selected tiles
    var removeFromSelectedTiles = function (tileStr) {
        for (var k = 0; k < selectedTiles.length; k++) {
            if(selectedTiles[k] == tileStr) {
                selectedTiles.splice(k, 1);
            }
        }
    };
    
    //goes through an array and returns true if the string is in the array
    var doesArrayContainString = function (array, str) {
        for (var k = 0; k < array.length; k++) {
            if(array[k] == str) {
                return true;
            }
        }
        return false;
    };

	//the public API
	return {
		init: init,
        updateOnMouseMove: updateOnMouseMove,
        drawWithNewMouseCoords: drawWithNewMouseCoords,
        clickedMouse: clickedMouse,
        eraseCanvas: eraseCanvas,
        drawSelectedTiles: drawSelectedTiles,
        giveProperty: giveProperty,
        getSelectedTiles: getSelectedTiles,
        setInSelectProperty: setInSelectProperty,
        getInSelectProperty: getInSelectProperty
	};
})();