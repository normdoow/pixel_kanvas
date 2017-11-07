//main module
var canvasController = (function() {
	// Set up our canvas
    var myCanvas;
    var myContext;
	var dotCanvas;
	var dotContext;
	var propertyCanvas;
	var propertyContext;
    var myCallBack;
    
	var init = function (callBack) {
		//myCallBack = callBack;					//set the callback
		myCanvas = getCanvas();
		myContext = getCanvasContext();
		dotCanvas = getDotCanvas();
		dotContext = getDotCanvasContext();
		propertyCanvas = getPropertyCanvas();
		propertyContext = getPropertyCanvasContext();
		checkForNullCanvas();
		//init the different canvas classes
		redraw.init(myCanvas, myContext, dotCanvas, dotContext, propertyCanvas, propertyContext);
		panController.init(myCanvas, myContext);
		scrollController.init(myCanvas, myContext);
		
		//init the cursor class
		cursor.init();
		playerDots.init(dotCanvas, dotContext);		//init the module that handles drawing player dots
		tileOwner.init(propertyCanvas, propertyContext);		//init the module that draws property stuff
		//init the firebase for canvas and pass it the callback, canvas, and context
		canvasFirebase.init(myCanvas, myContext);
		makeResponsiveCanvas(myCanvas, myContext);
		makeResponsiveCanvas(dotCanvas, dotContext);
		makeResponsiveCanvas(propertyCanvas, propertyContext);
		//Run function when browser resizes
    	$(window).resize( makeResponsiveCanvas(myCanvas, myContext) );
		$(window).resize( makeResponsiveCanvas(dotCanvas, dotContext) );
		$(window).resize( makeResponsiveCanvas(propertyCanvas, propertyContext) );
		
		addHandlers();
	};
	
	var addHandlers = function () {
		//the clickable canvas must be the top canvas
		$(propertyCanvas).mousedown(drawPixelOnMouseClick);		//jquery event for clicking
		$(propertyCanvas).mousemove(updateOnMouseMove);
		//creates the right click function and makes it so you can't right click on canvas
        $('body').on('contextmenu', '#respondCanvas', function(e) { return false;});
		$('body').on('contextmenu', '#dotCanvas', function(e) { return false;});
		$('body').on('contextmenu', '#propertyCanvas', function(e) { return false;});
	};
	
	var removeHandlers = function () {
		$('body').off('contextmenu', '#respondCanvas');
		$('body').off('contextmenu', '#dotCanvas');
		$('body').off('contextmenu', '#propertyCanvas');
		
		$(propertyCanvas).off('mousedown', drawPixelOnMouseClick);
		$(propertyCanvas).off('mousemove', updateOnMouseMove);
	};
	
	//adds back the handler that allows players to click on a tile
	var addMouseDownHandler = function () {
		$(propertyCanvas).mousedown(drawPixelOnMouseClick);		//jquery event for clicking
	};
	
	//used to remove the mouse clicking handler so that users can't draw on other people's property
	var removeMouseDownHandler = function () {
		$(propertyCanvas).off('mousedown', drawPixelOnMouseClick);
	};

	// DOESN'T WORK YET
	var jumpTo = function (x, y) {
		// if the values are not above 0, set them to 0
		x = x >= -5000 ? x : -5000;
	    y = y >= -5000 ? y : -5000;
	    // limit values to be less than 10,000
	    x = x <= 5000 ? x : 5000;
	    y = y <= 5000 ? y : 5000;

	    can.setPosX(x);
        can.setPosY(y);

        redraw.draw();

	    return false;
	}

	var getCanvas = function () {
		return document.getElementById('respondCanvas');
	};

	var getCanvasContext = function () {
		return myCanvas.getContext ? myCanvas.getContext('2d') : null;
	};
	
	var getDotCanvas = function () {
		return document.getElementById('dotCanvas');
	};
	
	var getDotCanvasContext = function () {
		return dotCanvas.getContext ? dotCanvas.getContext('2d') : null;
	};
	
	var getPropertyCanvas = function () {
		return document.getElementById('propertyCanvas');
	};
	
	var getPropertyCanvasContext = function () {
		return propertyCanvas.getContext ? propertyCanvas.getContext('2d') : null;
	};

	var checkForNullCanvas = function () {
		if (myContext == null) {
        	alert("You must use a browser that supports HTML5 Canvas to run this page.");
        	return;
    	}
	};

	var drawPixelOnMouseClick = function (event) {
		canvasFirebase.drawPixelOnMouseClick(event);	//calls the firebase function
	};
	
	var updateOnMouseMove = function (event) {
		playerDots.updateDotOnMouseMove(event);			//calls the firebase function
		tileOwner.updateOnMouseMove(event);				//update tile Owner mouse
	};

	var drawGrid = function () {
    
	    // for making the grid lines of the canvas
	    var width = myCanvas.width;
	    var height = myCanvas.height;
	    myContext.beginPath();
		
	    can.setWidth(width);	//set the canvas variables
	    can.setHeight(height);

		//not using this currently
	    //myCallBack.fire(can);		//update everyones canvas

	    //draw lines to add to the canvas
	    for (var x = 0.5; x < width; x += can.getPixSize()) {
	        myContext.moveTo(x, 0);
	        myContext.lineTo(x, height);
	    }

	    for (var y = 0.5; y < height; y += can.getPixSize()) {
	        myContext.moveTo(0, y);
	        myContext.lineTo(width, y);
	    }
	    myContext.strokeStyle = "#ddd";
	    myContext.stroke();
		myContext.closePath();
	};
	
	//makes the canvas responsive
	var makeResponsiveCanvas = function (canvas, context) {
		var container = $(canvas).parent();
        $(canvas).attr('width', $(container).width() ); //max width
        $(canvas).attr('height', $(container).height() ); //max height

        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        //need to add the redrawing pixels here
        canvasFirebase.redrawPixels();			//redraws all the pixels
        context.restore();    //Restore the transform
    };

	//public API
	return {
		init: init,
		addHandlers: addHandlers,
		removeHandlers: removeHandlers,
		addMouseDownHandler: addMouseDownHandler,
		removeMouseDownHandler: removeMouseDownHandler,
		getCanvas: getCanvas,
		getCanvasContext: getCanvasContext,
		getDotCanvas: getDotCanvas,
		getDotCanvasContext: getDotCanvasContext,
		getPropertyCanvas: getPropertyCanvas,
		getPropertyCanvasContext: getPropertyCanvasContext,
		drawGrid: drawGrid,
		jumpTo: jumpTo
	};
})();