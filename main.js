/**
 * Function to reopen the layer table of contents
 */
function openNav() {
    console.log("clicked open");
    editing = false;
    console.log('editing:', editing);
    document.getElementById("panel_border").style.width = "350px";
    $("#map_border").css('background-color', '#999999');
    $("#panel_title").html('Lakenheath Fen');
    $("#map_title").html('');
}


/**
 * Function to hide the layer table of contents
 */
function closeNav() {
    console.log("clicked close");
    document.getElementById("panel_border").style.width = "0";
    $("#map_border").css('background-color', 'white');
    $("#panel_title").html('');
    $("#map_title").html('Lakenheath Fen');
}



(function() {
    'use strict';


    /**
     * Main function to instantiate a map object
     */
    function initialize() {
        map = L.map('map', {
            center: [52.4458, 0.5088],
            zoom: 13,
            minZoom: 12,
            zoomControl: false
        });
        L.Control.zoomHome().addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
    }

    /**
     * JSON for colors
     */
    var colorCodes = {
        'poi' : '#7574ff',
        'trails' : null,
        'servs' : '#ff7800',
        'publicrts' : null,
        'bndry' : null
    }

    // Form actions
    var api_key = 'zobgyDikeu3sJobXWpNMMQ';
    
    /**
     * Function for generating an SQL statement
     * that selects all features for a layer
     * @param layer CartoDB layer name
     * @returns {string} SQL Query statement
     */
    function get_sql_query(layer) {
        return 'SELECT * FROM ' + layer + '&api_key=' + api_key;
    }


    /**
     * Function to create a simple popup
     * @param feature Current feature
     * @param id Element ID for selected layer
     * @returns {L.popup} Popup object for the feature
     */
    function createPopup(feature, id) {
        // TODO make popup unique by layer and show everything

        var prop = feature.properties;
        if (id === 'poi'||id === 'public_t') {
            return L.popup().setContent('<p style="font-size:12px"><b>Name: </b>' + prop.name + '<br><b>Type: </b>' + prop.type + '</p>');
        } else if (id === 'trails'){
            return L.popup().setContent('<p style="font-size:12px"><b>Name: </b>' + prop.name + '</p>');
        } else if (id === 'observations'){
            return L.popup().setContent('<p style="font-size:12px"><b>Type: </b>' + prop.obs_type + '<br><b>Message: </b>' + prop.obs_msg+'</p>');
        } else {
            if (prop.type === null) {
                return L.popup().setContent('<p style="font-size:12px"><b>Type: </b>upland</p>');
            }
            return L.popup().setContent('<p style="font-size:12px"><b>Type: </b>' + prop.type + '</p>');
        }
    }


    /**
     * Function to build the HTML data for the current
     * layer's select box
     * @param final_set Set of unique features to populate the select box
     * @param id Element ID for the current layer
     */
    function build_query_combo(final_set, id) {
        var combo_html = '<select id="' + id + '_combo">';
        var middle = '<option value="" disabled selected style="display: none;">Filter Layer:</option>';
        var final_array = Array.from(final_set);
        
        for (var i in final_array) {
            // middle += final_set[i];
            middle += '<option value="' + final_array[i] + '">' + final_array[i] + "</option>";
        }
        combo_html += middle + "</select>";
        $(combo_html).appendTo("#" + id + '_div');
    }


    /**
     * Function to build the select box for the
     * currently checked layer
     * @param features All current features for the selected layer
     * @param id Element ID for the selected layer
     */
    function get_features(features, id) {
        console.log("new_layers: ", features, "ID: ",id); //get rows
        var query_set = new Set();
        features.forEach(function(feature) {
            //console.log(feature.properties);
            if (id === 'trails'||id === 'public_t') {
                query_set.add(feature.properties.name);
            } else if (id === 'poi'|| id === 'services') {
                    query_set.add(feature.properties.type);
            } else if (id === 'observations') {
                query_set.add(feature.properties.obs_type);
            } else {
                console.log("Error in set");
            }
        });
        build_query_combo(query_set, id);
    }


    /**
     * Main function to load data if a layer's
     * checkbox is checked
     * @param self Current checkbox object to pass to AJAX
     */
    function load_data(self) {
        $.getJSON(base_url + get_sql_query(self.id), function(data) {
            console.log(data.features); //Displays GeoJSON data

            // TODO Create dropdown options for querying
            get_features(data.features, self.id);

            // register select box onchange
            var combo_id = '#' + self.id + '_combo';
            $(combo_id).change(function() {
                filter_data(this, self.id);
            });

            var new_layers;
            var data_type = data.features[0].geometry.type;
            if (data_type === 'Point') {
                new_layers = L.geoJSON(data, {
                    onEachFeature: function (row, layer) {
                        layer.bindPopup(createPopup(row, self.id), {className: 'popup_data'});
                    },
                    id: self.id,
                    pointToLayer: function (feature, latlng) {
                        var geojsonMarkerOptions = {
                            radius: 8,
                            fillColor: colorCodes[self.id],
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        };
                        return L.circleMarker(latlng, geojsonMarkerOptions);
                    }
                });
            } else if (data_type === 'MultiLineString') {
                new_layers = L.geoJSON(data, {
                    onEachFeature: function (row, layer) {
                        layer.bindPopup(createPopup(row, self.id), {className: 'popup_data'});
                    },
                    id: self.id,
                });
            } else if (data_type === 'Polygon' || data_type === 'MultiPolygon') {
                new_layers = L.geoJSON(data, {
                    onEachFeature: function (row, layer) {
                        layer.bindPopup(createPopup(row, self.id));
                    },
                    id: self.id,
                    style: function (feature) { 
                        return {color: "#ff6689"};
                        }
                    }
                );
            }
            console.log(self.id);
            new_layers.addTo(map);
        });
    }


    /**
     * Layer checkbox events and logic
     */
    var base_url = 'https://knelson4.carto.com/api/v2/sql?format=GeoJSON&q=';
    $("input:checkbox").change(function() {
        console.log('ID: ' + this.id);

        if ($(this).is(":checked")) {
            console.log($('#' + this.id).is(':checked'));
            var self = this;
            load_data(self);
        } else {
            console.log($('#' + this.id).is(':checked'));
            remove_data(this.id);

            // remove combo boxes
            $('#' + this.id + '_combo').remove();

        }
    });


    /**
     * Remove the layer associated with the
     * checkbox that was unchecked
     */
    function remove_data(id) {
        var layer_list = map._layers;
        for (var layer in layer_list) {
            if (layer_list[layer].options.id === id) {
                map.removeLayer(layer_list[layer]);
            }
        }
    }


    /**
     * Same as load_data() but filters based on
     * the select box value for the layer checked
     * @param select_box Current layer's select box object
     * @param id Element ID for the current layer that is checked
     */
    function filter_data(select_box, id) {
        // remove all current data for the selected layer
        remove_data(id);
        console.log("in filter");

        $.getJSON(base_url + get_sql_query(id), function(data) {
            var data_type = data.features[0].geometry.type;
            var new_layers;
            if (data_type === 'Point') {
                new_layers = L.geoJSON(data, {
                    onEachFeature: function (row, layer) {
                        layer.bindPopup(createPopup(row, id), {className: 'popup_data'});
                    },
                    id: id,
                    pointToLayer: function (feature, latlng) {
                        var geojsonMarkerOptions = {
                            radius: 8,
                            fillColor: colorCodes[id],
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        };
                        return L.circleMarker(latlng, geojsonMarkerOptions);
                    },
                    filter: function(feature, layer) {
                        if (id==='observations'){
                            return feature.properties.obs_type === select_box.value;
                        } else {
                            return feature.properties.type === select_box.value;
                        };
                    }
                });
            } else if (data_type === 'MultiLineString') {
                new_layers = L.geoJSON(data, {
                    onEachFeature: function (row, layer) {
                        layer.bindPopup(createPopup(row, id));
                    },
                    id: id,
                    style: function (feature) {
                            return {color: "#ff6689"};
                    },
                    filter: function(feature, layer) {
                            return feature.properties.name === select_box.value;
                        }
                    });
            }
            console.log(id);
            new_layers.addTo(map);
        });
    }


    $(document).ready(initialize());
})();