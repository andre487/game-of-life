require(
    ['lifeMap', 'mapView', 'game', '../bower_components/bignum/biginteger.js'],
    function (LifeMap, MapView, GameOfLife) {
        'use strict';
        var universeSize = BigInteger(2).pow(64),
            lifeMap = new LifeMap(universeSize, universeSize),
            mapView = new MapView('map', lifeMap),
            game = new GameOfLife(lifeMap);
        mapView.render();
        mapView.beginInput();

        game.onStart(function () {
            startButton.setAttribute('disabled', 'disabled');
            stopButton.removeAttribute('disabled');
            mapView.endInput();
        });
        game.onStop(function () {
            stopButton.setAttribute('disabled', 'disabled');
            startButton.removeAttribute('disabled');
            mapView.beginInput();
        });
        game.onRound(mapView.render.bind(mapView));

        var startButton = document.getElementById('start'),
            stopButton = document.getElementById('stop');
        startButton.onclick = function () {
            game.run();
        };
        stopButton.onclick = function () {
            game.stop();
        };

        window.addEventListener('mousewheel', function (event) {
            event.preventDefault();
        }, true);
    }
);
