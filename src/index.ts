import {LifeMap} from './life-map';
import {MapView} from './map-view';
import {onPageReady} from './utils';

const UNIVERSE_SIZE = 2n ** 64n;

onPageReady(function() {
    const lifeMap = new LifeMap(UNIVERSE_SIZE, UNIVERSE_SIZE);
    const mapView = new MapView('map', lifeMap);

    mapView.render();
    mapView.beginInput();

    console.log('Success!');
});
