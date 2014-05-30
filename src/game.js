require(
    ['lifeMap.js', 'mapView.js', 'life.js'],
    function (LifeMap, MapView, life) {
        'use strict';
        var mapSize = 1e3,
            //mapSize = Math.pow(2, 64),
            lifeMap = new LifeMap(mapSize, mapSize),
            mapView = new MapView('map', lifeMap);
        mapView.render();
        mapView.beginInput();

        var stopFlag = false,
            startButton = document.getElementById('start'),
            stopButton = document.getElementById('stop');
        startButton.onclick = function () {
            stopFlag = false;
            this.setAttribute('disabled', 'disabled');
            stopButton.removeAttribute('disabled');
            startGame();
        };

        stopButton.onclick = function () {
            stopFlag = true;
        };

        function startGame() {
            mapView.endInput();
            makeRound();

            function makeRound() {
                life.lifeRound(lifeMap)
                    .then(function () {
                        if (stopFlag === false) {
                            mapView.render();
                            makeRound();
                        } else {
                            stopButton.setAttribute('disabled', 'disabled');
                            startButton.removeAttribute('disabled');
                            mapView.beginInput();
                        }
                    });
            }
        }
    }
);
