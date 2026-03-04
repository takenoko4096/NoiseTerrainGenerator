export interface IRange<T> {
    getMin(): T | undefined;

    getMax(): T | undefined;

    within(value: T): boolean;

    clamp(value: T): T;
}
