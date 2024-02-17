import type {U} from 'ts-toolbelt';
import type {ObjMap} from './common-types';
import {LifeMap} from './life-map';
import styles from './styles';
import {bigIntMinMax, createErrorThrower, CustomError, numberFormatter, throttle} from './utils';

export class MapViewError extends CustomError {}

const thr = createErrorThrower(MapViewError);

export enum MapViewState {
    Initial = 'Initial',
    Rendered = 'Rendered',
    Input = 'Input',
}

export class MapView {
    public static readonly DEFAULT_CELL_WIDTH = 12;
    public static readonly DEFAULT_CELL_HEIGHT = 12;
    public static readonly MIN_CELL_SIZE = 5;
    public static readonly MAX_CELL_SIZE = 22;

    private _state: MapViewState = MapViewState.Initial;

    private readonly _canvas: HTMLCanvasElement;
    private readonly _canvasRect: DOMRect;
    private readonly _canvasWidth: number;
    private readonly _canvasHeight: number;

    private _cellWidth = MapView.DEFAULT_CELL_WIDTH;
    private _cellHeight = MapView.DEFAULT_CELL_HEIGHT;

    private readonly _ctx: CanvasRenderingContext2D;
    private readonly _lifeMap: LifeMap;
    private _cellsByHorizontal = 0;
    private _cellsByVertical = 0;
    private _cellsHorizontalOffset = 0n;
    private _cellsVerticalOffset = 0n;
    private _curFrameRequest: U.Nullable<number> = null;
    private _xValue: HTMLSpanElement;
    private _yValue: HTMLSpanElement;
    private _popWidth: HTMLSpanElement;
    private _popHeight: HTMLSpanElement;

    constructor(lifeMap: LifeMap) {
        this._lifeMap = lifeMap;

        this._canvas = document.getElementById('map') as U.Nullable<HTMLCanvasElement> ?? thr('Canvas not found');
        this._canvasRect = this._canvas.getBoundingClientRect();
        this._canvasWidth = this._canvas.clientWidth;
        this._canvasHeight = this._canvas.clientHeight;

        this._ctx = this._canvas.getContext('2d') ?? thr('Failed to create context');
        this._ctx.fillStyle = styles.gridFill;
        this._ctx.strokeStyle = styles.gridStroke;

        this._xValue = document.getElementById('map-params__item-x') ?? thr('No X value');
        this._yValue = document.getElementById('map-params__item-y') ?? thr('No Y value');
        this._popWidth = document.getElementById('map-params__item-populated-width') ?? thr('No pop width value');
        this._popHeight = document.getElementById('map-params__item-populated-height') ?? thr('No pop width value');

        this._initMapData();
        this._lifeMap.addChangeListener(() => {
            this._initMapData();
            this.renderWhenFrame();
        });

        new MapViewNavigationHandler(this);
    }

    get canvas() {
        return this._canvas;
    }

    get cellWidth() {
        return this._cellWidth;
    }

    get cellHeight() {
        return this._cellHeight;
    }

    getSaveString() {
        const data = this._lifeMap.getSaveData();
        data.push(this._cellWidth, this._cellHeight, this._cellsHorizontalOffset, this._cellsVerticalOffset);
        return LifeMap.stringifySaveData(data);
    }

    loadSaveFromString(dump: string) {
        const data = LifeMap.parseSaveString(dump);
        this._lifeMap.loadSaveData(data);
        if (data.length < 11) {
            this._initMapData();
            return this.renderWhenFrame();
        }

        this._cellWidth = parseInt(data[7]) || MapView.DEFAULT_CELL_WIDTH;
        this._cellHeight = parseInt(data[8]) || MapView.DEFAULT_CELL_HEIGHT;
        this._initMapData(false);

        try {
            this._cellsHorizontalOffset = BigInt(data[9]);
            this._cellsVerticalOffset = BigInt(data[10]);
        } catch (e) {
            window.reportError(e);
            this._setCenterOffsets();
        }

        this.renderWhenFrame();
    }

    render = () => {
        this._ctx.clearRect(0, 0, this._canvasWidth, this._canvasHeight);

        let i = this._cellsVerticalOffset;
        const M = i + BigInt(this._cellsByVertical);
        for (; i <= M; ++i) {
            let j = this._cellsHorizontalOffset;
            const N = j + BigInt(this._cellsByHorizontal);
            for (; j <= N; ++j) {
                this._setCellState(i, j, this._lifeMap.isAlive(i, j));
            }
        }

        if (this._state !== MapViewState.Input) {
            this._state = MapViewState.Rendered;
        }

        this._xValue.innerHTML = numberFormatter.format(this._cellsVerticalOffset);
        this._yValue.innerHTML = numberFormatter.format(this._cellsHorizontalOffset);

        const populated = this._lifeMap.populatedRect;
        this._popWidth.innerHTML = numberFormatter.format(
            bigIntMinMax(populated.right - populated.left, 0n, this._lifeMap.width),
        );
        this._popHeight.innerHTML = numberFormatter.format(
            bigIntMinMax(populated.bottom - populated.top, 0n, this._lifeMap.height),
        );
    };

    moveBy = (deltaX: bigint, deltaY: bigint) => {
        this._cellsHorizontalOffset = bigIntMinMax(this._cellsHorizontalOffset + deltaX, 0n, this._lifeMap.width);
        this._cellsVerticalOffset = bigIntMinMax(this._cellsVerticalOffset + deltaY, 0n, this._lifeMap.height);
        this.renderWhenFrame();
    };

    moveToCenter = () => {
        this._setCenterOffsets();
        this.renderWhenFrame();
    };

    resizeCellsBy(delta: number) {
        const intDelta = Math.trunc(delta);
        const newWidth = this._cellWidth + intDelta;
        const newHeight = this._cellHeight + intDelta;
        this.setCellsSizes(newWidth, newHeight);
    }

    resetCellsSize() {
        this.setCellsSizes(MapView.DEFAULT_CELL_WIDTH, MapView.DEFAULT_CELL_HEIGHT);
    }

    setCellsSizes(width: number, height: number) {
        let changed = false;

        if (this._cellWidth !== width && width >= MapView.MIN_CELL_SIZE && width <= MapView.MAX_CELL_SIZE) {
            this._cellWidth = width;
            changed = true;
        }

        if (this._cellHeight !== height && height >= MapView.MIN_CELL_SIZE && height <= MapView.MAX_CELL_SIZE) {
            this._cellHeight = height;
            changed = true;
        }

        if (changed) {
            const oldCenterX = this._cellsHorizontalOffset + BigInt(this._cellsByHorizontal) / 2n;
            const oldCenterY = this._cellsVerticalOffset + BigInt(this._cellsByVertical) / 2n;

            this._initMapData();

            this._cellsHorizontalOffset = oldCenterX - BigInt(this._cellsByHorizontal) / 2n;
            this._cellsVerticalOffset = oldCenterY - BigInt(this._cellsByVertical) / 2n;

            this.renderWhenFrame();
        }
    }

    renderWhenFrame = () => {
        if (this._curFrameRequest) {
            if (process.env.NODE_ENV === 'development') {
                console.warn('Skip render frame');
            }
            return;
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

    private _initMapData(setCentralOffset = true) {
        this._cellsByHorizontal = Math.floor(this._canvasWidth / this._cellWidth);
        if (this._cellsByHorizontal > this._lifeMap.width) {
            throw new MapViewError('Map width is too low');
        }

        this._cellsByVertical = Math.floor(this._canvasHeight / this._cellHeight);
        if (this._cellsByVertical > this._lifeMap.height) {
            throw new MapViewError('Map height is too low');
        }

        if (setCentralOffset) {
            this._setCenterOffsets();
        }
    }

    private _setCenterOffsets() {
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
        const curVerticalOffset = BigInt(Math.trunc((clientY - this._canvasRect.top) / this._cellHeight));
        const curHorizontalOffset = BigInt(Math.trunc((clientX - this._canvasRect.left) / this._cellWidth));
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
        const x = Number(j - this._cellsHorizontalOffset) * this._cellWidth;
        const y = Number(i - this._cellsVerticalOffset) * this._cellHeight;

        const ctx = this._ctx;
        if (isAlive) {
            ctx.fillRect(x, y, this._cellWidth, this._cellHeight);
            const baseStrokeStyle = ctx.strokeStyle;
            ctx.strokeStyle = styles.gridBorderColor;
            ctx.strokeRect(x, y, this._cellWidth, this._cellHeight);
            ctx.strokeStyle = baseStrokeStyle;
        } else {
            ctx.clearRect(x, y, this._cellWidth, this._cellHeight);
            ctx.strokeRect(x, y, this._cellWidth, this._cellHeight);
        }
    }
}

class MapViewNavigationHandler {
    public static readonly SCROLL_TIMEOUT = 32;
    public static readonly KEY_TIMEOUT = 16;
    public static readonly ZOOM_TIMEOUT = 75;

    public static readonly KEY_ACTIONS: ObjMap = {
        KeyW: 'up',
        KeyA: 'left',
        KeyS: 'down',
        KeyD: 'right',

        ArrowUp: 'up',
        ArrowLeft: 'left',
        ArrowDown: 'down',
        ArrowRight: 'right',

        __proto__: null,
    };

    private _pointerLocked = false;

    private readonly _mapView: MapView;

    private readonly _onScrollThrottled: (e: WheelEvent) => void;
    private readonly _onZoomThrottled: (arg: WheelEvent) => void;
    private readonly _onKeyThrottled: (arg: KeyboardEvent) => void;

    constructor(mapView: MapView) {
        this._mapView = mapView;

        this._onScrollThrottled = throttle(this._onScroll, MapViewNavigationHandler.SCROLL_TIMEOUT);
        this._onZoomThrottled = throttle(this._onZoom, MapViewNavigationHandler.ZOOM_TIMEOUT);
        this._onKeyThrottled = throttle(this._onKey, MapViewNavigationHandler.KEY_TIMEOUT);

        const canvas = this._mapView.canvas;
        canvas.addEventListener('mouseenter', this._lockPointer);
        canvas.addEventListener('mouseleave', this._unlockPointer);
        canvas.addEventListener('wheel', this._onScrollThrottled as EventListener);
        canvas.addEventListener('wheel', this._onZoomThrottled as EventListener);
        canvas.addEventListener('wheel', this._defaultPreventer);

        window.addEventListener('keydown', this._onKeyThrottled as EventListener);
        window.addEventListener('keydown', this._defaultPreventer);
    }

    private _onScroll = (events: WheelEvent[]) => {
        let deltaX = 0;
        let deltaY = 0;

        for (const event of events) {
            if (event.metaKey || event.ctrlKey) {
                continue;
            }
            deltaX += event.deltaX;
            deltaY += event.deltaY;
        }

        if (!deltaX && !deltaY) {
            return;
        }

        const finalX = BigInt(Math.trunc(deltaX / this._mapView.cellWidth));
        const finalY = BigInt(Math.trunc(deltaY / this._mapView.cellHeight));

        if (finalX || finalY) {
            this._mapView.moveBy(finalX, finalY);
        }
    };

    private _onKey = (events: KeyboardEvent[]) => {
        if (!this._pointerLocked) {
            return;
        }

        let deltaX = 0;
        let deltaY = 0;
        let wasMod = false;

        for (const e of events) {
            const action = MapViewNavigationHandler.KEY_ACTIONS[e.code];
            switch (action) {
            case 'up':
                deltaY += 1;
                break;
            case 'left':
                deltaX += 1;
                break;
            case 'down':
                deltaY -= 1;
                break;
            case 'right':
                deltaX -= 1;
                break;
            }

            if (action && (e.metaKey || e.ctrlKey)) {
                wasMod = true;
            }
        }

        if (wasMod && (deltaX || deltaY)) {
            let finalDelta = deltaX;
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                finalDelta = deltaY;
            }
            finalDelta = Math.round(finalDelta);
            this._mapView.resizeCellsBy(-finalDelta);
            return;
        }

        if (deltaX || deltaY) {
            this._mapView.moveBy(BigInt(deltaX), BigInt(deltaY));
        }
    };

    private _onZoom = (events: WheelEvent[]) => {
        let deltaX = 0;
        let deltaY = 0;

        for (const event of events) {
            if (!event.metaKey && !event.ctrlKey) {
                continue;
            }
            deltaX -= event.deltaX;
            deltaY -= event.deltaY;
        }

        if (!deltaX && !deltaY) {
            return;
        }

        let finalDelta = deltaX;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            finalDelta = deltaY;
        }
        finalDelta = Math.round(finalDelta / 10);

        this._mapView.resizeCellsBy(finalDelta);
    };

    private _lockPointer = () => {
        this._pointerLocked = true;
    };

    private _unlockPointer = () => {
        this._pointerLocked = false;
    };

    private _defaultPreventer = (e: Event) => {
        if (!this._pointerLocked) {
            return;
        }

        const isKey = e instanceof KeyboardEvent;
        const isMouse = e instanceof MouseEvent;

        if ((isKey || isMouse) && (e.shiftKey || e.altKey)) {
            return;
        }

        if (
            isKey && (e.ctrlKey || e.metaKey) &&
            (e.code === 'Digit0' || e.code === 'Minus' || e.code === 'Equal')
        ) {
            return;
        }

        e.preventDefault();
    };
}
