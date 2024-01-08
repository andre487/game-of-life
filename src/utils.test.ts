import {describe, expect, it} from './test-common';
import {onPageReady, setImmediate} from './utils';

describe('setImmediate()', function() {
    it('should run callback', async function() {
        const res = await new Promise((resolve) => {
            setImmediate(function() {
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
