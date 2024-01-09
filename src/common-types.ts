import type {C, F} from 'ts-toolbelt';

export type GeneralCallback<T extends unknown[], U> = (...args: T) => U;

export type SimpleCallback = GeneralCallback<[], void>;

export type BigIntSrc = F.Parameters<BigIntConstructor>[0];

export type ErrorClass = C.Class<[message: string], Error>;

export interface Stringable {
    toString(...args: unknown[]): string;
}
