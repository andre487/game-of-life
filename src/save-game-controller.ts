import type {U} from 'ts-toolbelt';
import {LifeMap} from './life-map';

export class SaveGameController {
    public static readonly BUTTON_SAVE_NAME = 'save';
    public static readonly AUTO_SAVE_NAME = 'auto_save';

    private _lifeMap: LifeMap;

    constructor(lifeMap: LifeMap) {
        this._lifeMap = lifeMap;
    }

    save(saveName = SaveGameController.BUTTON_SAVE_NAME) {
        window.localStorage[saveName] = this._lifeMap.serialize();
    }

    load(saveName = SaveGameController.BUTTON_SAVE_NAME) {
        if (this.doesSaveExist(saveName)) {
            const dump = window.localStorage[saveName] as string;
            this._lifeMap.loadSerializedState(dump);
        }
    }

    doesSaveExist(saveName = SaveGameController.BUTTON_SAVE_NAME) {
        const dump = window.localStorage[saveName] as U.Nullable<string>;
        return Boolean(dump);
    }
}
