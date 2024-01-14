import type {O} from 'ts-toolbelt';
import type {BigIntSrc, ExtendableHollowObj, SimpleFn, Stringable} from './common-types';
import {call, compareBigInts, CustomError, emptyHollowObj, obj} from './utils';

export interface PopulatedRect {
    top: bigint;
    right: bigint;
    bottom: bigint;
    left: bigint;
}

export type CoordVector = ExtendableHollowObj<boolean>;
export type CoordMatrix = ExtendableHollowObj<CoordVector>;

export type LifePoint = [bigint, bigint];
export type LifeLocality = LifePoint;

export const DEFAULT_UNIVERSE_SIZE = 2n ** 20n;
export const HUGE_UNIVERSE_SIZE = 2n ** 64n;
export let universeSize = DEFAULT_UNIVERSE_SIZE;
if (window.location.href.search(/[?&]huge-universe=1(?:&|$)/) > -1) {
    universeSize = HUGE_UNIVERSE_SIZE;
}

export class LifeMapError extends CustomError {}

export function compareLifePoints(a: LifePoint, b: LifePoint): number {
    const d = compareBigInts(a[0], b[0]);
    if (d) {
        return d;
    }
    return compareBigInts(a[1], b[1]);
}

export class LifeMap {
    public static readonly POPULATED_DELTA = 30n;

    private _container: CoordMatrix = obj();
    private _width = 0n;
    private _height = 0n;
    private _minX = 0n;
    private _maxX = 0n;
    private _minY = 0n;
    private _maxY = 0n;
    private _changeListeners: SimpleFn[] = [];

    constructor(mapWidth: BigIntSrc = universeSize, mapHeight: BigIntSrc = universeSize) {
        this._width = BigInt(mapWidth);
        this._height = BigInt(mapHeight);
        this.reset();
    }

    static stringifySaveData(data: Stringable[]): string {
        return data.join(';');
    }

    static parseSaveString(dump: string): string[] {
        return dump.split(';');
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
        x = BigInt(x);
        y = BigInt(y);

        if (x < 0n || x >= this._width || y < 0n || y >= this._height) {
            return false;
        }

        if (status !== undefined) {
            this._setStatusToContainer(x, y, status);
        }

        const keyX = x.toString();
        const keyY = y.toString();

        return Boolean(this._container[keyX]?.[keyY]);
    }

    getLifeLocalities() {
        /* eslint-disable guard-for-in */
        // About key iteration order: https://dev.to/frehner/the-order-of-js-object-keys-458d
        const res: LifeLocality[] = [];
        const passedCache = new Map<bigint, Set<bigint>>();

        const container = this._container;
        const mapWidth = this._width;
        const mapHeight = this._height;

        for (const xKey in container) {
            const xVal = BigInt(xKey);
            for (const yKey in container[xKey]) {
                const yVal = BigInt(yKey);
                for (let i = xVal - 1n; i <= xVal + 1n; ++i) {
                    for (let j = yVal - 1n; j <= yVal + 1n; ++j) {
                        if (
                            passedCache.get(i)?.has(j) === true ||
                            i < 0n || i >= mapWidth || j < 0n || j >= mapHeight
                        ) {
                            continue;
                        }

                        let curPassedLine = passedCache.get(i);
                        if (!curPassedLine) {
                            curPassedLine = new Set();
                            passedCache.set(i, curPassedLine);
                        }
                        curPassedLine.add(j);

                        res.push([i, j]);
                    }
                }
            }
        }
        return res.sort(compareLifePoints);
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

    getSaveData() {
        const data: Stringable[] = [this._width, this._height, this._minX, this._maxX, this._minY, this._maxY];

        const coords: string[] = [];
        for (const [keyX, vector] of Object.entries(this._container)) {
            coords.push(`${keyX}:${Object.keys(vector ?? emptyHollowObj).join(',')}`);
        }
        data.push(coords.join('|'));

        return data;
    }

    loadSaveData(data: string[]) {
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
            if (!keyX || !yStr) {
                continue;
            }

            const xVector = container[keyX] = obj();
            for (const keyY of yStr.split(',')) {
                xVector[keyY] = true;
            }
        }
    }

    private _setStatusToContainer(bigX: bigint, bigY: bigint, status: boolean) {
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
