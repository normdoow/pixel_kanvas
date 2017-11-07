//login controller
var loginController = (function() {

    var auth;
    
    var init = function () {
        setUpModal();
        auth = firebaseApp.getAuth();       //get reference to firebase
        $("#sign-up").click(createUser); //create new user
        $("#login").click(login);           //sign in
        $("#sign-out").click(signOut);
        $('.underline-butt').click(switchLoginOrSignUp);
        $('#sign-in-form').hide();      //start with sign in hidden
    };

    var showModal = function() {
        // Get the modal
        var modal = $('#loginModal').get(0);
        //display the modal
        modal.style.display = "block";
        handlers.removeHandlers();                          //remove the other handlers so they aren't in the way
        handlers.removePanningHandlers();
    };

    var hideModal = function() {
        var modal = $('#loginModal').get(0);
        modal.style.display = "none";
        handlers.addHandlers();                 //adds the handlers so you can work the pixel kanvas
        handlers.addPanningHandlers();
    };
    
    var login = function(event) {
        event.preventDefault()
        var email = $('#email-log').val();
        var password = $('#password-log').val();
        
        //sign in with firebase
        auth.signInWithEmailAndPassword(email, password).then(function() {
        
            //get the user
            var user = auth.currentUser;
            if(user) {
                console.log('user logged in');
            } else {
                console.log('user not logged in');
            }
            hideModal();
            redraw.resetSavedData();        //redraw so that the border lines are there
        }).catch(function(error) {
			//handle error codes
            console.log(error.message);
            $("#login-error p").text(error.message);
		});
    };
    
    //signs the player out and then refreshes the page
    var signOut = function() {
        console.log('signed out');
        auth.signOut().then(function() {
            location.reload();  
        });
    };
    
    var createUser = function (event) {
        event.preventDefault()
        console.log('create user');
        var username = $('#username').val();
        var email = $('#email-sign').val();
        var password = $('#password-sign').val();
        if(username == null || username == '') {
            $("#login-error p").text("You must have a Username.");
            return;     //jump out we don't want to continue craeting user
        }
        //create the user
        auth.createUserWithEmailAndPassword(email, password).then(function() {
            //update their display name
            var user = auth.onAuthStateChanged(function(user) {
                if (user) {
                    console.log('got user');
                    user.updateProfile({
                        displayName: username
                    }).then(function() {
                        var displayName = user.displayName;
                        console.log('updated name');
                        $("#login-error").hide();
                        hideModal();
                        menuController.setActionButtons();
                    }, function(error) {
                        console.log('error updating name');
                        $("#login-error p").text(error.message);
                    });
                } else {
                    console.log('no user');
                }
            }, function(error) {
                console.log('error ' + error);
            });
        }).catch(function(error) {
            $("#login-error p").text(error.message);
		});
        
    }
    
    var setUpModal = function () {
        var modal = $('#loginModal').get(0);
        // Get the <span> element that closes the modal
        var span = $('#loginModal .close-button').get(0);
        
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

    var switchLoginOrSignUp = function () {
        var isLoginShown = $('#log-in-form').is(":visible");
        if(isLoginShown) {
            $('#log-in-form').hide();
            $('#sign-in-form').show();
            $('#log-in-title').text("Sign Up");
        } else {
            $('#log-in-form').show();
            $('#sign-in-form').hide();
            $('#log-in-title').text("Login");
        }
        $("#login-error p").text('');
    };

    //the public API
    return {
        init: init,
        showModal: showModal,
        signOut: signOut
    };
})();