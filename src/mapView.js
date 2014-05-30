define(function () {
    'use strict';
    var MapView = function (canvasId, lifeMap) {
        this._canvas = document.getElementById(canvasId);
        this._context = this._canvas.getContext('2d');
        this._context.fillStyle = '#333';
        this._context.strokeStyle = '#ccc';

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
        this._inputListener = this._inputListener.bind(this);

        this._state = MapView.state.INIT;
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
        this._context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
        var i, j;
        for (i = 0; i < this._cellsByVertical; ++i) {
            for (j = 0; j < this._cellsByHorizontal; ++j) {
                this._setCellState(i, j, this._lifeMap.state(i, j));
            }
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

    MapView.prototype.endInput = function () {
        if (this._state !== MapView.state.INPUT) {
            throw new Error('Input is not available');
        }
        this._state = MapView.state.RENDERED;
        this._canvas.removeEventListener('click', this._inputListener);
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
