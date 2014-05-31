define(function () {
    'use strict';
    /**
     * Save game
     * @param {LifeMap} lifeMap
     * @returns {Boolean}
     */
    var saveGame = function (lifeMap) {
        try {
            window.localStorage['save'] = lifeMap.serialize();
            console.info('Game successfully saved');
            return true;
        } catch (e) {
            console.warn('Save error');
            return false;
        }
    };

    /**
     * Is save data exists
     * @returns {Boolean}
     */
    var saveExists = function () {
        console.info('Save data exists');
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
            console.info('Loading initialized');
        }
    };

    return {
        saveGame: saveGame,
        saveExists: saveExists,
        loadGame: loadGame
    }
});
