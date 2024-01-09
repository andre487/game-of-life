import type {C, F} from 'ts-toolbelt';

export type SimpleCallback = () => void;

export type GeneralCallback<T extends unknown[], U> = (...args: T) => U;

export type BigIntSrc = F.Parameters<BigIntConstructor>[0];

export type ErrorClass = C.Class<[message: string], Error>;

export interface CanString {
    toString(...args: unknown[]): string;
}
