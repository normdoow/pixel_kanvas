
var canvasFirebase = (function () {
	
	var myCallBack;
	var pixelDataRef;
	var pixelAnalyticsRef;
	var savedPixelArray;
	var tie;		//the tile var
	var myContext;	//these are passed in from the 
	var myCanvas;
	var clearOnce = 0;		//used for weird issue with pixel being called more than once

	var init = function (/*callback,*/ theCanvas, theContext) {
		initSavedPixelArray();
		pixelDataRef = firebaseApp.getPixelDataRef();
		pixelAnalyticsRef = firebaseApp.getPixelAnalyticsRef();
		cheating.init();		//init the cheating object to test for cheating
		tie = new Tile();
		myCanvas = theCanvas;
		myContext = theContext;
		redrawPixels();
	};

	//creates an empty 100 by 100 array
	var initSavedPixelArray = function () {
	    savedPixelArray = new Array();
	};

	//adds listenders so that the client can know when info is changed in their area
	var addListener = function (key) {
	    pixelDataRef
				.child("tile" + key)
				.child("pixels")
				.on('child_added', drawPixelFromDatabase);
	    pixelDataRef
				.child("tile" + key)
				.child("pixels")
				.on('child_changed', drawPixelFromDatabase);
	    pixelDataRef
				.child("tile" + key)
				.child("pixels")
				.on('child_removed', clearPixelFromDatabase);
		//adds the listeners for the dots
	    playerDots.addTileListener("tile" + key);
		//will draw stuff if there is an owner
		tileOwner.addTile(key);
	};

	//deletes the listeners that were not used
	var deleteListener = function (key) {
	    pixelDataRef
				.child("tile" + key)
				.child("pixels")
				.off('child_added', drawPixelFromDatabase);
	    pixelDataRef
				.child("tile" + key)
				.child("pixels")
				.off('child_changed', drawPixelFromDatabase);
	    pixelDataRef
				.child("tile" + key)
				.child("pixels")
				.off('child_removed', clearPixelFromDatabase);
		//removes the listeners for the dots
		playerDots.deleteTileListener("tile" + key);
		//will draw stuff if there is an owner
		tileOwner.removeTile(key);
	};
	
	 //Draw a line from the mouse's last position to its current position
    var drawPixelOnMouseClick = function(e) {
          if (cheating.isCheating()) return;        //if they are cheating jump out of making pixels

          e.preventDefault();
          var leftClick = isLeftClick(e.which);
          var rightClick = isRightClick(e.which);
		  updatePixelsClickedAnalytic();			//add to the analytics

          //Bresenham's line algorithm. We use to get position of the click
          var offset = $('canvas').offset();
          var x = Math.floor((e.pageX - offset.left) / can.getPixSize());
          var y = Math.floor((e.pageY - offset.top) / can.getPixSize());

          //set the tile position based off of the the click position
          tie.setPosX(Math.floor((can.getPosX() + x) / 100));
          tie.setPosY(Math.floor((can.getPosY() - y) / 100));
		  
          if(leftClick) {
                //write the pixel into Firebase, or if we are drawing white, remove the pixel
                if($("#full").spectrum("get") != null){ //ger returns null when eraser is selected
					var currentColor = $("#full")
								.spectrum("get")
								.toHex();      //gets the value of the picker
					pixelDataRef.child("tile" + tie.getPosX() + ":" + tie.getPosY())
								.child("pixels")
								.child((can.getPosX() + x) + ":" + (can.getPosY() - y))
								.set(currentColor);
					console.log((can.getPosX() + x) + ":" + (can.getPosY() - y));
                }
                else{ //delete data point when eraser is selected
                    pixelDataRef.child("tile" + tie.getPosX() + ":" + tie.getPosY())
                                    .child("pixels")
                                    .child((can.getPosX() + x) + ":" + (can.getPosY() - y))
                                    .set(null);
                }

            } else if(rightClick) {
                //add code to get the color of the current pixel
                var clickedPixelRef = pixelDataRef.child("tile" + tie.getPosX() + ":" + tie.getPosY())
                                        .child("pixels")
                                        .child((can.getPosX() + x) + ":" + (can.getPosY() - y));
                clickedPixelRef.once("value", function(colorSnapshot) {
                    var color = colorSnapshot.val();
                    console.log(color);
                    if(color == null){ //if nothing is grabbed set to eraser
						toolbarController.clickedEraser();
                    }else{  //otherwise set the color 
                        $("#full").spectrum("set", "#" + color);
                    }
                });
              	//change the color of the pallette preview and add to the
				toolbarController.colorChanged();
            }
        };

        //returns true for a left click key
        var isLeftClick = function (eWhich) {
        	return(eWhich == 1);
        };

        //returns true for right click and false for left
        var isRightClick = function (eWhich) {
        	return (eWhich == 3);
        };

        // Add callbacks that are fired any time the pixel data changes and adjusts the canvas appropriately.
		// Note that child_added events will be fired for initial pixel data as well.
		var drawPixelFromDatabase = function(snapshot) {
		    var childData = snapshot.val();     //set the child data

		    //get the coordinantes from the database
		    var coords = snapshot.key.split(":");
		    var dbCoordX = parseInt(coords[0]);
		    var dbCoordY = parseInt(coords[1]);
			
		    //get the canvas coordinates
		    var coordX = dbCoordX - can.getPosX();
		    var coordY = can.getPosY() - dbCoordY;

		    //figure out what tile we are on
		    var tileX = Math.floor(dbCoordX / 100);
		    var tileY = Math.floor(dbCoordY / 100);
			
		    //add the tile to the local data if it is not already
		    if(!(tileX + ":" + tileY in savedPixelArray)) {

		        savedPixelArray[tileX + ":" + tileY] = new Array(100);
		        for(var i = 0; i < 100; i++) {
		            savedPixelArray[tileX + ":" + tileY][i] = new Array(100);
		        }
		        //console.log("created an array");
		    }

		    //add the data locally
			var coordXFromTile = dbCoordX - tileX * 100;
			var coordYFromTile = tileY * 100 - dbCoordY;
			savedPixelArray[tileX + ":" + tileY][coordXFromTile][coordYFromTile + 100] = childData;
			
			var size = can.getPixSize();
		    //draw the pixel on the canvas
			myContext.beginPath();
		    myContext.fillStyle = "#" + childData;
		    myContext.fillRect(coordX * size, coordY * size, size, size);
			myContext.closePath();
		};

		//called as an event when an a user deletes a pixel
		var clearPixelFromDatabase = function(snapshot) {
			//only draw Pixels if the listeners are on. This is a work around because we don't want the inital data load
			console.log("clearing Pixels");
			//get the coordinantes from the database
			var coords = snapshot.key.split(":");
			var dbCoordX = parseInt(coords[0]);
			var dbCoordY = parseInt(coords[1]);
			//get the canvas coordinates
			var coordX = dbCoordX - can.getPosX();
			var coordY = can.getPosY() - dbCoordY;

			//figure out what tile we are on
			var tileX = Math.floor(dbCoordX / 100);
			var tileY = Math.floor(dbCoordY / 100);

			//add the data locally
			var coordXFromTile = dbCoordX - tileX * 100;
			var coordYFromTile = tileY * 100 - dbCoordY;
			savedPixelArray[tileX + ":" + tileY][coordXFromTile][coordYFromTile + 100] = null;
			
			var size = can.getPixSize();
			//erase the pixel
			myContext.beginPath();
			myContext.clearRect(coordX * size + .5, coordY * size + .5, size, size);
			var x = coordX * size + .5;
			var y = coordY * size + .5;
			myContext.moveTo(x , y);
	        myContext.lineTo(x, y + size);
			myContext.moveTo(x, y);
	        myContext.lineTo(x + size, y);
			myContext.moveTo(x + size, y);
	        myContext.lineTo(x + size, y + size);
			myContext.moveTo(x, y + size);
	        myContext.lineTo(x + size, y + size);
			myContext.strokeStyle = '#ddd';
			myContext.stroke();
			myContext.closePath();
		};
		
		//this keeps a running count of how many pixels have been clicked on Pixel Kanvas
		var updatePixelsClickedAnalytic = function () {
			pixelAnalyticsRef.child('AllTimeClicks').once('value', function(snapshot) {
				var numClicks = parseInt(snapshot.val());
				numClicks++;
				console.log('%cWorld Clicks: ' + numClicks, 'color: #FFA500');
				pixelAnalyticsRef.child('AllTimeClicks').set(numClicks);
			});
			// pixelAnalyticsRef.child('AllTimeClicks').set(1);
		};

		//redraws pixels from the database only for what is on your screen currently
		var redrawPixels = function () {
			//udpate the tile based on the canvas Position
			var tileX = Math.floor(can.getPosX() / 100);
		    var tileY = Math.floor(can.getPosY() / 100);
		    //deletes data from the savedPixelArray that is out of range
		    //also deletes the listeners that are not needed
			
		    deleteUnusedLocalDataAndListeners(tileX, tileY);
			
			//console.log("tile X: " + tileX + " Tile Y: " + tileY);
			//console.log("x: " + can.getPosX() + " y: " + can.getPosY());
		    //this goes through what are the updated current tiles showing on the screen
		    for(var x = tileX; x < tileX + 6; x++) {
		        for(var y = tileY; y > tileY - 4; y--) {
		            //if child is in my local then grab it here. otherwise grab it from the database
		            if((x + ":" + y) in savedPixelArray) {     //if the tile is in our local

		                //console.log("went into savedPixelArray");
		                //draw the locally saved data
		                drawSavedData(x, y);

		            } else {        //get the data from the database and add it to our local
		                //console.log("Went into database");
		                //adds the listener for this tile which will
		                //in turn draw the data for this tile
		                addListener(x + ":" + y);
						
		            }
		        }
		    }
		    //console.log(savedPixelArray);
		};

		//deletes data from the savedPixelArray that is out of range
		var deleteUnusedLocalDataAndListeners = function (tileX, tileY) {
		    for(var key in savedPixelArray){
		        var isThere = false;
		        //if these tiles aren't in the local saved array then delete stuff
		        for(var x = tileX; x < tileX + 6; x++) {
		            for(var y = tileY; y > tileY - 4; y--) {
		                if(key == x + ":" + y) {
		                    isThere = true;
		                    break;
		                }
		            }
		        }
		        if(!isThere) {
		            delete savedPixelArray[key];
		            console.log("deleted " + key);

		            //deletes the listener for this tile
		            deleteListener(key);
		        }
		    }
		}

		//draws the pixel data from what is saved localy, x is the xth tile, y is the yth tile
		var drawSavedData = function (x, y) {
		    var startTileX = Math.floor(can.getPosX() / 100);
		    var startTileY = Math.floor(can.getPosY() / 100);
			
			var pixelCanvasSpotX = (can.getPosX()).mod(100);// % 100;
			var pixelCanvasSpotY = Math.abs(can.getPosY()) % 100;
			if(startTileY >= 0) {
				pixelCanvasSpotY = 100 - pixelCanvasSpotY;
			}

		    if(startTileX == x && startTileY == y) {            //if the top corner tile
		        for(var k = pixelCanvasSpotX; k < 100; k++) {
		            for(var i = pixelCanvasSpotY; i <= 100; i++) {
		                //get the coordinates and draw them from the correct local data
		                var coordX = x * 100 + k - can.getPosX();
						var posY = 100 - can.getPosY();
		                var coordY = Math.abs(y * 100 + posY - i);
		                if(savedPixelArray[x + ":" + y][k][i] != null) {
		                    myContext.fillStyle = "#" + savedPixelArray[x + ":" + y][k][i];
		                    myContext.fillRect(coordX * can.getPixSize(), coordY * can.getPixSize(), can.getPixSize(), can.getPixSize());
		                }
		            }
		        }
		    } else if(startTileX == x) {                        //if the top row
		        for(var k = pixelCanvasSpotX; k < 100; k++) {
		            for(var i = 0; i <= 100; i++) {
		                //get the coordinates and draw them from the correct local data
		                var coordX = x * 100 + k - can.getPosX();
						var posY = 100 - can.getPosY();
		                var coordY = Math.abs(y * 100 + posY - i);
		                if(savedPixelArray[x + ":" + y][k][i] != null) {
		                    myContext.fillStyle = "#" + savedPixelArray[x + ":" + y][k][i];
		                    myContext.fillRect(coordX * can.getPixSize(), coordY * can.getPixSize(), can.getPixSize(), can.getPixSize());
		                }
		            }
		        }
		    } else if(startTileY == y) {                        //if the left row
		        for(var k = 0; k < 100; k++) {
		            for(var i = pixelCanvasSpotY; i <= 100; i++) {
		                //get the coordinates and draw them from the correct local data
		                var coordX = x * 100 + k - can.getPosX();
						var posY = 100 - can.getPosY();
		                var coordY = Math.abs(y * 100 + posY - i);
		                if(savedPixelArray[x + ":" + y][k][i] != null) {
		                    myContext.fillStyle = "#" + savedPixelArray[x + ":" + y][k][i];
		                    myContext.fillRect(coordX * can.getPixSize(), coordY * can.getPixSize(), can.getPixSize(), can.getPixSize());
		                }
		            }
		        }
		    } else {                                            //if something in the middle
		        for(var k = 0; k < 100; k++) {
		            for(var i = 0; i <= 100; i++) {
		                //get the coordinates and draw them from the correct local data
		                var coordX = x * 100 + k - can.getPosX();
						var posY = 100 - can.getPosY();
		                var coordY = Math.abs(y * 100 + posY - i);
		                if(savedPixelArray[x + ":" + y][k][i] != null) {
		                    myContext.fillStyle = "#" + savedPixelArray[x + ":" + y][k][i];
		                    myContext.fillRect(coordX * can.getPixSize(), coordY * can.getPixSize(), can.getPixSize(), can.getPixSize());
		                }
		            }
		        }
		    }
		};

		//erases the saved pixels so that new data can be drawn
		var eraseSavedPixels = function () {
			savedPixelArray = new Array();
		};
		
		//function to have a correct version of the mod function for javascript
		Number.prototype.mod = function(n) {
			return ((this%n)+n)%n;		//this is needed because javascirpt gets negative mods wrong
		};

	return {
		init: init,
		drawPixelOnMouseClick: drawPixelOnMouseClick,
		redrawPixels: redrawPixels,
		eraseSavedPixels: eraseSavedPixels
	};

})();