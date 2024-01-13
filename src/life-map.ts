import {O} from 'ts-toolbelt';
import type {BigIntSrc, ExtendableHollowObj, SimpleFn, Stringable} from './common-types';
import {call, compareBigInts, CustomError, enterValueToInterval, emptyHollowObj, obj} from './utils';

export interface PopulatedRect {
    top: bigint;
    right: bigint;
    bottom: bigint;
    left: bigint;
}

export type CoordVector = ExtendableHollowObj<boolean>;
export type CoordMatrix = ExtendableHollowObj<CoordVector>;

export type LifePoint = [bigint, bigint];
export type LifeCluster = LifePoint[];
type ClVect = [string, bigint][];

export class LifeMapError extends CustomError {}

function compareLifePoints(a: LifePoint, b: LifePoint): number {
    const d = compareBigInts(a[0], b[0]);
    if (d) {
        return d;
    }
    return compareBigInts(a[1], b[1]);
}

export class LifeMap {
    public static readonly POPULATED_DELTA = 30n;
    public static readonly CLUSTER_LOCALITY = 5;
    public static readonly CLUSTER_TOLERANCE = LifeMap.CLUSTER_LOCALITY * 2 + 1;

    private _container: CoordMatrix = obj();
    private _width = 0n;
    private _height = 0n;
    private _minX = 0n;
    private _maxX = 0n;
    private _minY = 0n;
    private _maxY = 0n;
    private _changeListeners: SimpleFn[] = [];

    constructor(mapWidth: BigIntSrc, mapHeight: BigIntSrc) {
        this._width = BigInt(mapWidth);
        this._height = BigInt(mapHeight);
        this.reset();
    }

    get width(): bigint {
        return this._width;
    }

    get height(): bigint {
        return this._height;
    }

    get populatedRect(): PopulatedRect {
        return {
            left: this._minX,
            right: this._maxX,
            top: this._minY,
            bottom: this._maxY,
        };
    }

    get container(): O.Readonly<CoordMatrix> {
        return this._container;
    }

    isAlive(x: BigIntSrc, y: BigIntSrc, status?: boolean) {
        const bigX = enterValueToInterval(x, this._width);
        const bigY = enterValueToInterval(y, this._height);

        if (status !== undefined) {
            this._setStatusToContainer(bigX, bigY, status);
        }

        const keyX = bigX.toString();
        const keyY = bigY.toString();

        return Boolean(this._container[keyX]?.[keyY]);
    }

    getLifeClusters() {
        // About key iteration order: https://dev.to/frehner/the-order-of-js-object-keys-458d
        const xVector: ClVect = Object.keys(this._container).map((x) => [x, BigInt(x)]);
        if (!xVector.length) {
            return [];
        }

        const clusters: LifeCluster[] = [];
        const xCount = xVector.length;
        for (let i = 0; i < xCount;) {
            const curXData = xVector[i];
            const curXVal = curXData[1];
            const curXSiblings: ClVect = [curXData];

            let otherIdx = i + 1;
            let prevXVal = curXVal;
            while (otherIdx < xCount) {
                const otherXData = xVector[otherIdx++];
                const otherXVal = otherXData[1];
                if (otherXVal - prevXVal > LifeMap.CLUSTER_TOLERANCE) {
                    break;
                }
                prevXVal = otherXVal;
                curXSiblings.push(otherXData);
            }

            const curYMatrix = curXSiblings
                .flatMap(([xKey, xVal]) => {
                    return Object
                        .keys(this._container[xKey] ?? emptyHollowObj)
                        .map((y): LifePoint => [xVal, BigInt(y)]);
                })
                .sort((a, b) => compareBigInts(a[1], b[1]));

            let curCluster: LifeCluster = [curYMatrix[0]];
            clusters.push(curCluster);

            let prevYVal = curYMatrix[0][1];
            for (let j = 1; j < curYMatrix.length; ++j) {
                const curPoint = curYMatrix[j];
                const curYVal = curPoint[1];
                if (curYVal - prevYVal > LifeMap.CLUSTER_TOLERANCE) {
                    curCluster.sort(compareLifePoints);
                    curCluster = [];
                    clusters.push(curCluster);
                }
                prevYVal = curYVal;
                curCluster.push(curPoint);
            }

            if (curCluster.length > 1) {
                curCluster.sort(compareLifePoints);
            }

            i += curXSiblings.length;
        }

        return clusters;
    }

    addChangeListener(listener: SimpleFn) {
        if (this._changeListeners.indexOf(listener) === -1) {
            this._changeListeners.push(listener);
        }
    }

    reset() {
        this._container = obj();
        this._minX = this._height - 1n;
        this._maxX = 0n;
        this._minY = this._width - 1n;
        this._maxY = 0n;

        this._changeListeners.forEach(call);
    }

    serialize(): string {
        const data: Stringable[] = [this._width, this._height, this._minX, this._maxX, this._minY, this._maxY];

        const coords: string[] = [];
        for (const [keyX, vector] of Object.entries(this._container)) {
            coords.push(`${keyX}:${Object.keys(vector ?? emptyHollowObj)
                .join(',')}`);
        }
        data.push(coords.join('|'));

        return data.join(';');
    }

    loadSerializedState(dump: string) {
        const data = dump.split(';');
        if (data.length < 7) {
            throw new LifeMapError('Invalid save data length');
        }

        this._width = BigInt(data[0]);
        this._height = BigInt(data[1]);
        this._minX = BigInt(data[2]);
        this._maxX = BigInt(data[3]);
        this._minY = BigInt(data[4]);
        this._maxY = BigInt(data[5]);

        const container = this._container = obj();
        for (const coordData of data[6].split('|')) {
            const [keyX, yStr] = coordData.split(':');
            const xVector = container[keyX] = obj();

            for (const keyY of yStr.split(',')) {
                xVector[keyY] = true;
            }
        }

        this._changeListeners.forEach(call);
    }

    private _setStatusToContainer(bigX: bigint, bigY: bigint, status: boolean) {
        if (bigX >= this._width || bigX < 0n || bigY >= this._height || bigY < 0n) {
            return;
        }

        const keyX = bigX.toString();
        const keyY = bigY.toString();

        if (status) {
            const xVector = this._container[keyX] ??= obj();
            xVector[keyY] = true;
        } else if (!status && this._container[keyX]) {
            delete this._container[keyX]?.[keyY];
            if (Object.keys(this._container[keyX] ?? emptyHollowObj).length === 0) {
                delete this._container[keyX];
            }
        }

        if (!status) {
            return;
        }

        if (bigX - LifeMap.POPULATED_DELTA < this._minX) {
            this._minX = bigX - LifeMap.POPULATED_DELTA;
            if (this._minX < 0n) {
                this._minX = 0n;
            }
        }

        if (bigX + LifeMap.POPULATED_DELTA > this._maxX) {
            this._maxX = bigX + LifeMap.POPULATED_DELTA;
            if (this._maxX >= this._width) {
                this._maxX = this._width - 1n;
            }
        }

        if (bigY - LifeMap.POPULATED_DELTA < this._minY) {
            this._minY = bigY - LifeMap.POPULATED_DELTA;
            if (this._minY < 0n) {
                this._minY = 0n;
            }
        }

        if (bigY + LifeMap.POPULATED_DELTA >= this._maxY) {
            this._maxY = bigY + LifeMap.POPULATED_DELTA;
            if (this._maxY >= this._height) {
                this._maxY = this._height - 1n;
            }
        }
    }
}
