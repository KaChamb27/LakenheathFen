$('#add_obs').click(function() {
    var selected_obs = $('#obs').val();
    console.log("obs: ", selected_obs);

    if (($('#obs').val() === undefined) || ($('#obs').val() === null)) {
        alert('Choose an observation type!');
    } else {
        L.DomUtil.addClass(map._container,'crosshair-cursor-enabled');
        closeNav();

        // toggle attribute to control map clicking
        editing = true;
        console.log('editing:', editing);

        var obsicon = L.icon({
            iconUrl: 'img/green-circle.png',
            iconSize:     [20, 20], // size of the icon
            iconAnchor:   [7, 5], // point of the icon which will correspond to marker's location
            popupAnchor:  [5, -5], // point from which the popup should open relative to the iconAnchor
            id: 'obs_location'
        });

        var obs_location;
        map.on('click', function(location) {
            if (editing) {
                tree_location = new L.marker(location.latlng, {
                    icon: obsicon,
                    draggable: true,
                    opacity: 1
                });
                var popup = '<b>Observation:</b> ' + $('#obs').val() + '<br><br><a id="popup_button">Remove</a>';
                tree_location.bindPopup(popup);
                tree_location.addTo(map);

                tree_location.on('popupopen', remove_user_point);

                editing = false;
                L.DomUtil.removeClass(map._container,'crosshair-cursor-enabled');
            }
        });
    }
});

function remove_user_point() {
    var marker = this;
    $("#popup_button:visible").click(function () {
        map.removeLayer(marker);
    });
}