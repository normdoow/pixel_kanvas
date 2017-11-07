//payments controller
var selectPropertyController = (function() {
    
    var canvas;
    var context;
    
    var init = function () {
        canvas = canvasController.getPropertyCanvas();
        context = canvasController.getPropertyCanvasContext();
        selectProperty.init(canvas, context);
        $(canvas).mousemove(updateOnMouseMove);       //update the position of where the mouse is at
        $(canvas).mousedown(clickedMouse);
        $('#cancel-button').click(cancelClicked);
        $('#buy-button').click(buyClicked);
        handlers.removeHandlers();                          //remove the other handlers so they aren't in the way
        showModal();
    };
    
    var updateOnMouseMove = function (event) {
        selectProperty.updateOnMouseMove(event);
    };
    
    var clickedMouse = function (event) {
        selectProperty.clickedMouse(event);
    };
    
    //close out all the canvas property stuff
    var cancelClicked = function (event) {
        hideModal();
        removeHandlers();
        selectProperty.eraseCanvas();
        handlers.addHandlers();
        selectProperty.setInSelectProperty(false);          //have to set this so that redraw knows your not in selectproperty
        menuController.showModal();
        $('#selected-tiles').empty();
    };
    
    var buyClicked = function (event) {
        console.log('clicked buy button');
        var user = firebaseApp.getUser();
        //if there is no user, make them log in
        if(user) {
            hideModal();
            paymentsController.showModal();     //show the payments modal
        } else {
            loginController.showModal();
        }
    };
    
    //disable the buy button
    var disableBuyButton = function (val) {
        $('#buy-button').prop('disabled', val);
    };
    
    //updates the selected tiles shown in the modal
    var updateTiles = function (selectedTiles) {
        $('#selected-tiles').empty();
        if(selectedTiles.length > 0) {
            for (var k = 0; k < selectedTiles.length; k++) {
                var coords = selectedTiles[k].split(":");
                var tileX = parseInt(coords[0]);
                var tileY = parseInt(coords[1]);
                $('#selected-tiles').append("<p>Tile " + tileX + " : " + tileY + "</p>");
            }
            $('#selected-tiles').append("<p>Price: $" + selectedTiles.length + "</p>");
        }
    };
    
    var removeHandlers = function () {
        $(canvas).off('mousemove', updateOnMouseMove);
        $(canvas).off('mousedown', clickedMouse);
    };
    
    var showModal = function () {
        // Get the modal
        var modal = $('#buyModal').get(0);
        //display the modal
        modal.style.display = "block";
    };
    
    var hideModal = function (event) {
        var modal = $('#buyModal').get(0);
        modal.style.display = "none";
    };

    //the public API
    return {
        init: init,
        showModal: showModal,
        cancelClicked: cancelClicked,
        disableBuyButton: disableBuyButton,
        updateTiles: updateTiles
    };
})();