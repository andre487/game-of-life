define(
    ['lifeMap.js', 'utils.js'],
    function (LifeMap, utils) {
        'use strict';

        /**
         * Make life round
         * @param {Object} lifeMap
         * @returns {Object}
         */
        var lifeRound = function (lifeMap) {
            var resolve,
                runRoundAsync = function () {
                    var populated = lifeMap.populatedRect(),
                        newMap = new LifeMap(lifeMap.width(), lifeMap.height());
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
                                    done();
                                }
                            }
                        }
                    }

                    function handleCell(x, y) {
                        var state = lifeMap.state(x, y),
                            aliveSiblings = 0;
                        var i, j;
                        for (i = -1; i <= 1; ++i) {
                            for (j = -1; j <= 1; ++j) {
                                if (!(i === 0 && j === 0)) {
                                    aliveSiblings += lifeMap.state(x + i, y + j);
                                }
                            }
                        }

                        if (state) {
                            if (aliveSiblings === 2 || aliveSiblings === 3) {
                                newMap.state(x, y, true);
                            } else {
                                newMap.state(x, y, false);
                            }
                        } else if (aliveSiblings === 3) {
                            newMap.state(x, y, true);
                        } else {
                            newMap.state(x, y, false);
                        }
                    }

                    function done() {
                        lifeMap.replaceWith(newMap);
                        resolve();
                    }
                };

            utils.onNextTick(runRoundAsync);
            // Promise-like object
            return {
                then: function (onResolve) {
                    resolve = onResolve;
                }
            };
        };

        return {
            lifeRound: lifeRound
        }
    }
);
