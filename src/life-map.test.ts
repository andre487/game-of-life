import {LifeMap} from './life-map';
import {describe, expect, it} from './test-common';

describe('LifeMap', function() {
    describe('constructor()', function() {
        it('should construct a correct object', function() {
            const lifeMap = new LifeMap(100, 100);

            expect(lifeMap.width).toBe(100n);
            expect(lifeMap.height).toBe(100n);

            expect(lifeMap.populatedRect).toEqual({
                top: 99n,
                right: 0n,
                bottom: 0n,
                left: 99n,
            });

            expect(lifeMap.isAlive(0, 0)).toBeFalsy();
            expect(lifeMap.container).toEqual({});
        });
    });

    describe('isAlive()', function() {
        it('should set correct coordinates', function() {
            const lifeMap = new LifeMap(100, 100);

            lifeMap.isAlive(0, 0, true);
            lifeMap.isAlive(0, 1, true);

            lifeMap.isAlive(40, 0, true);
            lifeMap.isAlive(40, 2, true);

            lifeMap.isAlive(40, 3, true);
            lifeMap.isAlive(40, 3, false);

            expect(lifeMap.isAlive(0, 0)).toBeTruthy();
            expect(lifeMap.isAlive(0, 1)).toBeTruthy();
            expect(lifeMap.isAlive(1, 1)).toBeFalsy();

            expect(lifeMap.isAlive(40, 0)).toBeTruthy();
            expect(lifeMap.isAlive(40, 2)).toBeTruthy();
            expect(lifeMap.isAlive(40, 3)).toBeFalsy();

            expect(lifeMap.container).toEqual({
                0: {0: true, 1: true},
                40: {0: true, 2: true},
            });
        });
    });
});
