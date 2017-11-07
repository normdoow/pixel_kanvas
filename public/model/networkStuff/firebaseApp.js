//module used to get references to the firebase database
var firebaseApp = (function() {
	
	var init = function () {
		firebase.initializeApp(config());
	}
    
	//function to config firebase
    var config = function() {
        return {
			apiKey: "AIzaSyBsrUBAXYMrETtZzIOhlRLOk38Y6TV-YqA",
			authDomain: "blinding-heat-3262.firebaseapp.com",
			databaseURL: "https://blinding-heat-3262.firebaseio.com",
			storageBucket: "firebase-blinding-heat-3262.appspot.com"
		};
    };
	
	//returns a reference to the pixel Data
	var getPixelDataRef = function () {
		return firebase.database().ref().child('pixelData');
	};
	
	//gets reference to where the user data is stored
	var getUserDataRef = function () {
		return firebase.database().ref().child('userData');
	};
	
	var getPixelAnalyticsRef = function () {
		return firebase.database().ref().child('analytics');
	};
	
	var getInfoConnected = function () {
		return firebase.database().ref().child('.info/connected');
	};
	
	var getUsersOnlineRef = function () {
		return firebase.database().ref().child('usersOnline');
	};
	
	//get the authentication from firebase
	//need this to do anything with users
	var getAuth = function () {
		return firebase.auth();
	};
	
	//get the current user
	var getUser = function () {
		return getAuth().currentUser;
	}

	//the public API
	return {
		init: init,
		getPixelDataRef: getPixelDataRef,
		getUserDataRef: getUserDataRef,
		getPixelAnalyticsRef: getPixelAnalyticsRef,
		getInfoConnected: getInfoConnected,
		getUsersOnlineRef: getUsersOnlineRef,
		getAuth: getAuth,
		getUser: getUser
	};
})();