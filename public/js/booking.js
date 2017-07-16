/* 
    Funding Society TT Booking - Booking JS
    Version: 1.0
    Author: Anurag Mishra
    Dated: Sat, 15 Jul 2017 12:50 GMT
*/

var bookingApp =  angular.module('bookingApp', []);

bookingApp.controller('bookingController', ['$scope','$http', function($scope, $http) {

    $scope.range = [];
    $scope.rangeHightLights =[];
    $scope.bar={};//Map for storing time unit
    $scope.startTime;
    $scope.dataSet=[];
    $scope.constSliderId = "#slider";
    $scope.constSliderClass = ".slider";
    $scope.constLblValueId = "#lblValue";
    $scope.constDpDateId = "#dpDate";
    $scope.constDvListBookingId = "#dvListBooking";
    $scope.constDvCreateBookingId = "#dvCreateBooking";
    $scope.constBookingsId = "#bookings";
    $scope.constDurationId = "#duration";

    /**
     * Function to initialize slider with empty values and marks slide event
     */
    $scope.initSlider = function(){
        $($scope.constSliderId).slider({
            id: 'slider',
            min: 0,
            max: 1440,
            step: 1,
            value: 14,
            rangeHighlights: $scope.rangeHightLights
        });
        $($scope.constSliderClass).on("change", function(sliderValue) {
            $($scope.constLblValueId).html($scope.convertNumberToTime(sliderValue.value.newValue));
            $scope.startTime = sliderValue.value.newValue;
        });
    };

    /**
     * Constructor function to initialize the App
     */
    $scope.init = function(){
        try{
            $scope.convertRangeToRangeHighLights();
            $scope.makeEmptyBar();
            $scope.createMapFromRange();
            $scope.initSlider();
            $($scope.constDpDateId).change(function(){
                $scope.getBookingByDate();
            });
            $scope.getMyBookings();
            $('#bookings tbody').on( 'click', 'tr', function () {
                if ( $(this).hasClass('selected') ) {
                    $(this).removeClass('selected');
                }
                else {
                    $scope.table.$('tr.selected').removeClass('selected');
                    $(this).addClass('selected');
                }
            });
            $scope.initDatePicker();
        }
        catch(ex){
            console.log("Exception while initializing the App");
        }
    };

    $scope.initDatePicker = function(){
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        if(dd<10){
                dd='0'+dd
            } 
            if(mm<10){
                mm='0'+mm
            } 

        today = yyyy+'-'+mm+'-'+dd;
        document.getElementById("dpDate").setAttribute("min", today);
    }

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
        //check with other bookings
        for(var i= $scope.startTime;i<$scope.startTime+duration;i++){
            if($scope.bar[i] == 1){
                console.log("Invalid");
                return false;
            }
        }

        //this code is for checking if user tries to book within 60 minutes of his booking
        var d = $scope.dataSet;
        for(var item in d){
            if(d[item][1] == $($scope.constDpDateId).val()){
                var itemDuration = parseInt(d[item][3].split(' ')[0]);
                var endTime = $scope.convertTimeToNumber(d[item][2])+itemDuration;
                if(endTime < $scope.startTime){
                    if($scope.startTime - endTime < 60){
                        return false;
                    }
                }
                if($scope.convertTimeToNumber(d[item][2]) > ($scope.startTime + duration)){
                    if($scope.convertTimeToNumber(d[item][2]) - ($scope.startTime + duration) < 60){
                        return false;
                    }
                }
            }
        }
        console.log("Valid");
        return true;
    };



    $scope.recreateSlider = function(){
        $scope.makeEmptyBar();
        $scope.createMapFromRange();
        $scope.convertRangeToRangeHighLights();
        $($scope.constSliderId).slider();
        $($scope.constSliderId).slider('destroy', true);
        $scope.initSlider();
    }

    /**
     * Function for fetching booking cooresponding to a particular date
     */
    $scope.getBookingByDate =  function(){
        var bookingDate = $($scope.constDpDateId).val();
        $.ajax({
            url: '/Booking/Date?bookingDate=' + bookingDate,
            type: 'GET',
            async: true,
            dataType: 'json',
            success: function(data){
                var success = data.message;
                $scope.range = [];
                for(var item in success){
                    $scope.range.push({'start':success[item].start_time, 'end': success[item].start_time+ success[item].duration});
                }
                $scope.recreateSlider();
                console.log(success);
            },
            error: function (error){
                if(error.responseJSON.error){
                    alert("Can't fetch bookings for this date!");
                    console.log(error);
                }
            }
        });
    };

    /**
     * Create booking for a paticular User
     */
    $scope.createBooking = function(){
        if($($scope.constDpDateId).val() == ""){
            alert("Please choose a date to book!");
            return;
        }
        if($scope.validateDuration()){
            var duration = parseInt($($scope.constDurationId).val());
            var flag = $scope.checkIfValidChoice(duration );
            if(flag){
                var bookingDate = $($scope.constDpDateId).val();
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
                    success: function(data){
                        $scope.showListContainer();
                        $scope.getMyBookings();
                        console.log(data);
                        alert("Booking succesfull");
                    },
                    error: function (error){
                        if(error.responseJSON.error){
                            alert("Booking unsuccesfull");
                            console.log(errorResponse);
                        }
                    }
                });
            }else{
                alert("Please provide correct combination for booking");
            }
        }else{
            alert("Please select correct duration");
        }
    };


    $scope.validateDuration = function (){
        var val =  $($scope.constDurationId).val();
        if(val <10 || val > 60){
            return false;
        }
        return true;
    };

    /**
     * Helper functon to convert Number to Time
     */
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

    $scope.convertTimeToNumber = function(time){
        var hours = time.split(':')[0];
        hours =60* parseInt(hours);
        min = parseInt(time.split(':')[1]);
        return(hours+min);
    }

    /**
     * Function to logout user from the application
     */
    $scope.logoutUser = function (){
        document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        location.href = '/';
    };

    /**
     * Function to fetch all bookings from database for a particular User
     */
    $scope.getMyBookings = function (){
        var userId = $scope.readCookie('userId');
        $scope.dataSet = [];
        $.ajax({
            url: '/Booking/User?userId=' + userId,
            type: 'GET',
            async: false,
            dataType: 'json',
            success: function(data){
                var success= data.message;
                for(var item in success){
                    var obj = [];
                    obj.push(success[item].id);
                    obj.push(success[item].date);
                    obj.push($scope.convertNumberToTime(success[item].start_time));
                    obj.push(success[item].duration + " Minutes");
                    obj.push(success[item].created_at);
                    $scope.dataSet.push(obj);
                }
                $scope.initDataTable();
            },
            error: function (error){
                if(error.responseJSON.error){
                    alert("Error while fetching booking!");
                    console.log(error);
                }
            }
        });    
    };

    /**
     * Function to delete selected booking from database
     */
    $scope.deleteBooking= function(){
        var data = $scope.table.row('.selected').data();
        var bookingId = data[0];
        $.ajax({
            url: '/Booking?bookingId='+bookingId,
            type: 'DELETE',
            async: true,
            dataType: 'json',
            contentType: "application/json",
            success: function(data){
                $scope.table.row('.selected').remove().draw( false );
                console.log(data);
                alert("Deleted succesfull");
            },
            error: function (error){
                if(error.responseJSON.error){
                    alert("Deleting unsuccesfull");
                    console.log(error);
                }
            }
        });
    };

    /**
     * Function to initialize data table
     */
    $scope.initDataTable = function (){
        try{
            $scope.table= null;
            //detroying existing dataTable
            $($scope.constBookingsId).dataTable().fnDestroy();

            //creating newer dataTable
            $scope.table = $($scope.constBookingsId).DataTable( {
                "paging":   false,
                "ordering": false,
                "info":     false,
                "scrollY":  '50vh',
                "scrollCollapse": true,
                data: $scope.dataSet,
                "columnDefs": [
                    {
                        "targets": [ 4 ],
                        "visible": false,
                        "searchable": false
                    }
                ],
                columns: [
                    { title: "Booking Id" },
                    { title: "Date" },
                    { title: "Start Time" },
                    { title: "Duration" },
                    {title: "Created At"}
                ]
            });
        }
        catch(ex){
            console.log("Exception while initializing Data table");
        }
    }

    /**
     * Displays container for creating new booking
     */
    $scope.showCreateContainer = function(){
        $($scope.constDpDateId).val("");
        $($scope.constDurationId).val("");
        $($scope.constLblValueId).html("");
        $scope.range=[];
        $scope.rangeHightLights=[];
        $scope.recreateSlider();
        $scope.startTime=0;
        $($scope.constDvListBookingId).css('display','none');
        $($scope.constDvCreateBookingId).css('display','block');
    }

    /**
     * Displays container for bookings List
     */
    $scope.showListContainer = function(){
        $($scope.constDvListBookingId).css('display','block');
        $($scope.constDvCreateBookingId).css('display','none');
    }

}]);