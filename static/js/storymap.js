(function ( $ ) {
    var initPhotoSwipeFromDOM = function(gallerySelector) {

        // parse slide data (url, title, size ...) from DOM elements
        // (children of gallerySelector)
        var parseThumbnailElements = function(el) {
            var thumbElements = el.getElementsByTagName('figure'),
                numNodes = thumbElements.length,
                items = [],
                figureEl,
                linkEl,
                size,
                item;

            for(var i = 0; i < numNodes; i++) {

                figureEl = thumbElements[i]; // <figure> element

                // include only element nodes
                if(figureEl.nodeType !== 1) {
                    continue;
                }

                linkEl = figureEl.children[0]; // <a> element

                size = linkEl.getAttribute('data-size').split('x');

                // create slide object
                item = {
                    src: linkEl.getAttribute('href'),
                    w: parseInt(size[0], 10),
                    h: parseInt(size[1], 10)
                };



                if(figureEl.children.length > 1) {
                    // <figcaption> content
                    item.title = figureEl.children[1].innerHTML;
                }

                if(linkEl.children.length > 0) {
                    // <img> thumbnail element, retrieving thumbnail url
                    item.msrc = linkEl.children[0].getAttribute('src');
                }

                item.el = figureEl; // save link to element for getThumbBoundsFn
                items.push(item);
            }

            return items;
        };

        // find nearest parent element
        var closest = function closest(el, fn) {
            return el && ( fn(el) ? el : closest(el.parentNode, fn) );
        };

        // triggers when user clicks on thumbnail
        var onThumbnailsClick = function(e) {
            e = e || window.event;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;

            var eTarget = e.target || e.srcElement;

            // find root element of slide
            var clickedListItem = closest(eTarget, function(el) {
                return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
            });

            if(!clickedListItem) {
                return;
            }

            // find index of clicked item by looping through all child nodes
            // alternatively, you may define index via data- attribute
            var clickedGallery = clickedListItem.parentNode,
                childNodes = clickedListItem.parentNode.getElementsByTagName('figure'),
                numChildNodes = childNodes.length,
                nodeIndex = 0,
                index;

            for (var i = 0; i < numChildNodes; i++) {
                if(childNodes[i].nodeType !== 1) {
                    continue;
                }

                if(childNodes[i] === clickedListItem) {
                    index = nodeIndex;
                    break;
                }
                nodeIndex++;
            }



            if(index >= 0) {
                // open PhotoSwipe if valid index found
                openPhotoSwipe( index, clickedGallery );
            }
            return false;
        };

        // parse picture index and gallery index from URL (#&pid=1&gid=2)
        var photoswipeParseHash = function() {
            var hash = window.location.hash.substring(1),
                params = {};

            if(hash.length < 5) {
                return params;
            }

            var vars = hash.split('&');
            for (var i = 0; i < vars.length; i++) {
                if(!vars[i]) {
                    continue;
                }
                var pair = vars[i].split('=');
                if(pair.length < 2) {
                    continue;
                }
                params[pair[0]] = pair[1];
            }

            if(params.gid) {
                params.gid = parseInt(params.gid, 10);
            }

            if(!params.hasOwnProperty('pid')) {
                return params;
            }
            params.pid = parseInt(params.pid, 10);
            return params;
        };

        var openPhotoSwipe = function(index, galleryElement, disableAnimation) {
            var pswpElement = document.getElementById('photoswipe'),
                gallery,
                options,
                items;

            items = parseThumbnailElements(galleryElement);

            // define options (if needed)
            options = {
                index: index,

                // define gallery index (for URL)
                galleryUID: galleryElement.getAttribute('data-pswp-uid'),

                getThumbBoundsFn: function(index) {
                    // See Options -> getThumbBoundsFn section of documentation for more info
                    var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                        pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                        rect = thumbnail.getBoundingClientRect();

                    return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
                }

            };

            if(disableAnimation) {
                options.showAnimationDuration = 0;
            }

            // Pass data to PhotoSwipe and initialize it
            gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
        };

        // loop through all gallery elements and bind events
        var galleryElements = document.querySelectorAll( gallerySelector );

        for(var i = 0, l = galleryElements.length; i < l; i++) {
            galleryElements[i].setAttribute('data-pswp-uid', i+1);
            galleryElements[i].onclick = onThumbnailsClick;
        }

        // Parse URL and open gallery if it contains #&pid=3&gid=1
        var hashData = photoswipeParseHash();

        if(hashData.pid > 0 && hashData.gid > 0) {
            openPhotoSwipe( hashData.pid - 1 ,  galleryElements[ hashData.gid - 1 ], true );
        }
    };

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

    var photoswipe = document.getElementById('photoswipe');
    var photoswipeContainer = photoswipe.parentNode;
    var storymap = document.getElementById('storymap');
    var container = document.createElement('div');
    container.setAttribute('class', 'storymap-container');

    var timebar = document.createElement('div');
    timebar.setAttribute('class', 'storymap-timebar');

    var draghandle = document.createElement('i');
    draghandle.setAttribute('class', 'storymap-icon storymap-icon-draghandle fa fa-bars');
    draghandle.setAttribute('aria-hidden', 'true');
    timebar.appendChild(draghandle);

    var resize = document.createElement('i');
    resize.setAttribute('class', 'storymap-icon storymap-icon-resize fa fa-angle-double-up');
    resize.setAttribute('aria-hidden', 'true');
    timebar.appendChild(resize);

    container.appendChild(timebar);

    var map = document.createElement('div');
    map.setAttribute('class', 'storymap-map');
    container.appendChild(map);

    var googleMap = initMap(map);
    var layers = [];
    for (var i=0;i<storymap.childNodes.length;i++) {
        var child = storymap.childNodes[i];
        if (typeof(child.href) != 'undefined') {
            layers[layers.length] = new google.maps.KmlLayer({url: child.href, map: googleMap});
        }
    }
    storymap.appendChild(container);

    var body = document.getElementsByTagName('body')[0];
    body.classList.add('with-storymap');

    var menu = document.getElementById('mainNav');

    var resizeClasses = ['fa-angle-double-down', 'fa-angle-double-up'];
    var adjustResizeIcon = function(ratio) {
        var id = ratio > 0.5 ? 0 : 1;
        if (!resize.classList.contains(resizeClasses[id])) {
            resize.classList.remove(resizeClasses[1-id]);
            resize.classList.add(resizeClasses[id]);
        }
    };

    var adjustMapSize = function(k) {
        var max=window.innerHeight || body.clientHeight;
        if (k > max-menu.offsetHeight) k = max-menu.offsetHeight;

        storymap.style.height = k + 'px';
        map.style.height = k + 'px';
        $('.pswp__scroll-wrap').css({
            'height': (max - k - timebar.offsetHeight - menu.offsetHeight)+'px',
            'top': menu.offsetHeight+'px'
        });

        google.maps.event.trigger(map, "resize");

        adjustResizeIcon( k/max  );
    };

    var toggleMapSize = function(event) {
        var newh = (resize.classList.contains(resizeClasses[0])) ? 0 : 1000;
        adjustMapSize(newh);
    };

    resize.addEventListener('click', toggleMapSize, false);


    var makeDraggable = function(el) {
        window.onload = addListeners;

        function pauseEvent(e) {
            if(e.stopPropagation) e.stopPropagation();
            if(e.preventDefault) e.preventDefault();
            e.cancelBubble=true;
            e.returnValue=false;
            return false;
        }

        function addListeners() {
            el.addEventListener('mousedown', mouseDown, false);
            window.addEventListener('mouseup', mouseUp, false);
            el.addEventListener('click', clickProtection, false);

        }

        var dragCnt = 0;
        function clickProtection(e) {
            if (dragCnt>1) {
                return pauseEvent(e);
            }
        }

        function mouseUp(e) {
            e.preventDefault();
            window.removeEventListener('mousemove', divMove, true);
            pauseEvent(e);
        }

        var initial_mousey=false;
        var initial_offsetheight=false;
        function mouseDown(e) {
            dragCnt=0;
            initial_offsetheight = storymap.offsetHeight;
            initial_mousey = e.clientY;
            window.addEventListener('mousemove', divMove, true);
            pauseEvent(e);
        }

        function divMove(e) {
            var delta = initial_mousey - e.clientY;
            adjustMapSize(initial_offsetheight+delta);
            pauseEvent(e);
            dragCnt++;
        }
    };

    makeDraggable(timebar);

    // set initial small size
    adjustMapSize(200);

    initPhotoSwipeFromDOM('.gallery');
}( jQuery ));
