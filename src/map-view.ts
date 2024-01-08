import {U} from 'ts-toolbelt';
import {createErrorThrower} from './utils';

class MapViewError extends Error {}

const thr = createErrorThrower(MapViewError);

export class MapView {
    private canvas: HTMLCanvasElement;
    private canvasRect: DOMRect;
    private canvasWidth: number;
    private canvasHeight: number;

    private ctx: CanvasRenderingContext2D;
    private lifeMap: unknown;

    constructor(canvasId: string, lifeMap: unknown) {
        this.lifeMap = lifeMap;

        this.canvas = document.getElementById(canvasId) as U.Nullable<HTMLCanvasElement> ?? thr('Canvas not found');
        this.canvasRect = this.canvas.getBoundingClientRect();
        this.canvasWidth = this.canvas.clientWidth;
        this.canvasHeight = this.canvas.clientHeight;

        this.ctx = this.canvas.getContext('2d') ?? thr('Failed to create context');
        this.ctx.fillStyle = '#708090';
        this.ctx.strokeStyle = '#e6e6fa';
    }
}
