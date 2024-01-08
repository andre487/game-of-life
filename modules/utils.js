define(
    ['bower_components/setImmediate/setImmediate.js'],
    function () {
        /**
         * Queue function into an event loop
         * @param {Function} func
         * @param {...*} [args] Call arguments
         */
        var onNextTick = function (func, args) {
            var callArgs = [].slice.call(arguments, 1);
            setImmediate(function () {
                func.apply(undefined, callArgs);
            });
        };

        return {
            onNextTick: onNextTick
        };
    }
);
