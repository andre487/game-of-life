import Benchmark from 'benchmark';
import {LifePoint} from './life-map';

export const MAX_BIG_INT = 2n ** 64n;
export const MAX_SAFE_BIG_INT = BigInt(Number.MAX_SAFE_INTEGER);

export function shuffleArray<T extends unknown[]>(arr: T): T {
    let curIndex = arr.length;
    while (curIndex > 0) {
        const randIndex = Math.trunc(Math.random() * curIndex);
        --curIndex;
        [arr[curIndex], arr[randIndex]] = [arr[randIndex], arr[curIndex]];
    }
    return arr;
}

export function getRandomBigInt(max: bigint = MAX_BIG_INT) {
    const x = BigInt(Math.trunc(Math.random() * Number.MAX_SAFE_INTEGER));
    return max * x / MAX_SAFE_BIG_INT;
}

export function generateRandomLifePoints(n = 1024, clustering = true) {
    const res: LifePoint[] = [];
    for (let i = 0; i < n; ++i) {
        const xVal = getRandomBigInt();
        const yVal = getRandomBigInt();

        res.push([xVal, yVal]);
        if (clustering) {
            const clusterPoints = Math.random() * 10;
            for (let j = 0; j < clusterPoints; ++j) {
                let newX = xVal;
                let newY = yVal;
                if (Math.random() < 0.5) {
                    newY += getRandomCoord();
                } else {
                    newX += getRandomCoord();
                }
                res.push([newX, newY]);
                ++i;
            }
        }
    }
    return res;
}

function getRandomCoord(m = 5) {
    return 1n + BigInt(Math.trunc(Math.random() * (m - 1)));
}

export interface BenchErrorEvent extends Benchmark.Event {
    type: 'error';
    target: Benchmark.Target & {
        error: Error;
    };
}

export function getBenchJsError(event: BenchErrorEvent) {
    return event.target.error;
}

export function reportBenchJsError(event: Benchmark.Event) {
    const errSuite = event.currentTarget as Benchmark.Suite;
    const errBench = event.target;
    console.error(`Error in suite "${errSuite.name}", benchmark "${errBench.name}"`);
    console.error(getBenchJsError(event as BenchErrorEvent));
}

export type BenchCb = (this: Benchmark.Suite, suite?: Benchmark.Suite) => void;

export function bench(name: string, cb: BenchCb) {
    const suite = new Benchmark.Suite(name);
    cb.call(suite, suite);
    suite
        .on('start', function() {
            console.log(`START: ${name}`);
        })
        .on('error', reportBenchJsError)
        .on('cycle', function(event: Benchmark.Event) {
            console.log(String(event.target));
        })
        .on('complete', function(this: Benchmark.Suite) {
            console.log('Fastest is', this.filter('fastest').map('name'));
            console.log(`DONE: ${name}`);
        })
        .run();
}
