//usersOnline module
var usersOnline = (function() {

    var usersOnlineRef;
    var userRef;
    var connectedRef;
    
	var init = function () {
        usersOnlineRef = firebaseApp.getUsersOnlineRef();
        userRef = usersOnlineRef.push();
        initConnectedRef();
        updateToolBar();
    };
    
    var initConnectedRef = function () {
        // Add ourselves to presence list when online.
        connectedRef = firebaseApp.getInfoConnected();
        connectedRef.on("value", function (snap) {
            if (snap.val()) {
                // Remove ourselves when we disconnect.
                userRef.onDisconnect().remove();
                userRef.set(true);
            }
        });
    };
    
    var updateToolBar = function () {
        // Number of online users is the number of objects in the usersOnlineRef list.
        usersOnlineRef.on("value", function (snap) {
            console.log('%cUsers Online: ' + snap.numChildren(), 'color: #FFA500');
            $('#MyEdit').text('Users Online: ' + snap.numChildren());
        });
    };
	
	//the public API
	return {
		init: init
	};
})();