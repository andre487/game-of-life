define(
    ['lifeMap', 'utils', '../bower_components/bignum/biginteger.js'],
    function (LifeMap, utils) {
        'use strict';

        /**
         * Game logic object
         * @param {LifeMap} lifeMap
         * @constructor
         */
        var GameOfLife = function (lifeMap) {
            this._lifeMap = lifeMap;
            this._stopFlag = false;
            this._startCallback = undefined;
            this._stopCallback = undefined;
            this._roundCallback = undefined;
            this._state = GameOfLife.state.STOPPED;
        };

        //noinspection JSValidateTypes
        GameOfLife.state = {
            STOPPED: 'stopped',
            RUNNING: 'running',
            STOPPING: 'stopping'
        };

        /**
         * Game process state
         * @returns {String}
         */
        GameOfLife.prototype.state = function () {
            return this._state;
        };

        /**
         * Set game start callback
         * @param {Function} callback
         */
        GameOfLife.prototype.onStart = function (callback) {
            this._startCallback = callback;
        };

        /**
         * Set game stop callback
         * @param {Function} callback
         */
        GameOfLife.prototype.onStop = function (callback) {
            this._stopCallback = callback;
        };

        /**
         * Set round complete callback
         * @param {Function} callback
         */
        GameOfLife.prototype.onRound = function (callback) {
            this._roundCallback = callback;
        };

        /**
         * Start game
         */
        GameOfLife.prototype.run = function () {
            this._stopFlag = false;
            var self = this;
            makeRound();
            this._state = GameOfLife.state.RUNNING;

            if (typeof this._startCallback === 'function') {
                utils.onNextTick(this._startCallback);
            }

            function makeRound() {
                utils.onNextTick(self._runRoundAsync.bind(self, onRoundComplete));
            }

            function onRoundComplete(changesTable) {
                for (var keyX in changesTable) {
                    if (changesTable.hasOwnProperty(keyX)) {
                        for (var keyY in changesTable[keyX]) {
                            if (changesTable[keyX].hasOwnProperty(keyY)) {
                                self._lifeMap.isAlive(keyX, keyY, changesTable[keyX][keyY]);
                            }
                        }
                    }
                }

                if (typeof self._roundCallback === 'function') {
                    utils.onNextTick(self._roundCallback);
                }

                if (self._stopFlag) {
                    self._state = GameOfLife.state.STOPPED;
                    if (typeof self._stopCallback === 'function') {
                        utils.onNextTick(self._stopCallback);
                    }
                } else {
                    makeRound();
                }
            }
        };

        /**
         * Stop game
         * Note: game will not stop immediately,
         * stopping will be pushed to event loop
         */
        GameOfLife.prototype.stop = function () {
            this._stopFlag = true;
            this._state = GameOfLife.state.STOPPING;
        };

        /**
         * Run the round
         * @param {Function} done Round done callback
         * @private
         */
        GameOfLife.prototype._runRoundAsync = function (done) {
            var self = this,
                populated = this._lifeMap.populatedRect(),
                changesTable = {};
            utils.onNextTick(walkByColumn, populated.top);

            function walkByColumn(bigI) {
                var bigJ = populated.left;
                makeStep();

                function makeStep() {
                    handleCell(bigI, bigJ);
                    bigJ = bigJ.add(BigInteger.ONE);
                    if (bigJ.compare(populated.right) <= 0) {
                        makeStep();
                    } else {
                        bigI = bigI.add(BigInteger.ONE);
                        if (bigI.compare(populated.bottom) <= 0) {
                            utils.onNextTick(walkByColumn, bigI);
                        } else {
                            done(changesTable);
                        }
                    }
                }
            }

            function handleCell(bigX, bigY) {
                var state = self._lifeMap.isAlive(bigX, bigY),
                    aliveSiblings = 0;
                var i, j;
                for (i = -1; i <= 1; ++i) {
                    for (j = -1; j <= 1; ++j) {
                        if (!(i === 0 && j === 0)) {
                            aliveSiblings += self._lifeMap.isAlive(bigX.add(i), bigY.add(j));
                        }
                    }
                }

                var keyX = bigX.toString(),
                    keyY = bigY.toString();
                if (state && !(aliveSiblings === 2 || aliveSiblings === 3)) {
                    changesTable[keyX] = changesTable[keyX] || {};
                    changesTable[keyX][keyY] = false;
                } else if (!state && aliveSiblings === 3) {
                    changesTable[keyX] = changesTable[keyX] || {};
                    changesTable[keyX][keyY] = true;
                }
            }
        };

        return GameOfLife;
    }
);
