import {BigIntSrc, ErrorClass, ExtendableHollowObj, GeneralFn, SimpleFn} from './common-types';

export class CustomError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

export function obj<T extends ExtendableHollowObj>(): T {
    return Object.create(null) as T;
}

export function call(func: SimpleFn) {
    try {
        func();
    } catch (e) {
        window.reportError(e);
    }
}

export function onNextTick<T extends unknown[], U>(cb: GeneralFn<T, U>, ...args: T) {
    setTimeout(() => cb(...args), 0);
}

export function onPageReady(cb: SimpleFn) {
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

export function bigIntMinMax(val: bigint, min: bigint, max: bigint): bigint {
    let res = val;
    if (res < min) {
        res = min;
    }
    if (res > max) {
        res = max;
    }
    return res;
}

type ThrottledFunction<T extends unknown[]> = GeneralFn<[T], void>;
type ThrottledArgType<T> = T extends (infer G)[] ? G : never;
type ThrottleResultFunction<T> = GeneralFn<[ThrottledArgType<T>], void>;

export function throttle<T extends unknown[]>(func: ThrottledFunction<T>, time: number): ThrottleResultFunction<T> {
    let args: T = [] as unknown as T; // 😿
    let tm: unknown = null;

    function callFn() {
        try {
            func(args);
        } catch (e) {
            window.reportError(e);
        }

        args = [] as unknown as T;
        tm = null;
    }

    return function throttled(arg: ThrottledArgType<T>): void {
        args.push(arg);
        if (!tm) {
            tm = setTimeout(callFn, time);
        }
    };
}
