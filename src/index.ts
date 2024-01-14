import {ControlsView} from './controls-view';
import {GameOfLife} from './game';
import {LifeMap} from './life-map';
import {MapView} from './map-view';
import {MessagesView} from './messages-view';
import {SaveGameController} from './save-game-controller';
import {onPageReady} from './utils';

// const UNIVERSE_SIZE = 2n ** 64n;
const UNIVERSE_SIZE = 1024n;

onPageReady(function() {
    const messagesView = new MessagesView();
    messagesView.bindToErrors();

    const lifeMap = new LifeMap(UNIVERSE_SIZE, UNIVERSE_SIZE);
    const mapView = new MapView(lifeMap);
    const game = new GameOfLife(lifeMap);
    const saveGameController = new SaveGameController(mapView);
    const controlsView = new ControlsView({
        lifeMap,
        mapView,
        game,
        saveGameController,
        messagesView,
    });

    game.onStart(mapView.endInput);
    game.onStop(mapView.beginInput);
    game.onRound(mapView.renderWhenFrame);

    mapView.render();
    mapView.beginInput();
    controlsView.init();

    console.log('Game is ready!');
});
