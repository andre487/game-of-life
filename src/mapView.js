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

        this._cellsHorizontalOffset = Math.floor((this._allCellsByHorizontal - this._cellsByHorizontal) / 2);
        this._cellsVerticalOffset = Math.floor((this._allCellsByVertical - this._cellsByVertical) / 2);

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
        var i = this._cellsVerticalOffset,
            m = i + this._cellsByVertical,
            j, n;
        for (; i < m; ++i) {
            j = this._cellsHorizontalOffset;
            n = j + this._cellsByHorizontal;
            for (; j < n; ++j) {
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
        this._toggleCellState(cell.top, cell.left);
    };

    MapView.prototype._getCellByClientCoordinates = function (clientX, clientY) {
        return {
            top: this._cellsVerticalOffset + Math.floor((clientY - this._canvasRect.top) / MapView.CELL_HEIGHT),
            left: this._cellsHorizontalOffset + Math.floor((clientX - this._canvasRect.left) / MapView.CELL_WIDTH)
        };
    };

    MapView.prototype._setCellState = function (i, j, isAlive) {
        this._lifeMap.state(i, j, isAlive);
        var rX = (j - this._cellsHorizontalOffset) * MapView.CELL_WIDTH,
            rY = (i - this._cellsVerticalOffset) * MapView.CELL_HEIGHT;
        if (isAlive) {
            this._context.fillRect(rX, rY, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
        } else {
            this._context.clearRect(rX, rY, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
            this._context.strokeRect(rX, rY, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
        }
    };

    MapView.prototype._toggleCellState = function (i, j) {
        var isAlive = !this._lifeMap.state(i, j);
        this._setCellState(i, j, isAlive);
    };

    return MapView;
});
