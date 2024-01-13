import type {C, F, U} from 'ts-toolbelt';

export interface HollowObj {
    readonly __proto__: null;
}

export type ExtendableHollowObj<T> = NonNullable<HollowObj & Record<string, U.Nullable<T>>>;

export type ObjMap = HollowObj & Record<string, U.Nullable<string>>;

export type GeneralFn<T extends unknown[], U> = (...args: T) => U;

export type SimpleFn = GeneralFn<[], void>;

export type BigIntSrc = F.Parameters<BigIntConstructor>[0];

export type ErrorClass = C.Class<[message: string], Error>;

export interface Stringable {
    toString(...args: unknown[]): string;
}
