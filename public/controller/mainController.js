
//This is the main controller
$(document).ready(function () {

	//main module
	var main = (function() {

		var myCallBack;

		var init = function () {
			firebaseApp.init();		//init the firebase database first thing
			//create a callback
			myCallBack = $.Callbacks();
			can.init();			//init the canvas class
			initControllers();
		};
		
		//initialize all the contollers here
		var initControllers = function () {
			canvasController.init(myCallBack);	//init the canvas controller
			loginController.init();
			paymentsController.init();
			toolbarController.init(canvasController);
			feedbackController.init();
			menuController.init();
		};

		//the public API
		return {
			init: init
		};
	})();

	main.init();

});