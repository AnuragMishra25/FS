var range = [];
var rangeHightLights =[];
var bar={};
var startTime;
var dataSet=[];


// var bookingApp =  angular.module('bookingApp', []);

// bookingApp.controller('bookingController', ['$http', function($http) {


// }]);

function initSlider(){
    $('#slider').slider({
        id: 'slider',
        min: 0,
        max: 1440,
        // tooltip: 'always',
        step: 1,
        value: 14,
        rangeHighlights: rangeHightLights
    });
    $("#slider").on("change", function(sliderValue) {
        var hours = parseInt(sliderValue.value.newValue/60);
        var minutes = sliderValue.value.newValue%60;
        startTime = sliderValue.value.newValue;
        $('#lblValue').html(hours +":" + minutes);
    });
}

$(function () {
    convertRangeToRangeHighLights();
    $('#datetimepicker').datetimepicker({format: 'DD/MM/YYYY', minView : 2, pickTime: false});

    initSlider();

    makeEmptyBar();
    createMapFromRange();
});

function makeEmptyBar(){
    for(var i =0;i<1440;i++){
        bar[i] = 0;
    }
}

function createMapFromRange(){
    for(var item in range){
        for(var i= range[item].start; i<= range[item].end;i++){
            bar[i] = 1;
        }
    }
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function convertRangeToRangeHighLights(){
    for(var item in range){
        var obj = range[item];
        obj.class = "category1";
        rangeHightLights.push(obj);
    }
}

function checkIfValidChoice( duration){
    var start = startTime;
    for(var i= start;i<start+duration;i++){
        if(bar[i] == 1){
            console.log("Invalid");
            return false;
        }
    }
    console.log("Valid");
    return true;
}

function getBookingByDate(){
    var bookingDate = $('#dpDate').val();
    $.ajax({
        url: '/Booking/Date?bookingDate=' + bookingDate,
        type: 'GET',
        async: true,
        dataType: 'json',
        success: function(successResponse){
            for(var item in successResponse){
                range.push({'start':successResponse[item].start_time, 'end': successResponse[item].start_time+ successResponse[item].duration});
            }
            convertRangeToRangeHighLights();
            $("#slider").slider('destroy');
            initSlider();
            makeEmptyBar();
            createMapFromRange();
            console.log(successResponse);
            alert("Booking succesfull");
        },
        error: function (errorResponse){
            alert("Booking unsuccesfull");
            console.log(errorResponse);
        }
    });
}

function createBooking(){
    if(validateDuration()){
        var duration = parseInt($('#duration').val());
        var flag = checkIfValidChoice(duration );
        if(flag){
            var bookingDate = $('#dpDate').val();
            // var duration = $('#duration').val();
            var userId = readCookie("userId");
            var obj = {};
            obj.bookingDate = bookingDate;
            obj.startTime = startTime;
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
                    console.log(successResponse);
                    alert("Booking succesfull");
                },
                error: function (errorResponse){
                    alert("Booking unsuccesfull");
                    console.log(errorResponse);
                }
            });
        }else{
            alert("wrong bookin details");
        }
    }else{
        alert("Please select correct duration");
    }
}

function validateDuration(){
    var val =  $('#duration').val();
    if(val <10 || val > 60){
        return false;
    }
    return true;
}

function logoutUser(){
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.href = '/';
}

function getMyBookings(){
    var userId = readCookie('userId');
    $.ajax({
        url: '/Booking/User?userId=' + userId,
        type: 'GET',
        async: true,
        dataType: 'json',
        success: function(successResponse){
            dataSet=[];
            for(var item in successResponse){
                var obj = [];
                obj.push(successResponse[item].id);
                obj.push(successResponse[item].date);
                obj.push(successResponse[item].start_time);
                obj.push(successResponse[item].duration);
                dataSet.push(obj);
            }
            initDataTable();
        },
        error: function (errorResponse){
            alert("Booking unsuccesfull");
            console.log(errorResponse);
        }
    });    
}

function initDataTable(){
    //detroying existing dataTable
    $("#bookings").dataTable().fnDestroy();

    //creating newer dataTable
    $("#bookings").DataTable( {
        "paging":   false,
        "ordering": false,
        "info":     false,
        "scrollY":  '50vh',
        "scrollCollapse": true,
        data: dataSet,
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
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
        }
    } );

    $('#btnDelete').click( function () {
        table.row('.selected').remove().draw( false );
    } );
}
