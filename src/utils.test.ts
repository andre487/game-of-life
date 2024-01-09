import {describe, expect, it} from '@jest/globals';
import type {U} from 'ts-toolbelt';
import {createErrorThrower, enterValueToInterval, onNextTick, onPageReady, throwError} from './utils';

describe('onNextTick()', function() {
    it('should run callback', async function() {
        const res = await new Promise((resolve) => {
            onNextTick(function() {
                resolve(true);
            });
        });

        expect(res).toBe(true);
    });
});

describe('onPageReady()', function() {
    it('should run callback', async function() {
        const res = await new Promise((resolve) => {
            onPageReady(() => {
                resolve(true);
            });
        });

        expect(res).toBe(true);
    });
});

describe('throwError()', function() {
    class CustomError extends Error {
        constructor(message?: string) {
            super(message);
            this.name = 'CustomError';
        }
    }

    it('should throw Error by default', function() {
        let errorInstance: U.Nullable<Error> = null;
        try {
            throwError('Test');
        } catch (e) {
            errorInstance = e as Error;
        }

        expect(errorInstance).toBeInstanceOf(Error);
        expect(errorInstance?.toString()).toBe('Error: Test');
        expect(errorInstance?.name).toBe('Error');
    });

    it('should throw CustomError', function() {
        let errorInstance: U.Nullable<Error> = null;
        try {
            throwError('Test', CustomError);
        } catch (e) {
            errorInstance = e as CustomError;
        }

        expect(errorInstance).toBeInstanceOf(CustomError);
        expect(errorInstance?.toString()).toBe('CustomError: Test');
        expect(errorInstance?.name).toBe('CustomError');
    });
});

describe('createErrorThrower()', function() {
    class CustomError extends Error {
        constructor(message?: string) {
            super(message);
            this.name = 'CustomError';
        }
    }

    it('should throw an error of specified type', function() {
        const thr = createErrorThrower(CustomError);

        let errorInstance: U.Nullable<Error> = null;
        try {
            thr('Test');
        } catch (e) {
            errorInstance = e as CustomError;
        }

        expect(errorInstance).toBeInstanceOf(CustomError);
        expect(errorInstance?.toString()).toBe('CustomError: Test');
        expect(errorInstance?.name).toBe('CustomError');
    });
});

describe('enterValueToInterval()', function() {
    it('should enter a value to the interval when 0 <= x < max', function() {
        expect(enterValueToInterval(100, 250)).toBe(100n);
    });

    it('should enter a value to the interval when x < 0', function() {
        expect(enterValueToInterval(-100, 250)).toBe(150n);
    });

    it('should enter a value to the interval when x >= max', function() {
        expect(enterValueToInterval(350, 250)).toBe(100n);
        expect(enterValueToInterval(250, 250)).toBe(0n);
    });
});
