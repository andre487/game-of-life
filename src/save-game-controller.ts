import type {U} from 'ts-toolbelt';
import {LifeMap} from './life-map';

export class SaveGameController {
    private _lifeMap: LifeMap;

    constructor(lifeMap: LifeMap) {
        this._lifeMap = lifeMap;
    }

    save() {
        window.localStorage.save = this._lifeMap.serialize();
    }

    load() {
        if (this.doesSaveExist()) {
            const dump = window.localStorage.save as string;
            this._lifeMap.loadSerializedState(dump);
        }
    }

    doesSaveExist() {
        const dump = window.localStorage.save as U.Nullable<string>;
        return Boolean(dump);
    }
}
