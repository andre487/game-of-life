require(
    [
        'lifeMap', 'mapView', 'game', 'saves', 'messages',
        '../bower_components/bignum/biginteger.js'
    ],
    function (LifeMap, MapView, GameOfLife, saves, messages) {
        'use strict';
        var universeSize = BigInteger(2).pow(64),
            lifeMap = new LifeMap(universeSize, universeSize),
            mapView = new MapView('map', lifeMap),
            game = new GameOfLife(lifeMap);
        mapView.render();
        mapView.beginInput();

        var startButton = document.getElementById('start'),
            stopButton = document.getElementById('stop'),
            saveButton = document.getElementById('save'),
            loadButton = document.getElementById('load');

        game.onStart(function () {
            startButton.setAttribute('disabled', 'disabled');
            stopButton.removeAttribute('disabled');
            loadButton.setAttribute('disabled', 'disabled');
            mapView.endInput();
        });
        game.onStop(function () {
            stopButton.setAttribute('disabled', 'disabled');
            startButton.removeAttribute('disabled');
            if (saves.saveExists()) {
                loadButton.removeAttribute('disabled');
            }
            if (game.state() == GameOfLife.state.COMPLETED) {
                messages.showMessage('The game is completed!');
            }
            mapView.beginInput();
        });
        game.onRound(mapView.render.bind(mapView));

        startButton.onclick = function () {
            game.run();
        };

        stopButton.onclick = function () {
            game.stop();
        };

        saveButton.onclick = function () {
            saves.saveGame(lifeMap);
        };

        loadButton.onclick = function () {
            saves.loadGame(lifeMap);
        };

        if (saves.saveExists()) {
            loadButton.removeAttribute('disabled');
            messages.showMessage('You have a saved game');
        }

        window.addEventListener('mousewheel', function (event) {
            event.preventDefault();
        }, true);

        window.addEventListener('error', function (event) {
            messages.showError('An error has occurred: ' + event.error.toString());
        });
    }
);
