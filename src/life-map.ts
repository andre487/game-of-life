import type {BigIntSrc} from './common-types';
import {ensureBigInt, enterValueToInterval} from './utils';

type ChangeListener = () => void;

export interface PopulatedRect {
    top: bigint;
    right: bigint;
    bottom: bigint;
    left: bigint;
}

export class LifeMap {
    public static readonly POPULATED_DELTA = 30n;

    private _width: bigint;
    private _height: bigint;
    private _minX: bigint;
    private _maxX: bigint;
    private _minY: bigint;
    private _maxY: bigint;
    private _changeListeners: ChangeListener[];

    constructor(mapWidth: BigIntSrc, mapHeight: BigIntSrc) {
        this._width = ensureBigInt(mapWidth);
        this._height = ensureBigInt(mapHeight);

        this._minX = this._height - 1n;
        this._maxX = 0n;
        this._minY = this._width - 1n;
        this._maxY = 0n;
        this._changeListeners = [];
    }

    get width(): bigint {
        return this._width;
    }

    get height(): bigint {
        return this._height;
    }

    get populatedRect(): PopulatedRect {
        return {
            top: this._minY,
            right: this._maxX,
            bottom: this._maxY,
            left: this._minX,
        };
    }

    isAlive(x: BigIntSrc, y: BigIntSrc, status?: boolean) {
        const bigX = enterValueToInterval(x, this._width);
        const bigY = enterValueToInterval(y, this._height);

        if (status !== undefined) {
            // this._setStatusToContainer(bigX, bigY, status);
        }

        const keyX = bigX.toString();
        const keyY = bigY.toString();

        console.log(keyX, keyY);
        // return Boolean(this._container[keyX]?.[keyY]);
    }
}
