import type {U} from 'ts-toolbelt';
import {UnknownFn} from './common-types';
import {LifeMap} from './life-map';
import {createErrorThrower, CustomError, throttle} from './utils';

export class MapViewError extends CustomError {}

const thr = createErrorThrower(MapViewError);

export enum MapViewState {
    Initial = 'Initial',
    Rendered = 'Rendered',
    Input = 'Input',
    Life = 'Life',
}

export class MapView {
    public static readonly CELL_WIDTH = 15;
    public static readonly CELL_HEIGHT = 15;

    private _state: MapViewState = MapViewState.Initial;

    private readonly _canvas: HTMLCanvasElement;
    private readonly _canvasRect: DOMRect;
    private readonly _canvasWidth: number;
    private readonly _canvasHeight: number;

    private readonly _ctx: CanvasRenderingContext2D;
    private readonly _lifeMap: LifeMap;
    private _cellsByHorizontal = 0;
    private _cellsByVertical = 0;
    private _cellsHorizontalOffset = 0n;
    private _cellsVerticalOffset = 0n;
    private _curFrameRequest: U.Nullable<number> = null;
    private _scrollHandler: MapViewScrollHandler;

    constructor(lifeMap: LifeMap) {
        this._lifeMap = lifeMap;

        this._canvas = document.getElementById('map') as U.Nullable<HTMLCanvasElement> ?? thr('Canvas not found');
        this._canvasRect = this._canvas.getBoundingClientRect();
        this._canvasWidth = this._canvas.clientWidth;
        this._canvasHeight = this._canvas.clientHeight;

        this._ctx = this._canvas.getContext('2d') ?? thr('Failed to create context');
        this._ctx.fillStyle = '#708090';
        this._ctx.strokeStyle = '#e6e6fa';

        this._initMapData();
        this._lifeMap.addChangeListener(() => {
            this._initMapData();
            this.render();
        });

        this._scrollHandler = new MapViewScrollHandler(this);
    }

    render = () => {
        this._ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);

        let i = this._cellsVerticalOffset;
        const M = i + BigInt(this._cellsByVertical);
        for (; i < M; ++i) {
            let j = this._cellsHorizontalOffset;
            const N = j + BigInt(this._cellsByHorizontal);
            for (; j < N; ++j) {
                this._setCellState(i, j, this._lifeMap.isAlive(i, j));
            }
        }

        if (this._state !== MapViewState.Input) {
            this._state = MapViewState.Rendered;
        }
    };

    moveBy = (deltaX: bigint, deltaY: bigint) => {
        this._cellsHorizontalOffset += deltaX;
        this._cellsVerticalOffset += deltaY;
        this.renderWhenFrame();
    };

    renderWhenFrame = () => {
        if (this._curFrameRequest) {
            cancelAnimationFrame(this._curFrameRequest);
            console.warn('Skip render frame');
        }

        this._curFrameRequest = requestAnimationFrame(() => {
            this._curFrameRequest = null;
            this.render();
        });
    };

    beginInput = () => {
        if (this._state !== MapViewState.Rendered) {
            throw new Error('Input is not available');
        }
        this._state = MapViewState.Input;
        this._canvas.addEventListener('click', this._inputListener);
    };

    endInput = () => {
        if (this._state !== MapViewState.Input) {
            throw new MapViewError('Input is not available');
        }
        this._state = MapViewState.Rendered;
        this._canvas.removeEventListener('click', this._inputListener);
    };

    get canvas() {
        return this._canvas;
    }

    private _initMapData() {
        this._cellsByHorizontal = Math.floor(this._canvasWidth / MapView.CELL_WIDTH);
        if (this._cellsByHorizontal > this._lifeMap.width) {
            throw new MapViewError('Map width is too low');
        }

        this._cellsByVertical = Math.floor(this._canvasHeight / MapView.CELL_HEIGHT);
        if (this._cellsByVertical > this._lifeMap.height) {
            throw new MapViewError('Map height is too low');
        }

        this._cellsHorizontalOffset = (this._lifeMap.width - BigInt(this._cellsByHorizontal)) / 2n;
        this._cellsVerticalOffset = (this._lifeMap.height - BigInt(this._cellsByVertical)) / 2n;
    }

    private _inputListener = (event: MouseEvent) => {
        if (this._state !== MapViewState.Input) {
            throw new MapViewError('The map not into INPUT state');
        }
        const cell = this._getCellByClientCoordinates(event.clientX, event.clientY);
        this._toggleCellState(cell.top, cell.left);
    };

    private _getCellByClientCoordinates(clientX: number, clientY: number) {
        const curVerticalOffset = BigInt(Math.trunc((clientY - this._canvasRect.top) / MapView.CELL_HEIGHT));
        const curHorizontalOffset = BigInt(Math.trunc((clientX - this._canvasRect.left) / MapView.CELL_WIDTH));
        return {
            top: this._cellsVerticalOffset + curVerticalOffset,
            left: this._cellsHorizontalOffset + curHorizontalOffset,
        };
    }

    private _toggleCellState(i: bigint, j: bigint) {
        const isAlive = !this._lifeMap.isAlive(i, j);
        this._setCellState(i, j, isAlive);
    }

    private _setCellState(i: bigint, j: bigint, isAlive: boolean) {
        this._lifeMap.isAlive(i, j, isAlive);
        const x = Number(j - this._cellsHorizontalOffset) * MapView.CELL_WIDTH;
        const y = Number(i - this._cellsVerticalOffset) * MapView.CELL_HEIGHT;
        if (isAlive) {
            this._ctx.fillRect(x, y, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
        } else {
            this._ctx.clearRect(x, y, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
            this._ctx.strokeRect(x, y, MapView.CELL_WIDTH, MapView.CELL_HEIGHT);
        }
    }
}

class MapViewScrollHandler {
    public static readonly SCROLL_TIMEOUT = 32;
    private readonly _mapView: MapView;
    private readonly _canvas: HTMLCanvasElement;
    private readonly _onScrollThrottled: EventListener;

    constructor(mapView: MapView) {
        this._mapView = mapView;
        this._canvas = this._mapView.canvas;

        this._onScrollThrottled = throttle(
            this._onScroll as UnknownFn,
            MapViewScrollHandler.SCROLL_TIMEOUT,
        ) as EventListener;

        this._canvas.addEventListener('mousewheel', this._onScrollThrottled);
    }

    private _onScroll = (events: WheelEvent[][]) => {
        let deltaX = 0;
        let deltaY = 0;

        for (const [event] of events) {
            deltaX += event.deltaX;
            deltaY += event.deltaY;
        }

        const finalX = BigInt(Math.trunc(deltaX / MapView.CELL_WIDTH));
        const finalY = BigInt(Math.trunc(deltaY / MapView.CELL_HEIGHT));
        this._mapView.moveBy(finalX, finalY);
    };
}
