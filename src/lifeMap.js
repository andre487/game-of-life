define(function () {
    /**
     * Dummy LifeMap (not for big numbers)
     * @param {Number} mapWidth
     * @param {Number} mapHeight
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
     * Cell state
     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} [state] If passed, set state
     * @returns {Boolean}
     */
    LifeMap.prototype.state = function (x, y, state) {
        if (x < 0 || x > this.width() || y < 0 || y > this.height()) {
            return false;
        } else if (state !== undefined) {
            this._container[x][y] = state;
            if (x < this._minX) {
                this._minX = x;
            }
            if (x > this._maxX) {
                this._maxX = x;
            }
            if (y < this._minY) {
                this._minY = y;
            }
            if (y > this._maxY) {
                this._maxY = y;
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
