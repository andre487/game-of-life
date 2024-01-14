import type {GeneralFn, SimpleFn} from './common-types';
import type {CoordMatrix} from './life-map';
import {LifeMap} from './life-map';
import {call, emptyHollowObj, obj, onNextTick} from './utils';

export enum GameOfLifeState {
    Stopped = 'Stopped',
    Running = 'Running',
    Stopping = 'Stopping',
    Completed = 'Completed',
}

export class GameOfLife {
    public static readonly ROUND_TIME = 250;

    private _lifeMap: LifeMap;
    private _stopFlag = false;
    private _startCallbacks: SimpleFn[] = [];
    private _stopCallbacks: SimpleFn[] = [];
    private _roundCallbacks: SimpleFn[] = [];
    private _state = GameOfLifeState.Stopped;
    private _roundStartTime = 0;

    constructor(lifeMap: LifeMap) {
        this._lifeMap = lifeMap;
    }

    get state() {
        return this._state;
    }

    onStart(cb: SimpleFn) {
        this._startCallbacks.push(cb);
    }

    onStop(cb: SimpleFn) {
        this._stopCallbacks.push(cb);
    }

    onRound(cb: SimpleFn) {
        this._roundCallbacks.push(cb);
    }

    stop() {
        this._stopFlag = true;
        this._state = GameOfLifeState.Stopping;
    }

    run() {
        const onRoundComplete = (changesTable: CoordMatrix) => {
            let changed = false;
            for (const [keyX, yVector] of Object.entries(changesTable)) {
                for (const [keyY, state] of Object.entries(yVector ?? emptyHollowObj)) {
                    this._lifeMap.isAlive(keyX, keyY, state ?? false);
                    changed = true;
                }
            }

            onNextTick(() => {
                this._roundCallbacks.forEach(call);
            });

            if (!changed) {
                this._state = GameOfLifeState.Completed;
                onNextTick(() => {
                    this._stopCallbacks.forEach(call);
                });
            } else if (this._stopFlag) {
                this._state = GameOfLifeState.Stopped;
                onNextTick(() => {
                    this._stopCallbacks.forEach(call);
                });
            } else {
                makeRound();
            }
        };

        const makeRound = () => {
            const delta = GameOfLife.ROUND_TIME - (Date.now() - this._roundStartTime);
            setTimeout(() => this._runRoundAsync(onRoundComplete), delta);
        };

        this._stopFlag = false;
        this._roundStartTime = Date.now();
        makeRound();

        this._state = GameOfLifeState.Running;

        onNextTick(() => {
            this._startCallbacks.forEach(call);
        });
    }

    private _runRoundAsync = (done: GeneralFn<[CoordMatrix], void>) => {
        this._roundStartTime = Date.now();
        const aliveLocs = this._lifeMap.getAliveLocalities();

        const changesTable: CoordMatrix = obj();

        for (const [xVal, yVal] of aliveLocs) {
            const state = this._lifeMap.isAlive(xVal, yVal);

            let aliveSiblings = 0;
            for (let i = xVal - 1n; i <= xVal + 1n; ++i) {
                for (let j = yVal - 1n; j <= yVal + 1n; ++j) {
                    if (!(i === xVal && j === yVal)) {
                        aliveSiblings += this._lifeMap.isAlive(i, j) ? 1 : 0;
                    }
                }
            }

            const xKey = xVal.toString();
            const yKey = yVal.toString();
            if (state && !(aliveSiblings === 2 || aliveSiblings === 3)) {
                (changesTable[xKey] ??= obj())[yKey] = false;
            } else if (!state && aliveSiblings === 3) {
                (changesTable[xKey] ??= obj())[yKey] = true;
            }
        }

        done(changesTable);
    };
}
