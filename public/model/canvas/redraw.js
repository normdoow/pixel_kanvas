//a global module that redraws the whole canvas
var redraw = (function() {
    
    var myCanvas;
    var myContext;
    var dotCanvas;
    var dotContext;
    var propertyCanvas;
    var propertyContext;
    
    var init = function (can, con, dotCan, dotCon, propertyCan, propertyCon) {
          myCanvas = can;
          myContext = con;
          dotCanvas = dotCan;
          dotContext = dotCon;
          propertyCanvas = propertyCan;      //get this from the canvas controller
          propertyContext = propertyCon;
    };
    
    //funciton that redraws the whole canvas
    var draw = function () {
        eraseCanvas();
        canvasController.drawGrid();
        canvasFirebase.redrawPixels();
        myContext.restore();	//Restore the transform
        toolbarController.updateUrl();      //update the url
        toolbarController.updateXboxYbox(); //update the x box and y box
        playerDots.drawLocalDots();         //draws the dots that are on the screen
        if(selectProperty.getInSelectProperty()) {      //used to see if getInSelectedProperty has been initialized
            selectProperty.drawSelectedTiles();
        } else {
            tileOwner.drawTileLines();           //draw the lines for owners
            // tileOwner.drawTileLinesFriends();
        }
    };
    
    var eraseCanvas = function () {
        myContext.save();
        myContext.setTransform(1, 0, 0, 1, 0 ,0);
        myContext.clearRect(0, 0, myCanvas.width, myCanvas.height);
        dotContext.save();
        dotContext.setTransform(1, 0, 0, 1, 0 ,0);
        dotContext.clearRect(0, 0, dotCanvas.width, dotCanvas.height);
        propertyContext.save();
        propertyContext.setTransform(1, 0, 0, 1, 0 ,0);
        propertyContext.clearRect(0, 0, propertyCanvas.width, propertyCanvas.height);
    };

    //resets the saved data so it can be remade
    var resetSavedData = function () {
        canvasFirebase.eraseSavedPixels();
        draw();     //redraw
    }
    
    return {
        init: init,
        draw: draw,
        resetSavedData: resetSavedData
    };
})();