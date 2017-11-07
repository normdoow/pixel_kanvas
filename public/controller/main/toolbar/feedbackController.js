var feedbackController = (function () {
	var can;
	var mainCanvas;
	var canController;
	var lastButtonChanged;
	var colorButtons;

	var init = function (canvasController) {
		setUpModal();
		$("#feedback-button").click(showModal);
        $("#feedback-send").click(sendFeedback);
        $("#feedback-message").click(function () {
            $(this).select();
        });
	};

    var showModal = function () {
        var modal = $('#feedbackModal').get(0);
        modal.style.display = "block";
        handlers.removeHandlers();                         //remove the other handlers so they aren't in the way
        handlers.removePanningHandlers();
    };

    var hideModal = function() {
        var modal = $('#feedbackModal').get(0);
        modal.style.display = "none";
        handlers.addHandlers();
        handlers.addPanningHandlers();
    };
    
    var setUpModal = function () {
        var modal = $('#feedbackModal').get(0);

        // Get the <span> element that closes the modal
        var span = $('#feedbackModal .close-button').get(0);

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            hideModal();
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                hideModal();
            }
        }
    };

    //sends the feedback in an email
    var sendFeedback = function () {
        var url = './php/feedback.php';
        var n = $('#feedback-name').val();
        var e = $('#feedback-email').val();
        var s =  $('#feedback-subject').val();
        var f =  $('#feedback-message').val();
        var params = {name: n, email: e, subject: s, feedback: f};
        ajax.doAjax(url, params).done(function(data) {
            console.log('got the data ' + data);
            //TODO do anything for errors
        });
        hideModal();
        return false;
    };
	
	return {
		init: init,
	};

})();