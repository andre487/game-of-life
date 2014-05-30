define(function () {
    'use strict';
    var MapView = function (canvasId, lifeMap) {
        this._canvas = document.getElementById(canvasId);
        this._context = this._canvas.getContext('2d');
        this._canvasRect = this._canvas.getBoundingClientRect();
        this._lifeMap = lifeMap;

        this._canvasWidth = this._canvas.clientWidth;
        this._canvasHeight = this._canvas.clientHeight;
        this._allCellsByHorizontal = this._lifeMap.width();
        this._allCellsByVertical = this._lifeMap.height();

        this._cellsByHorizontal = Math.min(
            this._allCellsByHorizontal,
            Math.floor(this._canvasWidth / MapView.CELL_WIDTH)
        );
        this._cellsByVertical = Math.min(
            this._allCellsByVertical,
            Math.floor(this._canvasHeight / MapView.CELL_HEIGHT)
        );
        this._cellsOffsetTop = Math.floor((this._allCellsByVertical - this._cellsByVertical) / 2);
        this._cellsOffsetLeft = Math.floor((this._allCellsByHorizontal - this._cellsByHorizontal) / 2);

        this._inputListener = this._inputListener.bind(this);

        this._state = MapView.state.INIT;
        console.log('Map initialized', this);
    };

    MapView.state = {
        INIT: 'init',
        RENDERED: 'rendered',
        INPUT: 'input',
        LIFE: 'life'
    };
    MapView.CELL_WIDTH = 10;
    MapView.CELL_HEIGHT = 10;

    MapView.prototype.render = function () {
        this._context.fillStyle = '#666';
        this._context.strokeStyle = '#666';
        var x = 0,
            y = 0,
            i, j, m, n;
        for (i = 0, m = this._cellsByHorizontal; i < m; ++i) {
            for (j = 0, n = this._cellsByVertical; j < n; ++j) {
                this._context.strokeRect(x, y, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
                y += MapView.CELL_HEIGHT;
            }
            x += MapView.CELL_WIDTH;
            y = 0;
        }
        this._state = MapView.state.RENDERED;
    };

    MapView.prototype.beginInput = function () {
        if (this._state !== MapView.state.RENDERED) {
            throw new Error('Input is not available');
        }
        this._state = MapView.state.INPUT;
        this._canvas.addEventListener('click', this._inputListener);
    };

    MapView.prototype._inputListener = function (event) {
        if (this._state !== MapView.state.INPUT) {
            throw new Error('The map not into INPUT state');
        }
        var cell = this._getCellByClientCoordinates(event.clientX, event.clientY);
        this._toggleCellState(cell[0], cell[1]);
    };

    MapView.prototype._getCellByClientCoordinates = function (x, y) {
        return [
            Math.floor((x - this._canvasRect.left) / MapView.CELL_WIDTH),
            Math.floor((y - this._canvasRect.top) / MapView.CELL_HEIGHT)
        ];
    };

    MapView.prototype._setCellState = function (x, y, isAlive) {
        this._lifeMap.state(x, y, isAlive);
        var rX = x * MapView.CELL_WIDTH,
            rY = y * MapView.CELL_HEIGHT;
        if (isAlive) {
            this._context.fillRect(rX, rY, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
        } else {
            this._context.clearRect(rX, rY, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
            this._context.strokeRect(rX, rY, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
        }
    };

    MapView.prototype._toggleCellState = function (x, y) {
        var isAlive = !this._lifeMap.state(x, y);
        this._setCellState(x, y, isAlive);
    };

    return MapView;
});
