import type {BigIntSrc, ErrorClass, GeneralCallback, SimpleCallback} from './common-types';

export class CustomError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

export function obj(): unknown {
    return Object.create(null);
}

export function call(func: SimpleCallback) {
    try {
        func();
    } catch (e) {
        window.reportError(e);
    }
}

export function onNextTick<T extends unknown[], U>(cb: GeneralCallback<T, U>, ...args: T) {
    setTimeout(() => cb(...args), 0);
}

export function onPageReady(cb: SimpleCallback) {
    function loadCb() {
        onNextTick(cb);
        document.removeEventListener('DOMContentLoaded', loadCb);
        window.removeEventListener('load', loadCb);
    }

    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        return loadCb();
    }

    document.addEventListener('DOMContentLoaded', loadCb);
    window.addEventListener('load', loadCb);
}

export function throwError(errorMessage: string, ErrCls: ErrorClass = Error): never {
    throw new ErrCls(errorMessage);
}

export function createErrorThrower(ErrCls: ErrorClass) {
    return function(errorMessage: string): never {
        throwError(errorMessage, ErrCls);
    };
}

export function enterValueToInterval(val: BigIntSrc, max: BigIntSrc): bigint {
    let res = BigInt(val);
    const bigMax = BigInt(max);
    if (res < 0n) {
        res = bigMax + res;
    } else if (res >= bigMax) {
        res = res % bigMax;
    }
    return res;
}
