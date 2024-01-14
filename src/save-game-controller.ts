import type {U} from 'ts-toolbelt';
import {MapView} from './map-view';

export class SaveGameController {
    public static readonly BUTTON_SAVE_NAME = 'save';
    public static readonly AUTO_SAVE_NAME = 'auto_save';

    private _mapView: MapView;

    constructor(mapView: MapView) {
        this._mapView = mapView;
    }

    save(saveName = SaveGameController.BUTTON_SAVE_NAME) {
        window.localStorage[saveName] = this._mapView.getSaveString();
    }

    load(saveName = SaveGameController.BUTTON_SAVE_NAME) {
        if (this.doesSaveExist(saveName)) {
            const dump = window.localStorage[saveName] as string;
            this._mapView.loadSaveFromString(dump);
        }
    }

    doesSaveExist(saveName = SaveGameController.BUTTON_SAVE_NAME) {
        const dump = window.localStorage[saveName] as U.Nullable<string>;
        return Boolean(dump);
    }
}
