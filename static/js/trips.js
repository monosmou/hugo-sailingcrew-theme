(function ( $ ) {

    var styles = [
        {
            'featureType': 'landscape', 'stylers': [{'saturation': -100}, {'lightness': 65}, {'visibility': 'on'}]
        }, {
            'featureType': 'poi', 'stylers': [{'saturation': -100}, {'lightness': 51}, {'visibility': 'simplified'}]
        }, {
            'featureType': 'road.highway', 'stylers': [{'saturation': -100}, {'visibility': 'simplified'}]
        }, {
            'featureType': 'road.arterial', 'stylers': [{'saturation': -100}, {'lightness': 30}, {'visibility': 'on'}]
        }, {
            'featureType': 'road.local', 'stylers': [{'saturation': -100}, {'lightness': 40}, {'visibility': 'on'}]
        }, {
            'featureType': 'transit', 'stylers': [{'saturation': -100}, {'visibility': 'simplified'}]
        }, {
            'featureType': 'administrative.province', 'stylers': [{'visibility': 'off'}]
        }, {
            'featureType': 'water', 'elementType': 'labels', 'stylers': [{'visibility': 'on'}, {'lightness': -25}, {'saturation': -100}]
        }, {
            'featureType': 'water', 'elementType': 'geometry', 'stylers': [{'hue': '#ffff00'}, {'lightness': -25}, {'saturation': -97}]
        }
    ];

    var initMap = function(el) {
        return new google.maps.Map(
            el,
            {
                mapTypeId: google.maps.MapTypeId.SATELLITE,
                heading: 120,
                rotateControl: true,
                zoom: 6,
                center: {lat: (36.60+36.45)/2, lng: (27.775+28.227)/2},
                zoomControl: false,
                zoomControlOpt: {
                    style: 'SMALL',
                    position: 'TOP_LEFT'
                },
                rotateControlOptions: {
                    heading: 120
                },
                panControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                overviewMapControl: false,
                scrollwheel: false,
                draggable: true,
                styles: styles
            }
        );
    };

    var location = document.getElementById('location');
    var $tracks = $('a.kml-track', location);
    var map = initMap(location);
    $tracks.each(function(i,o) {
        var layer = new google.maps.KmlLayer({
            url: o.href,
            map: map
        });
    });

    // slide in the map
    var $body = $('body');
    var $container = $('.location-container');
    var $location = $(location);
    $body.addClass('with-locations');

    var adjustMapSize = function() {
        var h = $(window).height();
        if ($body.hasClass('large-map')) {
            //$container.height(h*0.67);
            $location.height(h*0.67);
        } else {
            //$container.height(h/4);
            $location.height(h/4);
        }
    };

    // toggle map size on click
    var $handlebar = $('#timemapslider');
    $handlebar.bind('click touch', function(event) {
        $body.toggleClass('large-map');
        adjustMapSize();
        google.maps.event.trigger(map, "resize");
    });

    // set initial small size
    adjustMapSize();
}( jQuery ));
