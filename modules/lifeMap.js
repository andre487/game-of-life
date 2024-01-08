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
            this._changeListeners = [];
        };

        LifeMap.POPULATED_DELTA = BigInteger(30);

        LifeMap.SIMPLE_FIELDS = ['_width', '_height', '_minX', '_maxX', '_minY', '_maxY'];

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

        /**
         * Add map external change listener
         * @param {Function} listener
         */
        LifeMap.prototype.addChangeListener = function (listener) {
            this._changeListeners.push(listener);
        };

        /**
         * Create string map representation
         * @returns {String}
         */
        LifeMap.prototype.serialize = function () {
            var dump = '',
                fields = LifeMap.SIMPLE_FIELDS;
            for (var i = 0, n = fields.length; i < n; ++i) {
                dump += this[fields[i]].toString() + ';';
            }

            for (var keyX in this._container) {
                if (this._container.hasOwnProperty(keyX)) {
                    dump += keyX + ':';
                    for (var keyY in this._container[keyX]) {
                        if (this._container[keyX].hasOwnProperty(keyY)) {
                            dump += keyY + ',';
                        }
                    }
                    dump = dump.substr(0, dump.length - 1) + '|';
                }
            }
            return dump.substr(0, dump.length - 1);
        };

        /**
         * Load state from serialized dump
         * @param {String} dump
         */
        LifeMap.prototype.loadSerializedState = function (dump) {
            var dumpParts = dump.split(';'),
                fields = LifeMap.SIMPLE_FIELDS,
                mapDump = dumpParts[fields.length];
            for (var i = 0, n = fields.length; i < n; ++i) {
                this[fields[i]] = BigInteger(dumpParts[i]);
            }

            var container = {};
            mapDump.split('|').forEach(function (row) {
                var parts = row.split(':');
                container[parts[0]] = {};
                parts[1].split(',').forEach(function (keyY) {
                    container[parts[0]][keyY] = true;
                });
            });
            this._container = container;

            this._changeListeners.forEach(function (func) {
                func();
            });
        };

        return LifeMap;
    }
);
