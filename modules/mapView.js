define(
    ['../bower_components/bignum/biginteger.js'],
    function () {
        'use strict';
        /**
         * View for the life map, render cells status in the canvas
         * @param {String} canvasId
         * @param {LifeMap} lifeMap
         * @constructor
         */
        var MapView = function (canvasId, lifeMap) {
            var self = this;
            this._canvas = document.getElementById(canvasId);
            this._context = this._canvas.getContext('2d');
            this._context.fillStyle = '#333';
            this._context.strokeStyle = '#ccc';

            this._canvasRect = this._canvas.getBoundingClientRect();
            this._lifeMap = lifeMap;

            this._canvasWidth = this._canvas.clientWidth;
            this._canvasHeight = this._canvas.clientHeight;

            this._initMapData();
            this._lifeMap.addChangeListener(function () {
                self._initMapData();
                self.render();
            });

            this._inputListener = this._inputListener.bind(this);
            this._state = MapView.state.INIT;
        };

        //noinspection JSValidateTypes
        MapView.state = {
            INIT: 'init',
            RENDERED: 'rendered',
            INPUT: 'input',
            LIFE: 'life'
        };
        MapView.CELL_WIDTH = 8;
        MapView.CELL_HEIGHT = 8;

        MapView.prototype._initMapData = function () {
            this._allCellsByHorizontal = this._lifeMap.width();
            this._allCellsByVertical = this._lifeMap.height();

            this._cellsByHorizontal = Math.floor(this._canvasWidth / MapView.CELL_WIDTH);
            if (this._allCellsByHorizontal.compare(this._cellsByHorizontal) < 0) {
                this._cellsByHorizontal = this._allCellsByHorizontal.valueOf();
            }

            this._cellsByVertical = Math.floor(this._canvasHeight / MapView.CELL_HEIGHT);
            if (this._allCellsByVertical.compare(this._cellsByVertical) < 0) {
                this._cellsByVertical = this._allCellsByVertical.valueOf();
            }

            this._cellsHorizontalOffset = this._allCellsByHorizontal.subtract(this._cellsByHorizontal).divide(2);
            this._cellsVerticalOffset = this._allCellsByVertical.subtract(this._cellsByVertical).divide(2);
        };

        /**
         * View state
         * @returns {String}
         */
        MapView.prototype.state = function () {
            return this._state;
        };

        /**
         * Render the map view
         */
        MapView.prototype.render = function () {
            this._context.clearRect(0, 0, this._canvasWidth, this._canvasHeight);
            var bigI = this._cellsVerticalOffset,
                bigM = bigI.add(this._cellsByVertical),
                bigJ, bigN;
            for (; bigI.compare(bigM) < 0; bigI = bigI.add(BigInteger.ONE)) {
                bigJ = this._cellsHorizontalOffset;
                bigN = bigJ.add(this._cellsByHorizontal);
                for (; bigJ.compare(bigN) < 0; bigJ = bigJ.add(BigInteger.ONE)) {
                    this._setCellState(bigI, bigJ, this._lifeMap.isAlive(bigI, bigJ));
                }
            }
            if (this._state !== MapView.state.INPUT) {
                this._state = MapView.state.RENDERED;
            }
        };

        /**
         * Begin user input: in this mode user can set cells
         * into a universe
         */
        MapView.prototype.beginInput = function () {
            if (this._state !== MapView.state.RENDERED) {
                throw new Error('Input is not available');
            }
            this._state = MapView.state.INPUT;
            this._canvas.addEventListener('click', this._inputListener);
        };

        /**
         * End user input
         */
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
                top: this._cellsVerticalOffset.add((clientY - this._canvasRect.top) / MapView.CELL_HEIGHT),
                left: this._cellsHorizontalOffset.add((clientX - this._canvasRect.left) / MapView.CELL_WIDTH)
            };
        };

        MapView.prototype._setCellState = function (bigI, bigJ, isAlive) {
            this._lifeMap.isAlive(bigI, bigJ, isAlive);
            var rX = bigJ.subtract(this._cellsHorizontalOffset).valueOf() * MapView.CELL_WIDTH,
                rY = bigI.subtract(this._cellsVerticalOffset).valueOf() * MapView.CELL_HEIGHT;
            if (isAlive) {
                this._context.fillRect(rX, rY, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
            } else {
                this._context.clearRect(rX, rY, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
                this._context.strokeRect(rX, rY, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
            }
        };

        MapView.prototype._toggleCellState = function (i, j) {
            var isAlive = !this._lifeMap.isAlive(i, j);
            this._setCellState(i, j, isAlive);
        };

        return MapView;
    }
);
