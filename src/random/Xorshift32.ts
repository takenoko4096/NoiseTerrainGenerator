import { IntRange } from "@/range/IntRange";
import { RandomNumberGenerator } from "./RandomNumberGenerator";
import { FiniteRange } from "@/range/FiniteRange";

export class Xorshift32 implements RandomNumberGenerator {
    private x: number = 123456789;
    private y: number = 362436069;
    private z: number = 521288629;
    private w: number;

    public constructor(seed: number) {
        if (!Number.isInteger(seed)) {
            throw new TypeError("シード値は整数である必要があります");
        }

        this.w = seed;
    }

    public next(): number {
        let t = this.x ^ (this.x << 11);

        this.x = this.y;
        this.y = this.z;
        this.z = this.w;
        this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8));

        return this.w - IntRange.INT32_MAX_RANGE.getMin();
    }

    public int(range: IntRange): number {
        const min = range.getMin();
        const max = range.getMax();
        return this.next() % (max - min + 1) + min;
    }

    public decimal(range: FiniteRange): number {
        const min = range.getMin();
        const max = range.getMax();
        return (this.next() / IntRange.UINT32_MAX_RANGE.getMax()) * (max - min) + min;
    }
}
