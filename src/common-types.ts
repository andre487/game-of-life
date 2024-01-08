export type SimpleCallback = () => void;

export type ArgType<T> = T extends (x: infer FirstArgType, ...args: unknown[]) => unknown ? FirstArgType : never;

export type BigIntSrc = ArgType<BigIntConstructor>;

export interface ErrorClass {
    new (message?: string): Error;
    readonly prototype: Error;
}
