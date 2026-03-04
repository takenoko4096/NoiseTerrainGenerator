import { NumberRange } from "./NumberRange";

export class FiniteRange extends NumberRange {
    protected constructor(range: NumberRange)  {
        const min = range.getMin();
        const max = range.getMax();

        if (min === undefined || max === undefined) {
            throw new TypeError("Finiteな値ではありません");
        }

        super(min, max);
    }

    public override getMin(): number {
        return super.getMin()!;
    }

    public override getMax(): number {
        return super.getMax()!;
    }

    public static override minOnly(min: number): FiniteRange {
        return new FiniteRange(new NumberRange(min, Number.MAX_VALUE));
    }

    public static override maxOnly(max: number): FiniteRange {
        return new FiniteRange(new NumberRange(Number.MIN_VALUE, max));
    }

    public static override minMax(value1: number, value2: number): FiniteRange {
        return new FiniteRange(super.minMax(value1, value2));
    }

    public static override exactValue(value: number): FiniteRange {
        return new FiniteRange(super.exactValue(value));
    }

    public static override parse(input: string, allowSign: boolean, intOnly: boolean): FiniteRange {
        return new FiniteRange(super.parse(input, allowSign, intOnly));
    }
}
