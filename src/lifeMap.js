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
     * Cell state
     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} [state] If passed, set state
     * @returns {Boolean}
     */
    LifeMap.prototype.state = function (x, y, state) {
        if (x > this.width() || y > this.height()) {
            return false;
        } else if (state !== undefined) {
            this._container[x][y] = state;
        }
        return this._container[x][y];
    };

    return LifeMap;
});
