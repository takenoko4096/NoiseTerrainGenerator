import { BigIntRange } from "./BigIntRange";
import { FiniteRange } from "./FiniteRange";

export class IntRange extends FiniteRange {
    protected constructor(range: FiniteRange) {
        if (!(Number.isSafeInteger(range.getMin()) && Number.isSafeInteger(range.getMax()))) {
            throw new TypeError("コンストラクタに渡された値が有効な範囲の整数ではありません");
        }

        super(range);
    }

    public override within(value: number): boolean {
        if (!Number.isSafeInteger(value)) {
            throw new TypeError("関数に渡された値が有効な範囲の整数ではありません");
        }

        return super.within(value);
    }

    public override clamp(value: number): number {
        if (value > this.max) {
            return this.max;
        }
        else if (value < this.min) {
            return this.min;
        }
        else return Math.round(value);
    }

    public toBigInt(): BigIntRange {
        return BigIntRange.minMax(BigInt(this.getMin()), BigInt(this.getMax()));
    }

    public ints(): Set<number> {
        return new Set(Array(this.max - this.min).fill(undefined).map((_, i) => i + this.min));
    }

    public static override minOnly(min: number): IntRange {
        return new IntRange(super.minMax(min, Number.MAX_SAFE_INTEGER));
    }

    public static override maxOnly(max: number): IntRange {
        return new IntRange(super.minMax(Number.MIN_SAFE_INTEGER, max));
    }

    public static override minMax(value1: number, value2: number): IntRange {
        return new IntRange(super.minMax(value1, value2));
    }

    public static override exactValue(value: number): IntRange {
        return new IntRange(super.exactValue(value));
    }

    public static override parse(input: string, allowSign: boolean): IntRange {
        return new IntRange(super.parse(input, allowSign, true));
    }

    public static readonly UINT32_MAX_RANGE: IntRange = IntRange.minMax(0, 2 ** 32 - 1);

    public static readonly INT32_MAX_RANGE: IntRange = IntRange.minMax(-(2 ** 31), 2 ** 31 - 1);
}
