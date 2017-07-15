var loginApp =  angular.module('loginApp', []);

loginApp.controller('loginController', ['$scope', '$http', function($scope,$http) {
    
    $scope.init = function(){
        console.log("OOPS");
        $scope.username = "";
        $scope.password = "";
        $scope.message = "";
    }

    $scope.createUser =  function(){
        // var username = $('#txtUserName').val();
        // var password = $('#txtPassword').val();
        $scope.message = "";
        $('#pMessage').html('');
        var obj = {};
        obj.email = $scope.username;
        obj.password = $scope.password;
        $.ajax({
            url: '/User',
            type: 'POST',
            async: true,
            dataType: 'json',
            contentType: "application/json",
            data: JSON.stringify({data: obj}),
            success: function(successResponse){
                console.log(successResponse);
                $scope.message = "";
                $('#pMessage').html('User Created, Login to continue!');
                $('#btnLogin').css('display','block');
                $('#btnRegister').css('display','none');
            },
            error: function (errorResponse){
                if(errorResponse.responseText == "User Already exists"){
                    $('#pMessage').html('User Already exists');
                }
                //alert("OOPS!! Something went wrong!");
                console.log(errorResponse);
            }
        });
    };

    $scope.registerUser = function(){
        $('#btnLogin').css('display','none');
        $('#btnRegister').css('display','block');
        $scope.message="";
        $('#pMessage').html('');
    };

    $scope.createCookie = function(name, value, days){
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    };

    $scope.getUser = function(){
        // var username = $('#txtUserName').val();
        // var password = $('#txtPassword').val();
        if($scope.username == "" || $scope.password == ""){
            alert("Please Enter correct credentials");
        }else{
            $scope.message = "";
            $('#pMessage').html('');
            $.ajax({
                url: '/User?email='+$scope.username +'&password='+ $scope.password,
                type: 'GET',
                async: true,
                dataType: 'json',
                success: function(successResponse){
                    var userid = successResponse[0].user_id;
                    $scope.createCookie("userId",userid, 90);
                    location.href="/booking";
                    console.log(successResponse);
                },
                error: function (errorResponse){
                    alert("OOPS!! Something went wrong!");
                    console.log(errorResponse);
                }
            });
        }
    }   
}]);
