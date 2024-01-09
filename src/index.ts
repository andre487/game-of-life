import {ControlsView} from './controls-view';
import {GameOfLife} from './game';
import {LifeMap} from './life-map';
import {MapView} from './map-view';
import {SaveGameController} from './save-game-controller';
import {onPageReady} from './utils';

// const UNIVERSE_SIZE = 2n ** 64n;
const UNIVERSE_SIZE = 200n;

onPageReady(function() {
    const lifeMap = new LifeMap(UNIVERSE_SIZE, UNIVERSE_SIZE);
    const mapView = new MapView(lifeMap);
    const game = new GameOfLife(lifeMap);
    const saveGameController = new SaveGameController(lifeMap);
    const controlsView = new ControlsView(game, saveGameController);

    game.onStart(mapView.endInput);
    game.onStop(mapView.beginInput);
    game.onRound(mapView.render);

    mapView.render();
    mapView.beginInput();
    controlsView.init();

    console.log('Success!');
});
