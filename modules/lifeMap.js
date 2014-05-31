define(
    ['../bower_components/bignum/biginteger.js'],
    function () {
        /**
         * LifeMap: structure containing cells statuses
         * Note: for all numbers in this object the BigInteger used
         * @param {BigInteger|Number|String} mapWidth Max universe width
         * @param {BigInteger|Number|String} mapHeight Max universe height
         * @constructor
         */
        var LifeMap = function (mapWidth, mapHeight) {
            this._container = {};
            this._width = BigInteger(mapWidth);
            this._height = BigInteger(mapHeight);
            this._minX = this._height.subtract(BigInteger.ONE);
            this._maxX = BigInteger.ZERO;
            this._minY = this._width.subtract(BigInteger.ONE);
            this._maxY = BigInteger.ZERO;
        };

        LifeMap.POPULATED_DELTA = BigInteger(30);

        /**
         * Map width
         * @returns {BigInteger}
         */
        LifeMap.prototype.width = function () {
            return this._width;
        };

        /**
         * Map height
         * @returns {BigInteger}
         */
        LifeMap.prototype.height = function () {
            return this._height;
        };

        /**
         * Get populated area
         * @returns {{top: BigInteger, right: BigInteger, bottom: BigInteger, left: BigInteger}}
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
         * @param {BigInteger|Number|String} x
         * @param {BigInteger|Number|String} y
         * @param {Boolean} [status] If passed, set alive status
         * @returns {Boolean}
         */
        LifeMap.prototype.isAlive = function (x, y, status) {
            var bigX = BigInteger(x),
                bigY = BigInteger(y);

            if (bigX.compare(BigInteger.ZERO) < 0) {
                bigX = this._width.add(bigX);
            } else if (bigX.compare(this._width.subtract(BigInteger.ONE)) > 0) {
                bigX = this._width.remainder(bigX);
            }

            if (bigY.compare(BigInteger.ZERO) < 0) {
                bigY = this._height.add(bigY);
            } else if (bigY.compare(this._height.subtract(BigInteger.ONE)) > 0) {
                bigY = this._height.remainder(bigY);
            }

            if (status !== undefined) {
                this._setStatusToContainer(bigX, bigY, status);
            }

            var keyX = bigX.toString(),
                keyY = bigY.toString();
            return Boolean(this._container[keyX] && this._container[keyX][keyY]);
        };

        LifeMap.prototype._setStatusToContainer = function (bigX, bigY, status) {
            var keyX = bigX.toString(),
                keyY = bigY.toString();

            if (status === true) {
                if (this._container[keyX] === undefined) {
                    this._container[keyX] = {};
                }
                this._container[keyX][keyY] = true;
            } else if (status === false && this._container[keyX]) {
                delete this._container[keyX][keyY];
                if (Object.keys(this._container[keyX]).length === 0) {
                    delete this._container[keyX];
                }
            }

            if (status) {
                if (bigX.subtract(LifeMap.POPULATED_DELTA).compare(this._minX) < 0) {
                    this._minX = bigX.subtract(LifeMap.POPULATED_DELTA);
                    if (this._minX.compare(BigInteger.ZERO) < 0) {
                        this._minX = BigInteger.ZERO;
                    }
                }

                if (bigX.add(LifeMap.POPULATED_DELTA).compare(this._maxX) > 0) {
                    this._maxX = bigX.add(LifeMap.POPULATED_DELTA);
                    if (this._maxX.compare(this._width.subtract(BigInteger.ONE)) > 0) {
                        this._maxX = this._width.subtract(BigInteger.ONE);
                    }
                }

                if (bigY.subtract(LifeMap.POPULATED_DELTA).compare(this._minY) < 0) {
                    this._minY = bigY.subtract(LifeMap.POPULATED_DELTA);
                    if (this._minY.compare(BigInteger.ZERO) < 0) {
                        this._minY = BigInteger.ZERO;
                    }
                }

                if (bigY.add(LifeMap.POPULATED_DELTA).compare(this._maxY) > 0) {
                    this._maxY = bigY.add(LifeMap.POPULATED_DELTA);
                    if (this._maxY.compare(this._height.subtract(BigInteger.ONE)) > 0) {
                        this._maxY = this._height.subtract(BigInteger.ONE);
                    }
                }
            }
        };

        return LifeMap;
    }
);
