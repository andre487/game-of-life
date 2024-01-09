import type {GeneralCallback, SimpleCallback} from './common-types';
import type {CoordMatrix, CoordVector} from './life-map';
import {LifeMap} from './life-map';
import {call, obj, setImmediate} from './utils';

export enum GameOfLifeState {
    Stopped = 'Stopped',
    Running = 'Running',
    Stopping = 'Stopping',
    Completed = 'Completed',
}

export class GameOfLife {
    private _lifeMap: LifeMap;
    private _stopFlag = false;
    private _startCallbacks: SimpleCallback[] = [];
    private _stopCallbacks: SimpleCallback[] = [];
    private _roundCallbacks: SimpleCallback[] = [];
    private _state = GameOfLifeState.Stopped;

    constructor(lifeMap: LifeMap) {
        this._lifeMap = lifeMap;
    }

    get state() {
        return this._state;
    }

    onStart(cb: SimpleCallback) {
        this._startCallbacks.push(cb);
    }

    onStop(cb: SimpleCallback) {
        this._stopCallbacks.push(cb);
    }

    onRound(cb: SimpleCallback) {
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

            console.log('changesTable', changesTable);

            setImmediate(() => {
                this._roundCallbacks.forEach(call);
            });

            if (!changed) {
                this._state = GameOfLifeState.Completed;
                setImmediate(() => {
                    this._stopCallbacks.forEach(call);
                });
            } else if (this._stopFlag) {
                this._state = GameOfLifeState.Stopped;
                setImmediate(() => {
                    this._stopCallbacks.forEach(call);
                });
            } else {
                makeRound();
            }
        };

        const makeRound = () => {
            setImmediate(this._runRoundAsync, onRoundComplete);
        };

        this._stopFlag = false;
        makeRound();

        this._state = GameOfLifeState.Running;

        setImmediate(() => {
            this._startCallbacks.forEach(call);
        });
    }

    private _runRoundAsync = (done: GeneralCallback<[CoordMatrix], void>) => {
        const populated = this._lifeMap.populatedRect;
        const changesTable = obj() as CoordMatrix;

        const walkByColumn = (bigI: bigint) => {
            let bigJ = populated.left;
            makeStep();

            function makeStep() {
                handleCell(bigI, bigJ);
                ++bigJ;
                if (bigJ <= populated.right) {
                    makeStep();
                } else {
                    ++bigI;
                    if (bigI <= populated.bottom) {
                        setImmediate(walkByColumn, bigI);
                    } else {
                        done(changesTable);
                    }
                }
            }
        };

        const handleCell = (bigX: bigint, bigY: bigint) => {
            const state = this._lifeMap.isAlive(bigX, bigY);
            let aliveSiblings = 0;
            for (let i = -1; i <= 1; ++i) {
                for (let j = -1; j <= 1; ++j) {
                    if (!(i === 0 && j === 0)) {
                        const curI = bigX + BigInt(i);
                        const curJ = bigY + BigInt(j);
                        aliveSiblings += this._lifeMap.isAlive(curI, curJ) ? 1 : 0;
                    }
                }
            }

            const keyX = bigX.toString();
            const keyY = bigY.toString();
            if (state && !(aliveSiblings === 2 || aliveSiblings === 3)) {
                changesTable[keyX] = changesTable[keyX] || obj() as CoordVector;
                changesTable[keyX][keyY] = false;
            } else if (!state && aliveSiblings === 3) {
                changesTable[keyX] = changesTable[keyX] || obj() as CoordVector;
                changesTable[keyX][keyY] = true;
            }
        };

        setImmediate(walkByColumn, populated.top);
    };
}
