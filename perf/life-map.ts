import {LifeMap} from '../src/life-map';
import {bench, generateRandomLifePoints, MAX_BIG_INT} from '../src/test-utils';

bench('LifeMap.getLifeClusters()', function() {
    let lifeMap: LifeMap;

    function prepare() {
        lifeMap = new LifeMap(MAX_BIG_INT, MAX_BIG_INT);
        for (const [i, j] of generateRandomLifePoints()) {
            lifeMap.isAlive(i, j, true);
        }
    }

    this
        .add('Cur version', () => {
            lifeMap.getLifeClusters();
        })
        // .add('New version', () => {
        //     lifeMap.getLifeClusters2();
        // })
        .on('start', prepare)
        .on('cycle', prepare);
});
