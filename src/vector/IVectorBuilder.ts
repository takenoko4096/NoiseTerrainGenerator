export interface IVectorBuilder<T extends IVectorBuilder<T>> {
    equals(other: unknown): boolean;

    operate(callbackFn: (comopnent: number) => number): T;

    operate(other: T, callbackFn: (comopnent1: number, comopnent2: number) => number): T;

    operate(other1: T, other2: T, callbackFn: (comopnent1: number, comopnent2: number, component3: number) => number): T;

    add(other: T): T;

    subtract(other: T): T;

    scale(scalar: number): T;

    divide(scalar: number): T;

    clamp(min: T, max: T): T;

    format(format: string, digits: number): string;

    toString(): string;

    clone(): T;

    isZero(): boolean;
}
