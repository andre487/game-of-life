import {C, F} from 'ts-toolbelt';

export type SimpleCallback = () => void;

export type BigIntSrc = F.Parameters<BigIntConstructor>[0];

export type ErrorClass = C.Class<[message: string], Error>;
