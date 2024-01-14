import {describe, expect, it} from '@jest/globals';
import {compareLifePoints, LifeLocality, LifeMap, LifePoint} from './life-map';
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

    describe('getLifeLocalities()', () => {
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

            const res = lifeMap.getLifeLocalities();

            const expected = [
                // Cluster 1
                [0, 0], [0, 1], [0, 2], [0, 3],
                [1, 0], [1, 1], [1, 2], [1, 3],
                [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
                [3, 0], [3, 1], [3, 2], [3, 3], [3, 4],
                [4, 0], [4, 1], [4, 2], [4, 3], [4, 4],
                // Cluster 2
                [0, 79], [0, 80], [0, 81], [0, 82], [0, 83], [0, 84], [0, 85], [0, 86],
                [1, 79], [1, 80], [1, 81], [1, 82], [1, 83], [1, 84], [1, 85], [1, 86],
                [2, 78], [2, 79], [2, 80], [2, 81], [2, 82], [2, 83], [2, 84], [2, 85], [2, 86], [2, 87],
                [3, 78], [3, 79], [3, 80], [3, 81], [3, 82], [3, 85], [3, 86], [3, 87],
                [4, 78], [4, 79], [4, 80], [4, 81], [4, 82], [4, 85], [4, 86], [4, 87],
                // Cluster 3
                [31, 22], [31, 23], [31, 24], [31, 25],
                [32, 22], [32, 23], [32, 24], [32, 25], [32, 26],
                [33, 22], [33, 23], [33, 24], [33, 25], [33, 26], [33, 27],
                [34, 22], [34, 23], [34, 24], [34, 25], [34, 26], [34, 27],
                [35, 23], [35, 24], [35, 25], [35, 26], [35, 27],
                // Cluster 4
                [31, 94], [31, 95], [31, 96], [31, 97],
                [32, 93], [32, 94], [32, 95], [32, 96], [32, 97], [32, 98], [32, 99],
                [33, 92], [33, 93], [33, 94], [33, 95], [33, 96], [33, 97], [33, 98], [33, 99],
                [34, 92], [34, 93], [34, 94], [34, 95], [34, 96], [34, 97], [34, 98], [34, 99],
                [35, 92], [35, 93], [35, 94], [35, 97], [35, 98], [35, 99],
                // Cluster 5
                [77, 49], [77, 50], [77, 51], [77, 52], [77, 53], [77, 54], [77, 55], [77, 56],
                [78, 49], [78, 50], [78, 51], [78, 52], [78, 53], [78, 54], [78, 55], [78, 56],
                [79, 49], [79, 50], [79, 51], [79, 52], [79, 53], [79, 54], [79, 55], [79, 56], [79, 57], [79, 58], [79, 59], [79, 60],
                [80, 51], [80, 52], [80, 53], [80, 55], [80, 56], [80, 57], [80, 58], [80, 59], [80, 60],
                [81, 51], [81, 52], [81, 53], [81, 55], [81, 56], [81, 57], [81, 58], [81, 59], [81, 60],
                // Cluster 6
                [98, 0], [98, 1], [98, 2],
                [99, 0], [99, 1], [99, 2],
            ]
                .map((p): LifePoint => [BigInt(p[0]), BigInt(p[1])])
                .sort((a, b) => compareLifePoints(a[0], b[0], a[1], b[1]))
                .map(([x, y]): LifeLocality => [x.toString(), y.toString(), x, y]);

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
