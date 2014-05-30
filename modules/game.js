define(
    ['lifeMap', 'utils'],
    function (LifeMap, utils) {
        'use strict';

        /**
         * Game logic object
         * @param {Object} lifeMap
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

            function onRoundComplete(newMap) {
                self._lifeMap.replaceWith(newMap);
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
         * stopping will be pushed to execution queue
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
                newMap = new LifeMap(this._lifeMap.width(), this._lifeMap.height());
            utils.onNextTick(walkByColumn, populated.top);

            function walkByColumn(i) {
                var j = populated.left;
                makeStep();

                function makeStep() {
                    handleCell(i, j);
                    ++j;
                    if (j < populated.right) {
                        makeStep();
                    } else {
                        ++i;
                        if (i <= populated.bottom) {
                            utils.onNextTick(walkByColumn, i);
                        } else {
                            done(newMap);
                        }
                    }
                }
            }

            function handleCell(x, y) {
                var state = self._lifeMap.isAlive(x, y),
                    aliveSiblings = 0;
                var i, j;
                for (i = -1; i <= 1; ++i) {
                    for (j = -1; j <= 1; ++j) {
                        if (!(i === 0 && j === 0)) {
                            aliveSiblings += self._lifeMap.isAlive(x + i, y + j);
                        }
                    }
                }

                if (state) {
                    if (aliveSiblings === 2 || aliveSiblings === 3) {
                        newMap.isAlive(x, y, true);
                    } else {
                        newMap.isAlive(x, y, false);
                    }
                } else if (aliveSiblings === 3) {
                    newMap.isAlive(x, y, true);
                } else {
                    newMap.isAlive(x, y, false);
                }
            }
        };

        return GameOfLife;
    }
);
