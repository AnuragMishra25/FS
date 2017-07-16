/* 
    Funding Society TT Booking - Login JS
    Version: 1.0
    Author: Anurag Mishra
    Dated: Sat, 15 Jul 2017 12:50 GMT
*/

var loginApp =  angular.module('loginApp', []);

loginApp.controller('loginController', ['$scope', '$http', function($scope,$http) {
    
    /**
     * Constructor function of the controller
     */
    $scope.init = function(){
        $scope.username = "";
        $scope.password = "";
        $scope.message = "";
        //storig strings for dom manipulation inside scope,and accessing everytime from here
        // so that if we change dom, only one place needs to change!
        $scope.pMessageId = "#pMessage";
        $scope.btnLoginId = "#btnLogin";
        $scope.aRegisterId = "#aRegister";
        $scope.aLoginId = "#aLogin";
        $scope.btnRegisterId = "#btnRegister";

    }

    /**
     * Creates New User by given username and password
     */
    $scope.createUser =  function(){
        $scope.message = "";
        $($scope.pMessageId).html('');
        var obj = {};
        obj.email = $scope.username.trim();
        obj.password = $scope.password.trim();
        try{
            if(obj.email == "" || obj.password == ""){
                alert("Please provide correct credentials");
            }else{
                $.ajax({
                    url: '/User',
                    type: 'POST',
                    async: true,
                    dataType: 'json',
                    contentType: "application/json",
                    data: JSON.stringify({data: obj}),
                    success: function(data){
                        console.log(data);
                        $scope.message = "";
                        $($scope.pMessageId).html('User Created, Login to continue!');
                        $($scope.pMessageId).css('color', 'green');
                        $scope.showLoginControl();
                    },
                    error: function (error){
                        if(error.responseJSON.error){
                            $($scope.pMessageId).html(error.responseJSON.message);
                            $($scope.pMessageId).css('color', 'red');
                        }
                        console.log(error);
                    }
                });
            }
        }
        catch(ex){
            console.log("Exeption occurred : "+ ex.toString());
            alert("OOPS! Something went wrong!")
        }
    };

    /**
     * Display control relevant to Register funtionality
     */
    $scope.showRegisterControls = function(){
        $($scope.btnLoginId).css('display','none');
        $($scope.aRegisterId).css('display','none');
        $($scope.aLoginId).css('display','block');
        $($scope.btnRegisterId).css('display','block');
    }

    /**
     * Display control relevant to Login funtionality
     */
    $scope.showLoginControl =  function(){
        $($scope.btnLoginId).css('display','block');
        $($scope.btnRegisterId).css('display','none');
        $($scope.aRegisterId).css('display','block');
        $($scope.aLoginId).css('display','none');
    }

    /**
     * starter function for register User
     */
    $scope.registerUser = function(){
        $scope.showRegisterControls();
        $scope.message="";
        $($scope.pMessageId).html('');
    };

    /**
     * Create cookie in the browser
     * @param {string} name - cookie name to be created
     * @param {string} value - value to be inserted in cookie
     * @param {number} days - expiry duration for the cookie.
     */
    $scope.createCookie = function(name, value, days){
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    };

    /**
     * Logins the user on the basis of username and password
     */
    $scope.getUser = function(){
        if($scope.username == "" || $scope.password == ""){
            alert("Please Enter correct credentials");
        }else{
            $scope.message = "";
            $($scope.pMessageId).html('');
            $.ajax({
                url: '/User?email='+$scope.username +'&password='+ $scope.password,
                type: 'GET',
                async: true,
                dataType: 'json',
                success: function(data){
                    var userid = data.message[0].user_id;
                    //creating cookie for next time auto login
                    $scope.createCookie("userId",userid, 90);
                    location.href="/booking";
                },
                error: function (error){
                    if(error.responseJSON.error){
                        alert("Wrong credentials!");
                        console.log(error);
                    }
                }
            });
        }
    }   
}]);
