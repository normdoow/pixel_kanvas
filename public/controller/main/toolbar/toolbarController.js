var toolbarController = (function () {

	var mainCanvas;
	var canController;
	var lastButtonChanged;
	var colorButtons;

	var init = function (canvasController) {
		canController = canvasController;
		mainCanvas = canController.getCanvas();
		jumpToUrl();
		usersOnline.init();			//init the amount of users online
		setLoginButton();
		$("#loginButton").click(function (event) {
			loginController.showModal();
		});
		// automatically select all text when user clicks the share link
		$("#urlOutput").click(function () {
			$(this).select();
		});

		// highlight a coordinate on focus
		$(".coord-input").on("focus", function () {
	        $(this).select();
	    });
		
		$(".coord-input").change( function () {
			var val = $(this).val();
			if ($.isNumeric(val)) {
				$(this).val( val > -5000 ? val : -5000 );
			} else {
				$('xBox').val(can.getPosX());
				$('yBox').val(can.getPosY());
			}
		});
		
		$("#shareButton").click(function (event) {
			showOrRemoveSharePopUp(event);
		});

		$(".color-button").click(function () {
			$("#full").spectrum("set", $(this).css("background-color"));
			cursor.setCurrentCursor("url(./images/brush2.png),url(./images/brush2.png),auto");
			$('#propertyCanvas').css('cursor', cursor.getCurrentCursor());
			// format the box so the user knows it is selected
			setLastButtonBackToNormal();
			setBoxSelected(this);
			lastButtonChanged = this;
		});

		$("#eraser-button").click(clickedEraser);

		// initialize the color picker
	    $("#full").spectrum({
		    color: "#000",
		    className: "full-spectrum",
			clickoutFiresChange: true,
		    preferredFormat: "hex",
		    flat: false,
		    showButtons: false,
		    allowEmpty: true,
		    showInitial: true,
		    change : colorChanged
		});

		colorButtons = $(".color-button").toArray();
		setColorButtonsInitialColor();			//sets the colors to their first inital color
	};

	//sets the login button to say sign out if the user is logged in
	var setLoginButton = function () {
        var auth = firebaseApp.getAuth();
        var user = auth.onAuthStateChanged(function(user) {
            if(user) {
                $('#loginButton').text('Sign Out');
				$('#loginButton').off('click');
				$("#loginButton").click(function (event) {
					loginController.signOut();
				});
            }
        });
    };

	var getCanvas = function () {
		return mainCanvas;
	};

	var setCanvas = function (newCanvas) {
		mainCanvas = newCanvas;
	};

	var setColorButtonsInitialColor = function () {
		$(colorButtons[0]).css("background-color", '#3E8CD2');
		$(colorButtons[1]).css("background-color", '#42B879');
		$(colorButtons[2]).css("background-color", '#F6CC2E');
		$(colorButtons[3]).css("background-color", '#5F259F');
		$(colorButtons[4]).css("background-color", '#3E2412');
		$(colorButtons[5]).css("background-color", '#C3B0C3');
		$(colorButtons[6]).css("background-color", '#01AAE8');
		$(colorButtons[7]).css("background-color", '#F79744');
	};

	var colorChanged = function () {
		if(!$("#full").spectrum("get")) return;		//if it changed to being eraser
		var newColor = $("#full").spectrum("get").toRgbString();
		$('.sp-preview').css('background-color', newColor);		//set the preview color
		cursor.setCurrentCursor("url(./images/brush2.png),url(./images/brush2.png),auto");
		$('#propertyCanvas').css('cursor', cursor.getCurrentCursor());
		var exists = false;
		// debugger;
		for (var i = 0; i < colorButtons.length; i++) {
			if ($(colorButtons[i]).css("background-color") == newColor) {
				exists = true;
				//set the correct box back to being highlighted
				setLastButtonBackToNormal();
				setBoxSelected(colorButtons[i]);
				lastButtonChanged = colorButtons[i];
			}
		}

		if (exists) return;
		
		setLastButtonBackToNormal();
		var first = colorButtons[0];
		//lastButtonChanged = first;
		$(first).css("background-color", newColor);
		// format the box so the user knows it is selected
		setBoxSelected(first);
		colorButtons.shift();
		var length = colorButtons.push(first);
		lastButtonChanged = colorButtons[length-1];
	};

	//sets the box to look like it is selected
	var setBoxSelected = function (selectedBox) {
		$(selectedBox).css("border-width", "2px");
		$(selectedBox).css("width", "15px");
		$(selectedBox).css("height", "15px");
		$(selectedBox).css("border-color", "white");
	};

	var setLastButtonBackToNormal = function () {
		//TODO: make this better some day
		//bad way of checking if this is the eraser button 
		if(lastButtonChanged && lastButtonChanged.selector == '#eraser-button') {
			$('#eraser-button').css("width", "22px");
			$('#eraser-button').css("height", "22px");
		} else {
			$(lastButtonChanged).css("width", "17px");
			$(lastButtonChanged).css("height", "17px");
		}
		$(lastButtonChanged).css("border-color", "black");
		$(lastButtonChanged).css("border-width", "1px");
	};

	var clickedEraser = function () {
		$("#full").spectrum("set", null);
		cursor.setCurrentCursor("url(./images/eraser.png),url(./images/eraser.png),auto");
		$('#propertyCanvas').css('cursor', cursor.getCurrentCursor());
		setLastButtonBackToNormal();
		$('#eraser-button').css("border-width", "2px");			//set custom eraser button to be selected
		$('#eraser-button').css("width", "20px");
		$('#eraser-button').css("height", "20px");
		$('#eraser-button').css("border-color", "white");
		lastButtonChanged = $('#eraser-button');
	};

	var toolbarMessage = 
		"Left Click to paint a pixel, Right Click on a pixel to grab its " + 
		"color!<br />"+
		"Use the arrow keys to pan. Use the Scroll Wheel to zoom. " +
		"Have fun and collaborate!";

	var getToolbarMessage = function () {
		return toolbarMessage;
	};

	var setToolbarMessage = function (newMessage) {
		toolbarMessage = newMessage;
	};

	var jumpTo = function () {
		canController.jumpTo(Number($('#xBox').val()), Number($('#yBox').val()));
	    return false;
	};
	
	var showOrRemoveSharePopUp = function (event) {
        var modal = $('#sharePopDown').get(0);
		var isHidden = $('#sharePopDown').css( "display" ) == 'none';
		modal.style.display = isHidden? "block" : "none";
		
        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    };

	//function used for initialy jumping to the url's coordinates
	var jumpToUrl = function () {
		//check the url for coordinates it needs to go to
		var url = window.location.href;
		if(url.search("\\?")>0){
			var goToX = url.substring(url.search("x=") + 2,url.search("y="));
			var goToY = url.substring(url.search("y=") + 2);
			if(goToX <= 5000 && goToY <= 5000){
				can.setPosX(goToX);
				can.setPosY(goToY);
				redraw.draw();			//redraw the 
			}

		}
		else{
			console.log(url.search("\\?"));
		}
	};
	
	//updats the url so the user can have something to share
	var updateUrl = function () {
		outputURL = "http://www.pixelkanvas.com?x=" + can.getPosX() + "y=" + can.getPosY();
		$('#urlOutput').val(outputURL);
	};
	
	//updates the xbox and ybox
	var updateXboxYbox = function () {
		$('#xBox').val(can.getPosX().toString());
		$('#yBox').val(can.getPosY().toString());
	};

	return {
		init: init,
		getToolbarMessage: getToolbarMessage,
		setToolbarMessage: setToolbarMessage,
		colorChanged: colorChanged,
		jumpTo: jumpTo,
		getCanvas: getCanvas,
		setCanvas: setCanvas,
		clickedEraser: clickedEraser,
		updateUrl: updateUrl,
		updateXboxYbox: updateXboxYbox
	};

})();