export type SimpleCallback = () => void;

export type BigIntSrc = bigint | number | boolean | string;

export interface ErrorClass {
    new (message?: string): Error;
    readonly prototype: Error;
}
