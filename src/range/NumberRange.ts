import { IRange } from "./IRange";

export class NumberRange implements IRange<number> {
    protected readonly min: number;

    protected readonly max: number;

    protected constructor(value1: number, value2: number) {
        if (Number.isNaN(value1) || Number.isNaN(value2)) {
            throw new TypeError("NaNは範囲の端の値として使用できません");
        }

        this.min = Math.min(value1, value2);
        this.max = Math.max(value1, value2);
    }

    public getMin(): number | undefined {
        return Number.isFinite(this.min) ? this.min : undefined;
    }

    public getMax(): number | undefined {
        return Number.isFinite(this.max) ? this.max : undefined;
    }

    public within(value: number): boolean {
        return this.min <= value && value <= this.max;
    }

    public clamp(value: number): number {
        return Math.max(this.min, Math.min(this.max, value));
    }

    public static minOnly(min: number): NumberRange {
        return new NumberRange(min, Infinity);
    }

    public static maxOnly(max: number): NumberRange {
        return new NumberRange(-Infinity, max);
    }

    public static exactValue(value: number): NumberRange {
        return new NumberRange(value, value);
    }

    public static minMax(value1: number, value2: number): NumberRange {
        return new NumberRange(value1, value2);
    }

    public static parse(input: string, allowSign: boolean, intOnly: boolean): NumberRange {
        const numberPattern = intOnly ? "\\d+" : "(?:\\d+\.?\\d*|\\.\\d+)";
        const pattern: string = (allowSign) ? "[+-]?" + numberPattern : numberPattern;

        if (new RegExp("^" + pattern + "$").test(input)) {
            return this.exactValue(Number.parseFloat(input));
        }
        else if (new RegExp("^" + pattern + "\\.\\.$").test(input)) {
            return this.minOnly(Number.parseFloat(input.slice(0, input.length - 2)));
        }
        else if (new RegExp("^\\.\\." + pattern + "$").test(input)) {
            return this.maxOnly(Number.parseFloat(input.slice(2)));
        }
        else if (new RegExp("^" + pattern + "\\.\\." + pattern + "$").test(input)) {
            const [min, max] = input.split(/\.\./g).map(s => Number.parseFloat(s)) as [number, number];
            return this.minMax(min, max);
        }
        else throw new TypeError("無効な文字列です");
    }
}
