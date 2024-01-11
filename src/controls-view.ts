import type {U} from 'ts-toolbelt';
import {GameOfLife, GameOfLifeState} from './game';
import {LifeMap} from './life-map';
import {MapView} from './map-view';
import {MessagesView} from './messages-view';
import {SaveGameController} from './save-game-controller';
import {createErrorThrower, CustomError} from './utils';

export class ControlsViewError extends CustomError {}

const thr = createErrorThrower(ControlsViewError);

type MaybeButton = U.Nullable<HTMLButtonElement>;

export interface ControlsViewParams {
    lifeMap: LifeMap;
    mapView: MapView;
    game: GameOfLife;
    saveGameController: SaveGameController;
    messagesView: MessagesView;
}

export class ControlsView {
    private _lifeMap: LifeMap;
    private _mapView: MapView;
    private _game: GameOfLife;
    private _startButton: HTMLButtonElement;
    private _stopButton: HTMLButtonElement;
    private _saveButton: HTMLButtonElement;
    private _loadButton: HTMLButtonElement;
    private _saveGameController: SaveGameController;
    private _messagesView: MessagesView;
    private _resetButton: HTMLButtonElement;

    constructor(params: ControlsViewParams) {
        this._lifeMap = params.lifeMap;
        this._mapView = params.mapView;
        this._game = params.game;
        this._saveGameController = params.saveGameController;
        this._messagesView = params.messagesView;

        this._startButton = document.getElementById('start') as MaybeButton ?? thr('Button not found');
        this._stopButton = document.getElementById('stop') as MaybeButton ?? thr('Button not found');
        this._saveButton = document.getElementById('save') as MaybeButton ?? thr('Button not found');
        this._loadButton = document.getElementById('load') as MaybeButton ?? thr('Button not found');
        this._resetButton = document.getElementById('reset') as MaybeButton ?? thr('Button not found');
    }

    init() {
        this._game.onStart(() => {
            this._startButton.setAttribute('disabled', '');
            this._stopButton.removeAttribute('disabled');
            this._loadButton.setAttribute('disabled', '');
            this._resetButton.setAttribute('disabled', '');
        });

        this._game.onStop(() => {
            this._stopButton.setAttribute('disabled', '');
            this._startButton.removeAttribute('disabled');
            if (this._saveGameController.doesSaveExist()) {
                this._loadButton.removeAttribute('disabled');
            }
            if (this._game.state === GameOfLifeState.Completed) {
                this._messagesView.showMessage('The game is completed!');
            }
            this._resetButton.removeAttribute('disabled');
        });

        this._startButton.onclick = () => {
            this._game.run();
        };

        this._stopButton.onclick = () => {
            this._game.stop();
        };

        this._saveButton.onclick = () => {
            this._saveGameController.save();
        };

        this._loadButton.onclick = () => {
            this._saveGameController.load();
        };

        if (this._saveGameController.doesSaveExist()) {
            this._loadButton.removeAttribute('disabled');
            this._messagesView.showMessage('You have a saved game');
        }

        this._resetButton.onclick = () => {
            this._lifeMap.reset();
            this._mapView.renderWhenFrame();
        };
    }
}
