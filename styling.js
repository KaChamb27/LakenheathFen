/**
 * Styling of square border window by window size
 */
$("#form").css({
    'position': "absolute",
    // 'left': ($(window).width() - $('#panel').outerWidth())/5,
    // 'top': ($(window).height() - $('#panel').outerHeight())/2,
    'left': ($('#panel_border').width() - $('#panel').outerWidth())/2,
    'top': ($('#panel_border').height() - $('#panel').outerHeight())/2,
    'height': '90%',
    // 'width': 'calc(100% - ' + ($(window).width() - $('#panel').outerWidth())/4,
    'width': 'calc(100% - ' + ($('#panel_border').width() - $('#panel').outerWidth())/2,
});

$(window).resize(function() {
    console.log("resizing");
    // $("#form").css({
    //     'position': "absolute",
    //     'left': ($(window).width() - $('#panel').outerWidth())/5,
    //     'top': ($(window).height() - $('#panel').outerHeight())/2,
    //     'height': '90%',
    //     'width': 'calc(100% - ' + ($(window).width() - $('#panel').outerWidth())/4,
    // });
    $("#form").css({
        'position': "absolute",
        'left': ($('#panel_border').width() - $('#panel').outerWidth())/2,
        'top': ($('#panel_border').height() - $('#panel').outerHeight())/2,
        'height': '90%',
        'width': 'calc(100% - ' + ($('#panel_border').width() - $('#panel').outerWidth())/2,
    });
});
