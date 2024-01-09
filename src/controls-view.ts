import type {U} from 'ts-toolbelt';
import {GameOfLife, GameOfLifeState} from './game';
import {SaveGameController} from './save-game-controller';
import {createErrorThrower, CustomError} from './utils';

export class ControlsViewError extends CustomError {}

const thr = createErrorThrower(ControlsViewError);

type MaybeButton = U.Nullable<HTMLButtonElement>;

export class ControlsView {
    private _game: GameOfLife;
    private _startButton: HTMLButtonElement;
    private _stopButton: HTMLButtonElement;
    private _saveButton: HTMLButtonElement;
    private _loadButton: HTMLButtonElement;
    private _saveGameController: SaveGameController;

    constructor(game: GameOfLife, saveGameController: SaveGameController) {
        this._game = game;
        this._saveGameController = saveGameController;

        this._startButton = document.getElementById('start') as MaybeButton ?? thr('Button not found');
        this._stopButton = document.getElementById('stop') as MaybeButton ?? thr('Button not found');
        this._saveButton = document.getElementById('save') as MaybeButton ?? thr('Button not found');
        this._loadButton = document.getElementById('load') as MaybeButton ?? thr('Button not found');
    }

    init() {
        this._game.onStart(() => {
            this._startButton.setAttribute('disabled', '');
            this._stopButton.removeAttribute('disabled');
            this._loadButton.setAttribute('disabled', '');
        });

        this._game.onStop(() => {
            this._stopButton.setAttribute('disabled', '');
            this._startButton.removeAttribute('disabled');
            if (this._saveGameController.doesSaveExist()) {
                this._loadButton.removeAttribute('disabled');
            }
            if (this._game.state == GameOfLifeState.Completed) {
                // messages.showMessage('The game is completed!');
            }
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
            // messages.showMessage('You have a saved game');
        }
    }
}
