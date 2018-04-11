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
//= require materialize

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
    var uneditableRatings = $(".review-rating-ue")
    for (var i = 0; i < uneditableRatings.length; i++) {
        var rating = $(uneditableRatings[i]);
        rating.rateYo({
            rating: rating.attr('value'),
            readOnly: true
        }).on('rateyo.set', function (e, data) {
            $(this).attr('value', data.rating);
            $(this).next().val(data.rating);
        });
    }
    var ratings = $(".review-rating-new")
    for (var i = 0; i < ratings.length; i++) {
        var rating = $(ratings[i])
        rating.rateYo({
            rating: rating.attr('value')
        }).on('rateyo.set', function (e, data) {
            $(this).attr('value', data.rating);
            $(this).next().val(data.rating);
        });
    }
}

$(document).on('turbolinks:load', function () {
    console.log('ready');
    var currentSearch = "make"
    var searchVehicleBackwards = false
    // create fixed table headers
    $('table.vehicle-table').floatThead({
        position: 'fixed',
        scrollingTop: $('.navbar-fixed').height(),
        top: $('.navbar-fixed').height(),
        scrollContainer: true,
        
    });
    // get vehicles based on search condition
    $('body').on('click', '.v-headers > tr > th', function(e){
        console.log(searchVehicleBackwards);
        var url = window.location.origin + '/vehicles';
        var data = new Object;
        var method = 'GET';
        var that = this;
        data.search_string = $(this).attr('value');
        if (currentSearch == data.search_string && !searchVehicleBackwards){
            data.backwards = "true";
            searchVehicleBackwards = true;
        } else {
            data.backwards = "false";
            searchVehicleBackwards = false;
        }
        currentSearch = data.search_string;
        $.ajax({
            url: url,
            data: data,
            method: method
        }).done(function(res){
            $('.v-sort-info').html('')
            $('.v-container').html(res);
            if (searchVehicleBackwards){
                $(that).find('.v-sort-info').html('<i class="material-icons inline-icon">arrow_drop_up</i>');
            } else {
                $(that).find('.v-sort-info').html('<i class="material-icons inline-icon">arrow_drop_down</i>');
            }
        })
    })

    // show review content on click
    $('body').on('click', '.review-item', function(e){
        var id = $(this).attr('id').replace('review--', '');
        var details = $('#review-details--' + id);
        var hasClass = details.hasClass('hide')
        $('.review-item-details').addClass('hide');
        if (hasClass) {
            details.removeClass('hide');
        } else {
            details.addClass('hide');
        }
    })

    //submit rating
    $('body').on('submit', '.review-form', function(e){
        if ($('input[name="rating"]').val()){
            return true;
        } else {
            e.preventDefault();
            M.toast({ html: 'Please at least leave a rating' });
        }
    })
})