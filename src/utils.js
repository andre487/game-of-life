define(function () {
    /**
     * Set function into execution queue
     * @param {Function} func
     * @param {...*} [args] Call arguments
     */
    var onNextTick = function (func, args) {
        var callArgs = [].slice.call(arguments, 1);
        setTimeout(function () {
            func.apply(undefined, callArgs);
        }, 0);
    };

    return {
        onNextTick: onNextTick
    };
});
