// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require rails-ujs
//= require turbolinks
//= require_tree .

function setColors() {
    var vehicles = $('.vehicle-container');
    for (var i = 0; i < vehicles.length; i++) {
        if (!addUpNaNString($(vehicles[i]).css('background-color')) || $(vehicles[i]).hasClass('white')){
            $(vehicles[i]).addClass('rainbow-effect');
            $(vehicles[i]).removeClass('lighten-2');
        }
    }
    console.log(addUpNaNString($(vehicles[0]).css('background-color')))
}

function addUpNaNString(st){
    var counter = 0;
    for(var i = 0; i < st.length; i++){
        if (!isNaN(st[i]) && st[i] !== ' '){
            counter += parseInt(st[i]);
        }
    }
    console.log(st)
    return counter;
}

// load stars on review index
function loadRatings() {
    var ratings = $(".review-rating")
    for (var i = 0; i < ratings.length; i++) {
        var rating = $(ratings[i])
        rating.rateYo({
            rating: rating.attr('value'),
            readOnly: true
        });
    }
}

var currentSearch = "make"
$(document).ready(function () {
    // create fixed table headers
    console.log($('.navbar-fixed').css("height"));
    $('table.vehicle-table').floatThead({
        position: 'fixed',
        scrollingTop: $('.navbar-fixed').height(),
        top: $('.navbar-fixed').height(),
        scrollContainer: true,

    });
    // get vehicles based on search condition
    $('body').on('click', '.v-headers > tr > th', function(e){
        var url = window.location.origin + '/vehicles';
        var data = new Object;
        var method = 'GET'
        data.search_string = $(this).html().toLowerCase();
        if (currentSearch == data.search_string){
            data.backwards = "true"
        } else {
            data.backwards = "false"
        }
        currentSearch = data.search_string
        $.ajax({
            url: url,
            data: data,
            method: method
        }).done(function(res){
            $('.v-container').html(res);
        })
    })
    
})