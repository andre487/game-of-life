import {describe, expect, it} from '@jest/globals';
import {LifeMap} from './life-map';
import {shuffleArray} from './test-utils';

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

    describe('getLifeClusters()', () => {
        it('should find clusters', () => {
            const lifeMap = new LifeMap(100, 100);

            const aliveCells = shuffleArray([
                // Cluster 1
                [1, 0], [1, 1], [1, 2],
                [2, 0], [2, 2],
                [3, 1], [3, 3],
                // Cluster 2
                [1, 80], [1, 83], [1, 85],
                [3, 79], [3, 81], [3, 86],
                // Cluster 3
                [32, 23], [32, 24],
                [33, 23], [33, 24], [33, 25],
                [34, 24], [34, 25], [34, 26],
                // Cluster 4
                [32, 95], [32, 96],
                [33, 94], [33, 97], [33, 99],
                [34, 93], [34, 98], [34, 99],
                // Cluster 5
                [78, 50], [78, 53], [78, 55],
                [80, 52], [80, 56], [80, 59],
                // Cluster 6
                [99, 1],
            ]);

            for (const [i, j] of aliveCells) {
                lifeMap.isAlive(i, j, true);
            }

            const res = lifeMap.getLifeClusters();

            expect(res).toEqual([
                // Cluster 1
                [
                    [1n, 0n], [1n, 1n], [1n, 2n],
                    [2n, 0n], [2n, 2n],
                    [3n, 1n], [3n, 3n],
                ],
                // Cluster 2
                [
                    [1n, 80n], [1n, 83n], [1n, 85n],
                    [3n, 79n], [3n, 81n], [3n, 86n],
                ],
                // Cluster 3
                [
                    [32n, 23n], [32n, 24n],
                    [33n, 23n], [33n, 24n], [33n, 25n],
                    [34n, 24n], [34n, 25n], [34n, 26n],
                ],
                // Cluster 4
                [
                    [32n, 95n], [32n, 96n],
                    [33n, 94n], [33n, 97n], [33n, 99n],
                    [34n, 93n], [34n, 98n], [34n, 99n],
                ],
                // Cluster 5
                [
                    [78n, 50n], [78n, 53n], [78n, 55n],
                    [80n, 52n], [80n, 56n], [80n, 59n],
                ],
                // Cluster 6
                [
                    [99n, 1n],
                ],
            ]);
        });
    });
});
