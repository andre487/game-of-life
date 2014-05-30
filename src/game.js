require(
    ['lifeMap.js', 'mapView.js'],
    function (LifeMap, MapView) {
        'use strict';
        var mapSize = 1024,
            //mapSize = Math.pow(2, 64),
            lifeMap = new LifeMap(mapSize, mapSize),
            mapView = new MapView('map', lifeMap);
        mapView.render();
        mapView.beginInput();
    }
);
