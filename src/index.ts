import {MapView} from './map-view';
import {onPageReady} from './utils';

onPageReady(function() {
    const mapView = new MapView('map', null);

    console.log('FOO!', mapView);
});
