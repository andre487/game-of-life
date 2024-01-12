import type {GeneralFn, SimpleFn} from './common-types';
import type {CoordMatrix} from './life-map';
import {LifeMap} from './life-map';
import {call, obj, onNextTick} from './utils';

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
                for (const [keyY, state] of Object.entries(yVector)) {
                    this._lifeMap.isAlive(keyX, keyY, state);
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
        const populated = this._lifeMap.populatedRect;
        const changesTable: CoordMatrix = obj();

        for (let popI = populated.top; popI <= populated.bottom; ++popI) {
            for (let popJ = populated.left; popJ <= populated.right; ++popJ) {
                const state = this._lifeMap.isAlive(popI, popJ);

                let aliveSiblings = 0;
                for (let i = -1; i <= 1; ++i) {
                    for (let j = -1; j <= 1; ++j) {
                        if (!(i === 0 && j === 0)) {
                            const curI = popI + BigInt(i);
                            const curJ = popJ + BigInt(j);
                            aliveSiblings += this._lifeMap.isAlive(curI, curJ) ? 1 : 0;
                        }
                    }
                }

                const keyI = popI.toString();
                const keyJ = popJ.toString();

                if (state && !(aliveSiblings === 2 || aliveSiblings === 3)) {
                    changesTable[keyI] ??= obj();
                    changesTable[keyI][keyJ] = false;
                } else if (!state && aliveSiblings === 3) {
                    changesTable[keyI] ??= obj();
                    changesTable[keyI][keyJ] = true;
                }
            }
        }

        done(changesTable);
    };
}
