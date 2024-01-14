import {describe, expect, it} from '@jest/globals';
import {compareLifePoints, LifeMap, LifePoint} from './life-map';
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

    describe('getAliveLocalities()', () => {
        it('should generate correct point localities', () => {
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

            const res = lifeMap.getAliveLocalities();

            const expected = [
                // Cluster 1
                [0n, 0n], [0n, 1n], [0n, 2n], [0n, 3n],
                [1n, 0n], [1n, 1n], [1n, 2n], [1n, 3n],
                [2n, 0n], [2n, 1n], [2n, 2n], [2n, 3n], [2n, 4n],
                [3n, 0n], [3n, 1n], [3n, 2n], [3n, 3n], [3n, 4n],
                [4n, 0n], [4n, 1n], [4n, 2n], [4n, 3n], [4n, 4n],
                // Cluster 2
                [0n, 79n], [0n, 80n], [0n, 81n], [0n, 82n], [0n, 83n], [0n, 84n], [0n, 85n], [0n, 86n],
                [1n, 79n], [1n, 80n], [1n, 81n], [1n, 82n], [1n, 83n], [1n, 84n], [1n, 85n], [1n, 86n],
                [2n, 78n], [2n, 79n], [2n, 80n], [2n, 81n], [2n, 82n], [2n, 83n], [2n, 84n], [2n, 85n], [2n, 86n], [2n, 87n],
                [3n, 78n], [3n, 79n], [3n, 80n], [3n, 81n], [3n, 82n], [3n, 85n], [3n, 86n], [3n, 87n],
                [4n, 78n], [4n, 79n], [4n, 80n], [4n, 81n], [4n, 82n], [4n, 85n], [4n, 86n], [4n, 87n],
                // Cluster 3
                [31n, 22n], [31n, 23n], [31n, 24n], [31n, 25n],
                [32n, 22n], [32n, 23n], [32n, 24n], [32n, 25n], [32n, 26n],
                [33n, 22n], [33n, 23n], [33n, 24n], [33n, 25n], [33n, 26n], [33n, 27n],
                [34n, 22n], [34n, 23n], [34n, 24n], [34n, 25n], [34n, 26n], [34n, 27n],
                [35n, 23n], [35n, 24n], [35n, 25n], [35n, 26n], [35n, 27n],
                // Cluster 4
                [31n, 94n], [31n, 95n], [31n, 96n], [31n, 97n],
                [32n, 93n], [32n, 94n], [32n, 95n], [32n, 96n], [32n, 97n], [32n, 98n], [32n, 99n],
                [33n, 92n], [33n, 93n], [33n, 94n], [33n, 95n], [33n, 96n], [33n, 97n], [33n, 98n], [33n, 99n],
                [34n, 92n], [34n, 93n], [34n, 94n], [34n, 95n], [34n, 96n], [34n, 97n], [34n, 98n], [34n, 99n],
                [35n, 92n], [35n, 93n], [35n, 94n], [35n, 97n], [35n, 98n], [35n, 99n],
                // Cluster 5
                [77n, 49n], [77n, 50n], [77n, 51n], [77n, 52n], [77n, 53n], [77n, 54n], [77n, 55n], [77n, 56n],
                [78n, 49n], [78n, 50n], [78n, 51n], [78n, 52n], [78n, 53n], [78n, 54n], [78n, 55n], [78n, 56n],
                [79n, 49n], [79n, 50n], [79n, 51n], [79n, 52n], [79n, 53n], [79n, 54n], [79n, 55n], [79n, 56n], [79n, 57n], [79n, 58n], [79n, 59n], [79n, 60n],
                [80n, 51n], [80n, 52n], [80n, 53n], [80n, 55n], [80n, 56n], [80n, 57n], [80n, 58n], [80n, 59n], [80n, 60n],
                [81n, 51n], [81n, 52n], [81n, 53n], [81n, 55n], [81n, 56n], [81n, 57n], [81n, 58n], [81n, 59n], [81n, 60n],
                // Cluster 6
                [98n, 0n], [98n, 1n], [98n, 2n],
                [99n, 0n], [99n, 1n], [99n, 2n],
            ] as LifePoint[];
            expected.sort(compareLifePoints);

            expect(res).toEqual(expected);
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
