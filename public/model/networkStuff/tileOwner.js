//module that draws animations for tiles that are owned by people
var tileOwner = (function() {
	
    var pixelDataRef;
    var propertyCanvas;
    var propertyContext;
    var currTileX;
    var currTileY;
    var playerName;     //name of the current user
    var uid;
    var isTileOwned;    //boolean to keep track of if a tile is owned          
    var playerEmail;
    var tileOwner;      //name of a tile's owner  
    var friendOwner;  
    var savedTiles;     //array that keeps tracked of the tiles this player owns
    var savedFriendTiles;   //array to saved the friend tiles
    
	var init = function (canvas, context) {
		pixelDataRef = firebaseApp.getPixelDataRef();
        propertyCanvas = canvas;
        propertyContext = context;
        savedTiles = [];
        savedFriendTiles = [];
        setUser();
	};
    
    //sets the firebase user playername and uid which is used for checking tiles
    var setUser = function() {
        var user = firebaseApp.getUser();
        if(user) {
            playerName = user.displayName;
            uid = user.uid;
            playerEmail = user.email;
        } else {
            playerName = 'guest';
            uid = null;
            playerEmail = 'guest@gmail.com';
        }
    };
    
    //function for updating mouseX and mouseY when your mouse moves
    var updateOnMouseMove = function(e) {
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
        if(!selectProperty.getInSelectProperty()) {         //if not drawing for selectProperty
            if(isTileOwned) {           //if the tile is owned redraw the owner text
                eraseCanvas();
                drawTileLines();
                // drawTileLinesFriends();          //removed to not show tile lines for now
                writeOwner(mouseX, mouseY, "Owned by " + tileOwner);
            }
            if(tileX != currTileX || tileY != currTileY) {
                currTileX = tileX;
                currTileY = tileY;
                setUser();              //set the playerName and uid
                setVisualsForOwner(mouseX, mouseY, tileX, tileY);
                // setVisualsForFriend(mouseX, mouseY, tileX, tileY);
            }
        }
    };

    //sets the visuals for the current tileX and tileY based on firebase
    var setVisualsForOwner = function (mouseX, mouseY, tileX, tileY) {
        returnOwner(tileX, tileY).then(function(snapshot) {        //return the  ownerData
            var owner = snapshot.val();
            if(owner != null) {
                var ownerData = owner.split(":");
                tileOwner = ownerData[0];     //get name of owner
                var id = ownerData[1];
                if(id == uid) {     //if they aren't the same set the x
                    $('#propertyCanvas').css('cursor', cursor.getCurrentCursor());
                    canvasController.addMouseDownHandler();
                    eraseCanvas();
                    drawTileLines();
                    // drawTileLinesFriends();              //used to make friend tile lines
                    isTileOwned = false;
                } else {
                    $('#propertyCanvas').css('cursor', "url(./images/x.png),url(./images/x.png),auto");
                    canvasController.removeMouseDownHandler();
                    writeOwner(mouseX, mouseY, "Owned by " + tileOwner);
                    eraseCanvas();
                    drawTileLines();
                    // drawTileLinesFriends();              //used to make friend tile lines
                    isTileOwned = true;
                }
            } else {
                $('#propertyCanvas').css('cursor', cursor.getCurrentCursor());
                canvasController.addMouseDownHandler();
                eraseCanvas();
                drawTileLines();
                // drawTileLinesFriends();                  //used to make friend tile lines
                isTileOwned = false;
            }
        });
    };

    //sets the visuals based on if you are a friend or not
    var setVisualsForFriend = function (mouseX, mouseY, tileX, tileY) {
        getFriendsForTile(tileX, tileY).then(function(snapshot) {        //return the  ownerData
            var friends = snapshot.val();
            if(friends) {
                var isFriend = false;
                for(var k in friends) {
                    var email = friends[k];
                    if(email == playerEmail) {          //if its a friend that can edit
                        isFriend = true;
                        console.log('your a friend!');
                    }
                }
                if(isFriend) {          //if its a friend that can edit
                    $('#propertyCanvas').css('cursor', cursor.getCurrentCursor());
                    canvasController.addMouseDownHandler();
                    eraseCanvas();
                    drawTileLines();
                    drawTileLinesFriends();
                    isTileOwned = false;
                }
                //get the friends name
                returnOwner(tileX, tileY).then(function(snapshot) {        //return the  ownerData
                    var owner = snapshot.val();
                    if(owner != null) {
                        var ownerData = owner.split(":");
                        friendOwner = ownerData[0];     //get name of ownerws
                    }
                });
            }
        });
    };
    
    //is called in canvasFirebase every time a new tile is on the screen, the key is the tile
    var addTile = function(key) {
        if(savedTiles.indexOf(key) == -1) {  //if item not in the array
            var tiles = key.split(':');
            var tileX = parseInt(tiles[0]);
            var tileY = parseInt(tiles[1]);
            returnOwner(tileX, tileY).then(function(snapshot) {
                var owner = snapshot.val();
                if(owner != null) {
                    var ownerData = owner.split(":");
                    var name = ownerData[0];     //get name of owner
                    var user = firebaseApp.getUser();       //get the current user
                    if(user) {
                        if(name == user.displayName) {     //if the tile is owned by the current player
                            savedTiles.push(key);
                        }
                    }
                }
            });
            getFriendsForTile(tileX, tileY).then(function(snapshot) {        //return the  ownerData
                var friends = snapshot.val();
                if(friends) {
                    var isFriend = false;
                    for(var k in friends) {
                        var email = friends[k];
                         var user = firebaseApp.getUser();       //get the current user
                        if(user) {
                            if(email == user.email) {          //if its a friend that can edit
                                isFriend = true;
                            }
                        }
                    }
                    if(isFriend) {
                        savedFriendTiles.push(key);
                    }
                }
            });
        }
    };
    
    //is called everytime a tile listener is removed from canvasFirebaseas
    var removeTile = function(key) {
        //if the tile is one of our saved tiles
        if(savedTiles.indexOf(key) > -1) {
            var index = savedTiles.indexOf(key);
            savedTiles.splice(index, 1);
        }
    };
    
    //first called from redraw
    //function that draws the lines around a tile that the player owns
    var drawTileLines = function() {
        var cornerTileX;
        var cornerTileY;
        if(savedTiles.length > 0) {     //if there are savedTiles
            var coords = savedTiles[0].split(":");        //set the cornerTile to the first one at first
            var tileX = parseInt(coords[0]);
            var tileY = parseInt(coords[1]);
            cornerTileX = tileX;
            cornerTileY = tileY;
        }
        savedTiles.forEach(function(tileKey) {
            var coords = tileKey.split(":");
            var tileX = parseInt(coords[0]);
            var tileY = parseInt(coords[1]);
            if(cornerTileX > tileX) cornerTileX = tileX;        //set to the corner tile to the topest left tile
            if(cornerTileY < tileY) cornerTileY = tileY;
            drawLineForTile(tileX, tileY);
        }, this);
        if(savedTiles.length > 0) {     //if there are saved tiles write that the player owns it
            var coordX = (cornerTileX * 100) - can.getPosX();
            var coordY = can.getPosY() - (cornerTileY * 100 + 100);
            writePlayerName(coordX, coordY, "Owned by " + playerName);
        }
    };

    //first called from redraw
    //function that draws the lines around a tile that the player owns
    var drawTileLinesFriends = function() {
        var cornerTileX;
        var cornerTileY;
        if(savedFriendTiles.length > 0) {     //if there are savedTiles
            var coords = savedFriendTiles[0].split(":");        //set the cornerTile to the first one at first
            var tileX = parseInt(coords[0]);
            var tileY = parseInt(coords[1]);
            cornerTileX = tileX;
            cornerTileY = tileY;
        }
        savedFriendTiles.forEach(function(tileKey) {
            var coords = tileKey.split(":");
            var tileX = parseInt(coords[0]);
            var tileY = parseInt(coords[1]);
            if(cornerTileX > tileX) cornerTileX = tileX;        //set to the corner tile to the topest left tile
            if(cornerTileY < tileY) cornerTileY = tileY;
            drawLineForTile(tileX, tileY);
        }, this);
        if(savedFriendTiles.length > 0) {     //if there are saved tiles write that the player owns it
            var coordX = (cornerTileX * 100) - can.getPosX();
            var coordY = can.getPosY() - (cornerTileY * 100 + 100);
            writePlayerName(coordX, coordY, "Owned by " + friendOwner);
        }
    };

    //second called
    //called from drawLineTiles
    var drawLineForTile = function (tileX, tileY) {
        //get top left corner of tile
        var coordX = (tileX * 100) - can.getPosX();
        var coordY = can.getPosY() - (tileY * 100 + 100) + 1;       // + 1 because the borders where up one for some reason
        if(savedTiles.indexOf((tileX - 1) + ":" + tileY) == -1) { //if not user's tile to the left
            drawLine(coordX, coordY, coordX, coordY + 100);
        }
        if(savedTiles.indexOf(tileX + ":" + (tileY + 1)) == -1) { //if not user's tile to the top
            drawLine(coordX, coordY, coordX + 100, coordY);
        }
        if(savedTiles.indexOf((tileX + 1) + ":" + tileY) == -1) { //if not user's tile to the right
            drawLine(coordX + 100, coordY, coordX + 100, coordY + 100);
        }
        if(savedTiles.indexOf(tileX + ":" + (tileY - 1)) == -1) { //if not user's tile to the top
            drawLine(coordX, coordY + 100, coordX + 100, coordY + 100);
        }
    };
    
    //third called
    //function that draws a line with the given parameters
    var drawLine = function (startX, startY, endX, endY) {
        var size = can.getPixSize();
        propertyContext.beginPath();
        propertyContext.moveTo(startX * size, startY * size);
        propertyContext.lineTo(endX * size, endY * size);
        propertyContext.lineWidth = 1;
        propertyContext.strokeStyle = 'black';
        propertyContext.stroke();
        propertyContext.closePath();
    };
    
    //make the cursor different based on if it is on the addProperty button
    var switchCursor = function (x, y, mouseCanX, mouseCanY) {   //coords of mouse in the canvas
        if(isWithinButton(x, y, mouseCanX, mouseCanY)) {
            $('#propertyCanvas').css('cursor', cursor.getCurrentCursor());
        } else {
            $('#propertyCanvas').css('cursor', "url(./images/x.png),auto");
        }
    };
    
    //writes the text that you want on the canvas
    var writeOwner = function (x, y, text) {
        var size = can.getPixSize();
        propertyContext.beginPath();
        propertyContext.font = 18 + "px Lucida Sans Unicode";
        propertyContext.fillStyle = "red";
        propertyContext.fillText(text, (x + 7) * size , (y - 3) * size);
        propertyContext.closePath();
    };
    
    //writes the text that you want on the canvas
    var writePlayerName = function (x, y, text) {
        var size = can.getPixSize();
        propertyContext.beginPath();
        propertyContext.font = 25 + "px Lucida Sans Unicode";
        propertyContext.fillStyle = "black";
        propertyContext.fillText(text, x * size , y * size);
        propertyContext.closePath();
    };
    
    //returns promise of true or false based on if the tile is owned
    var returnOwner = function (tileX, tileY) {
        var ownerRef = pixelDataRef.child("tile" + tileX + ":" + tileY).child('owner');
        return ownerRef.once('value');
    };

    var getFriendsForTile = function (tileX, tileY) {
        var tiles = pixelDataRef.child("tile" + tileX + ":" + tileY)
                                .child('friends');
        return tiles.once('value');
    };
    
    //helper function for deleting stuff
    var eraseCanvas = function () {
        propertyContext.save();
        propertyContext.setTransform(1, 0, 0, 1, 0 ,0);
        propertyContext.clearRect(0, 0, propertyCanvas.width, propertyCanvas.height);
    };

	//the public API
	return {
		init: init,
        addTile: addTile,
        removeTile: removeTile,
        setUser: setUser,
        drawTileLines: drawTileLines,
        drawTileLinesFriends: drawTileLinesFriends,
        updateOnMouseMove: updateOnMouseMove
	};
})();