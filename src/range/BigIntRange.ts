import { IntRange } from "./IntRange";
import { IRange } from "./IRange";

export class BigIntRange implements IRange<bigint> {
    protected readonly min: bigint;

    protected readonly max: bigint;

    protected constructor(value1: bigint, value2: bigint) {
        if (value1 < value2) {
            this.min = value1;
            this.max = value2;
        }
        else if (value1 > value2) {
            this.min = value2;
            this.max = value1;
        }
        else {
            this.min = value1;
            this.max = this.min;
        }
    }

    public getMin(): bigint {
        return this.min;
    }

    public getMax(): bigint {
        return this.max;
    }

    public within(value: bigint): boolean {
        return this.min <= value && value <= this.max;
    }

    public clamp(value: bigint): bigint {
        if (value < this.min) {
            return this.min;
        }
        else if (value > this.max) {
            return this.max;
        }
        else {
            return value;
        }
    }

    public toPrecisionLost(): IntRange {
        return IntRange.minMax(Number(this.getMin()), Number(this.getMax()));
    }

    public ints(): Set<bigint> {
        return new Set(Array(Number(this.max) - Number(this.min)).fill(undefined).map((_, i) => BigInt(i) + this.min));
    }

    public static exactValue(value: bigint): BigIntRange {
        return new BigIntRange(value, value);
    }

    public static minMax(value1: bigint, value2: bigint): BigIntRange {
        return new BigIntRange(value1, value2);
    }

    public static parse(input: string, allowSign: boolean): BigIntRange {
        const numberPattern = "\\d+";
        const pattern: string = (allowSign) ? "[+-]?" + numberPattern : numberPattern;

        if (new RegExp("^" + pattern + "$").test(input)) {
            return this.exactValue(BigInt(input));
        }
        else if (new RegExp("^" + pattern + "\\.\\." + pattern + "$").test(input)) {
            const [min, max] = input.split(/\.\./g).map(s => BigInt(s)) as [bigint, bigint];
            return this.minMax(min, max);
        }
        else throw new TypeError("無効な文字列です");
    }

    public static readonly UINT64_MAX_RANGE: BigIntRange = BigIntRange.minMax(0n, 2n ** 64n -1n);

    public static readonly INT64_MAX_RANGE: BigIntRange = BigIntRange.minMax(-(2n ** 63n), 2n ** 63n -1n);
}