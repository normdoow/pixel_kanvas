//cheating module
var cheating = (function() {

	var lastClicked;

	var init = function () {
		lastClicked = 0;
	};
	
	//function to check if the person is cheating by having an autoclicker
	var isCheating = function () {
		var current = Date.now();
		if (current - lastClicked < 150){
			//alert("Please don't use autoClickers!");
			return true;
		}

		lastClicked = current;
		return false;
	};

	//the public API
	return {
		init: init,
		isCheating : isCheating
	};
})();