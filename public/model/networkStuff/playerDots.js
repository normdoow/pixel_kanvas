//module used to draw other player dots on the canvas. 
//it is instatiated from cavasFirebase
var playerDots = (function() {
	
    var pixelDataRef;
    var dotCanvas;
    var dotContext;
    var mouseX;         //used to know where the mouse is at
    var mouseY;
    var timer;  //pointer to the function that occurs every 30 seconds
    var currTileX;
    var currTileY;
    var updateTimer;
    var dotsToDraw;
    var refreshRate = 500;
    var animationFps = 34;
    
	var init = function (canvas, context) {
		pixelDataRef = firebaseApp.getPixelDataRef();
        dotCanvas = canvas;
        dotContext = context;
        updateDotEverySec();
        removeDotsFromDatabaseSometimes();      //removes dots every 30 seconds
        dotsToDraw = [];
        //draw the dots
        drawDotsInInterval();
	};
    
    //function for updating mouseX and mouseY when your mouse moves
    var updateDotOnMouseMove = function(e) {
        e.preventDefault();
        //Bresenham's line algorithm. We use to get position of the click
        var offset = $('canvas').offset();
        mouseX = Math.floor((e.pageX - offset.left) / can.getPixSize());
        mouseY = Math.floor((e.pageY - offset.top) / can.getPixSize());
        var dbCoordX = can.getPosX() + mouseX;
        var dbCoordY = can.getPosY() - mouseY;
        var tileX = Math.floor(dbCoordX / 100);
        var tileY = Math.floor(dbCoordY / 100);
        if(tileX != currTileX || tileY != currTileY) {
            eraseOldDotFromTile(currTileX, currTileY);
            currTileX = tileX;
            currTileY = tileY;
        }
    };

    //erases the dot data from that tile once your mouse leaves it
    var eraseOldDotFromTile = function (tileX, tileY) {
        pixelDataRef.child("tile" + tileX + ":" + tileY)
                    .child("players-in-tile")
                    .once('value', function (snapshot) {
                        if(snapshot.val()) {
                            var user = firebaseApp.getUser();
                            var currUserId = 'guest';
                            if(user) currUserId = user.uid;
                            var ids = Object.keys(snapshot.val());
                            for(var k in ids) {
                                if(ids[k] == currUserId) {      //if id is same as your id
                                    console.log('erased old dot');
                                    pixelDataRef.child("tile" + tileX + ":" + tileY)            //erase that value
                                                .child("players-in-tile")
                                                .child(ids[k])
                                                .set(null);
                                }
                            }
                        }
                    });
    };
    
    var updateDotEverySec = function() {
        updateTimer = setInterval(function() {
            var offset = $('canvas').offset();
            var dbCoordX = can.getPosX() + mouseX;
            var dbCoordY = can.getPosY() - mouseY;
            var tileX = Math.floor(dbCoordX / 100);
            var tileY = Math.floor(dbCoordY / 100);
            //console.log("Mouse Pos: " + dbCoordX + " : " + dbCoordY);
            
            //get the players color
            var currentColor = "#000000";
            if($("#full").spectrum("get")) { //if the spectrum is there
                currentColor = $("#full")
                                    .spectrum("get")
                                    .toHex();      //gets the value of the picker
            }
            //send the data to the database
            var playerName = 'guest';
            var uid = 'guest';
            var user = firebaseApp.getUser();
            if(user) {
                playerName = user.displayName;
                uid = user.uid;
            }
            pixelDataRef.child("tile" + tileX + ":" + tileY)
                        .child("players-in-tile")
                        .child(uid)        //is uniquer for every player
                    .set(dbCoordX + ":" + dbCoordY + ":" + currentColor + ":" + playerName);
        }, refreshRate);
    }
    
	//function to add listeners for the dots
    var addTileListener = function(tileKey) {
        pixelDataRef
				.child(tileKey)
				.child("players-in-tile")
				.on('child_added', updateDotForPlayer);
	    pixelDataRef
				.child(tileKey)
				.child("players-in-tile")
				.on('child_changed', updateDotForPlayer);
    };
    
    //function to add listeners for the dots
    var deleteTileListener = function(tileKey) {
        pixelDataRef
				.child(tileKey)
				.child("players-in-tile")
				.off('child_added', updateDotForPlayer);
	    pixelDataRef
				.child(tileKey)
				.child("players-in-tile")
				.off('child_changed', updateDotForPlayer);
    };
    
    //draws a dot for all the other players
    var updateDotForPlayer = function(snapshot) {
        var uid = snapshot.key;     //set the child data
        
        var user = firebaseApp.getUser();
        var currUserId = 'guest';
        if(user) currUserId = user.uid;
        
        //if the player isn't yourself
        if(uid != currUserId) {
            var isInArray = false;
            //check if the dot is already in the local array
            for(var key in dotsToDraw) {
                if(key == uid) {
                    isInArray = true;
                }
            }
            if(!isInArray) {            //new dot
                var dotObject = {};     
                dotObject.oldX = null;
                dotObject.oldY = null;
                dotObject.firstTimer = true;              //special flag so we don't draw all the random dots
                dotsToDraw[uid] = dotObject;        //add the new dot
            }
            var dot = dotsToDraw[uid];
            if(isInArray) dot.firstTimer = false;           //not a first dot now
            //get the coordinantes from the database
            var coordsColorName = snapshot.val().split(":");
            var dbCoordX = parseInt(coordsColorName[0]);
            var dbCoordY = parseInt(coordsColorName[1]);
            dot.color = coordsColorName[2];
            dot.playerName = coordsColorName[3];
            //get the canvas coordinates
            var coordX = dbCoordX - can.getPosX();
            var coordY = can.getPosY() - dbCoordY;
            if(!dot.oldX || !dot.oldY) {                //if no old value
                dot.oldX = coordX;
                dot.oldY = coordY;
            }
            dot.deltaX = (coordX - dot.oldX) / animationFps;
            dot.deltaY = (coordY - dot.oldY) / animationFps;
            dot.count = 0;
            dot.lastCanX = can.getPosX();
            dot.lastCanY = can.getPosY();
        }  
    };

    //draws dots every fps
    var drawDotsInInterval = function () {
        setInterval( function(){
            drawLocalDots();
        }, animationFps);
    };

    //draws the dots that are on the player's screen
    var drawLocalDots = function () {
        eraseCanvas();
        for(var key in dotsToDraw) {
            var dot = dotsToDraw[key];
            if(dot.firstTimer) continue;                        //if its a first timer, we don't want to draw it
            dot.oldX -= can.getPosX() - dot.lastCanX;           //get the change of the canvas
            dot.oldY += can.getPosY() - dot.lastCanY;
            drawDot(dot.oldX, dot.oldY, dot.color, dot.playerName);
            if (dot.count < animationFps) {
                dot.oldX += dot.deltaX;
                dot.oldY += dot.deltaY;
            }
            dot.lastCanX = can.getPosX();
            dot.lastCanY = can.getPosY();
            dot.count++;
        }
    };

    var drawDot = function(x, y, colorname, playername) {
        if (isNaN(x) || isNaN(y)) return false;

        //draw the dot for the circle
        dotContext.beginPath();
        dotContext.arc(x * can.getPixSize(), y * can.getPixSize(), can.getPixSize(), 0, 2 * Math.PI);
        dotContext.lineWidth = 2;
        dotContext.globalAlpha = 0.5;
        dotContext.fillStyle = "#" + colorname;
        dotContext.fill();
        dotContext.stroke();
        
        dotContext.font = 4 + can.getPixSize() + "px Lucida Sans Unicode";
        dotContext.fillStyle = "black";
        dotContext.fillText(playername, x * can.getPixSize() + can.getPixSize(), y * can.getPixSize() - can.getPixSize());
        dotContext.closePath();
    };
    
    //this function is called every 30 seconds to remove dots from the database
    var removeDotsFromDatabaseSometimes = function() {
        timer = setInterval(function() {
                    console.log("clear database of dots");
                    var tileX = Math.floor(can.getPosX() / 100);
                    var tileY = Math.floor(can.getPosY() / 100);
                    for(var x = tileX; x < tileX + 6; x++) {
		                for(var y = tileY; y > tileY - 4; y--) {
                            pixelDataRef.child("tile" + x + ":" + y)
                                        .child("players-in-tile")
                                        .set(null);
                        }
                    }
                    //remove local data of dots
                    dotsToDraw = [];
                }, 30000);
    };
    
    //helper function for deleting stuff
    var eraseCanvas = function () {
        dotContext.save();
        dotContext.setTransform(1, 0, 0, 1, 0 ,0);
        dotContext.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
    };

	//the public API
	return {
		init: init,
        addTileListener: addTileListener,
        deleteTileListener: deleteTileListener,
        updateDotOnMouseMove: updateDotOnMouseMove,
        drawLocalDots: drawLocalDots
	};
})();