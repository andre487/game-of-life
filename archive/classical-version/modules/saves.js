define(function () {
    'use strict';
    /**
     * Save game
     * @param {LifeMap} lifeMap
     * @returns {Boolean}
     */
    var saveGame = function (lifeMap) {
        window.localStorage['save'] = lifeMap.serialize();
    };

    /**
     * Is save data exists
     * @returns {Boolean}
     */
    var saveExists = function () {
        return Boolean(typeof window.localStorage === 'object' && window.localStorage !== null && window.localStorage['save']);
    };

    /**
     * Load state from save data
     * @param {LifeMap} lifeMap
     */
    var loadGame = function (lifeMap) {
        var dump;
        if (saveExists()) {
            dump = window.localStorage['save'];
            lifeMap.loadSerializedState(dump);
        }
    };

    return {
        saveGame: saveGame,
        saveExists: saveExists,
        loadGame: loadGame
    }
});
