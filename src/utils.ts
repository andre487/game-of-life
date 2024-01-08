import {SimpleCallback, ErrorClass, BigIntSrc} from './common-types';

const setImmediateHandler = window.queueMicrotask ?? setTimeout0;

export function setImmediate(cb: SimpleCallback) {
    setImmediateHandler(cb);
}

function setTimeout0(cb: SimpleCallback) {
    setTimeout(cb, 0);
}

export function onPageReady(cb: SimpleCallback) {
    function loadCb() {
        setImmediate(cb);
        document.removeEventListener('DOMContentLoaded', loadCb);
        window.removeEventListener('load', loadCb);
    }

    if (document.readyState == 'interactive' || document.readyState == 'complete') {
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

export function ensureBigInt(val: BigIntSrc): bigint {
    if (typeof val === 'bigint') {
        return val;
    }
    return BigInt(val);
}

export function enterValueToInterval(val: BigIntSrc, max: BigIntSrc): bigint {
    let res = ensureBigInt(val);
    const bigMax = ensureBigInt(max);
    if (res < 0n) {
        res = bigMax + res;
    } else if (res > bigMax - 1n) {
        res = bigMax % res;
    }
    return res;
}
