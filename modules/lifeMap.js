define(function () {
    // TODO: implement big numbers

    /**
     * Dummy LifeMap (not for big numbers)
     * @param {Number} mapWidth Max universe width
     * @param {Number} mapHeight Max universe height
     * @constructor
     */
    var LifeMap = function (mapWidth, mapHeight) {
        this._container = [];
        this._width = mapWidth;
        this._height = mapHeight;
        this._minX = mapWidth - 1;
        this._maxX = 0;
        this._minY = mapWidth - 1;
        this._maxY = 0;

        var i, j, row;
        for (i = 0; i < mapHeight; ++i) {
            row = [];
            for (j = 0; j < mapWidth; ++j) {
                row.push(false);
            }
            this._container.push(row);
        }
    };

    LifeMap.POPULATED_DELTA = 25;

    /**
     * Map width
     * @returns {Number}
     */
    LifeMap.prototype.width = function () {
        return this._width;
    };

    /**
     * Map height
     * @returns {Number}
     */
    LifeMap.prototype.height = function () {
        return this._height;
    };

    /**
     * Get populated area
     * @returns {{top: *, right: *, bottom: *, left: *}}
     */
    LifeMap.prototype.populatedRect = function () {
        return {
            top: this._minY,
            right: this._maxX,
            bottom: this._maxY,
            left: this._minX
        };
    };

    /**
     * Is cell alive
     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} [status] If passed, set alive status
     * @returns {Boolean}
     */
    LifeMap.prototype.isAlive = function (x, y, status) {
        if (x < 0) {
            x = this._width + x;
        } else if (x > this._width - 1) {
            x = x % this._width;
        }
        if (y < 0) {
            y = this._height + y;
        } else if (y > this._height - 1) {
            y = y % this._height;
        }

        if (status !== undefined) {
            this._container[x][y] = status;
            if (status) {
                if (x - LifeMap.POPULATED_DELTA < this._minX) {
                    this._minX = Math.max(0, x - LifeMap.POPULATED_DELTA);
                }
                if (x + LifeMap.POPULATED_DELTA > this._maxX) {
                    this._maxX = Math.min(this._width, x + LifeMap.POPULATED_DELTA);
                }
                if (y - LifeMap.POPULATED_DELTA < this._minY) {
                    this._minY = Math.max(0, y - LifeMap.POPULATED_DELTA);
                }
                if (y + LifeMap.POPULATED_DELTA > this._maxY) {
                    this._maxY = Math.min(this._height, y + LifeMap.POPULATED_DELTA);
                }
            }
        }
        return this._container[x][y];
    };

    /**
     * Replace this map with another
     * @param {Object} anotherMap
     */
    LifeMap.prototype.replaceWith = function (anotherMap) {
        for (var prop in anotherMap) {
            if (anotherMap.hasOwnProperty(prop) && this.hasOwnProperty(prop)) {
                this[prop] = anotherMap[prop];
            }
        }
    };

    return LifeMap;
});
