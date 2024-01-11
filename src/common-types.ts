import type {C, F} from 'ts-toolbelt';

export type GeneralFn<T extends unknown[], U> = (...args: T) => U;

export type SimpleFn = GeneralFn<[], void>;

export type UnknownFn = GeneralFn<unknown[], unknown>;

export type BigIntSrc = F.Parameters<BigIntConstructor>[0];

export type ErrorClass = C.Class<[message: string], Error>;

export interface Stringable {
    toString(...args: unknown[]): string;
}
