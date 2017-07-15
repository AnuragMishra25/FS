var bookingApp =  angular.module('bookingApp', []);

bookingApp.controller('bookingController', ['$scope','$http', function($scope, $http) {

    $scope.range = [];
    $scope.rangeHightLights =[];
    $scope.bar={};
    $scope.startTime;
    $scope.dataSet=[];

    $scope.initSlider = function(){
        $('#slider').slider({
            id: 'slider',
            min: 0,
            max: 1440,
            step: 1,
            value: 14,
            rangeHighlights: $scope.rangeHightLights
        });
        $(".slider").on("change", function(sliderValue) {
            var hours = parseInt(sliderValue.value.newValue/60);
            var minutes = sliderValue.value.newValue%60;
            $scope.startTime = sliderValue.value.newValue;
            $('#lblValue').html(hours +":" + minutes);
        });
    };

    $scope.init = function(){
        $scope.convertRangeToRangeHighLights();
        $scope.makeEmptyBar();
        $scope.createMapFromRange();
        $scope.initSlider();
        $("#dpDate").change(function(){
            $scope.getBookingByDate();
        });
        $scope.getMyBookings();
    };

    $scope.makeEmptyBar = function(){
        for(var i =0;i<1440;i++){
            $scope.bar[i] = 0;
        }
    };

    $scope.createMapFromRange = function(){
        for(var item in $scope.range){
            for(var i= $scope.range[item].start; i<= $scope.range[item].end;i++){
                $scope.bar[i] = 1;
            }
        }
    };

    $scope.readCookie =  function(name){
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    };

    $scope.convertRangeToRangeHighLights = function(){
        $scope.rangeHightLights = [];
        for(var item in $scope.range){
            var obj = $scope.range[item];
            obj.class = "category1";
            $scope.rangeHightLights.push(obj);
        }
    };

    $scope.checkIfValidChoice = function(duration){
        for(var i= $scope.startTime;i<$scope.startTime+duration;i++){
            if($scope.bar[i] == 1){
                console.log("Invalid");
                return false;
            }
        }
        console.log("Valid");
        return true;
    };

    $scope.getBookingByDate =  function(){
        var bookingDate = $('#dpDate').val();
        $.ajax({
            url: '/Booking/Date?bookingDate=' + bookingDate,
            type: 'GET',
            async: true,
            dataType: 'json',
            success: function(successResponse){
                $scope.range = [];
                for(var item in successResponse){
                    $scope.range.push({'start':successResponse[item].start_time, 'end': successResponse[item].start_time+ successResponse[item].duration});
                }
                $scope.makeEmptyBar();
                $scope.createMapFromRange();
                $scope.convertRangeToRangeHighLights();
                $('#slider').slider();
                $("#slider").slider('destroy', true);
                $scope.initSlider();

                console.log(successResponse);
            },
            error: function (errorResponse){
                alert("OOPS Something went wrong!");
                console.log(errorResponse);
            }
        });
    };

    $scope.createBooking = function(){
        if($scope.validateDuration()){
            var duration = parseInt($('#duration').val());
            var flag = $scope.checkIfValidChoice(duration );
            if(flag){
                var bookingDate = $('#dpDate').val();
                // var duration = $('#duration').val();
                var userId = $scope.readCookie("userId");
                var obj = {};
                obj.bookingDate = bookingDate;
                obj.startTime = $scope.startTime;
                obj.duration = duration;
                obj.userId = userId;
                $.ajax({
                    url: '/Booking',
                    type: 'POST',
                    async: true,
                    dataType: 'json',
                    contentType: "application/json",
                    data: JSON.stringify({data: obj}),
                    success: function(successResponse){
                        $scope.getMyBookings();
                        $scope.showListContainer();
                        console.log(successResponse);
                        alert("Booking succesfull");
                    },
                    error: function (errorResponse){
                        alert("Booking unsuccesfull");
                        console.log(errorResponse);
                    }
                });
            }else{
                alert("wrong booking details");
            }
        }else{
            alert("Please select correct duration");
        }
    };

    $scope.validateDuration = function (){
        var val =  $('#duration').val();
        if(val <10 || val > 60){
            return false;
        }
        return true;
    };

    $scope.convertNumberToTime =  function(time){
        var hours = parseInt(time/60);
        if(hours < 10){
            hours = "0"+ hours;
        }
        var minutes = time%60;
        if(minutes < 10){
            minutes = "0"+ minutes;
        }
        return (hours +":" + minutes);
    }

    $scope.logoutUser = function (){
        document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        location.href = '/';
    };

    $scope.getMyBookings = function (){
        var userId = $scope.readCookie('userId');
        $scope.dataSet = [];
        $.ajax({
            url: '/Booking/User?userId=' + userId,
            type: 'GET',
            async: true,
            dataType: 'json',
            success: function(successResponse){
                for(var item in successResponse){
                    var obj = [];
                    obj.push(successResponse[item].id);
                    obj.push(successResponse[item].date);
                    obj.push($scope.convertNumberToTime(successResponse[item].start_time));
                    obj.push(successResponse[item].duration);
                    $scope.dataSet.push(obj);
                }
                $scope.initDataTable();
            },
            error: function (errorResponse){
                alert("Booking unsuccesfull");
                console.log(errorResponse);
            }
        });    
    };

    $scope.initDataTable = function (){
        //detroying existing dataTable
        $("#bookings").dataTable().fnDestroy();

        //creating newer dataTable
        $scope.table = $("#bookings").DataTable( {
            "paging":   false,
            "ordering": false,
            "info":     false,
            "scrollY":  '50vh',
            "scrollCollapse": true,
            data: $scope.dataSet,
            columns: [
                { title: "Booking Id" },
                { title: "Date" },
                { title: "Start Time" },
                { title: "Duration" }
            ]
        });

        $('#bookings tbody').on( 'click', 'tr', function () {
            if ( $(this).hasClass('selected') ) {
                $(this).removeClass('selected');
            }
            else {
                $scope.table.$('tr.selected').removeClass('selected');
                $(this).addClass('selected');
            }
        } );

        $('#btnDelete').click( function () {
            $scope.table.row('.selected').remove().draw( false );
        } );
    }

    $scope.showCreateContainer = function(){
        $('#dvListBooking').css('display','none');
        $('#dvCreateBooking').css('display','block');
    }

    $scope.showListContainer = function(){
        $('#dvListBooking').css('display','block');
        $('#dvCreateBooking').css('display','none');
    }

}]);