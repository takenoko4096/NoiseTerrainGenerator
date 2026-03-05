import { IntRange } from "@/range/IntRange";
import { RandomNumberGenerator } from "./RandomNumberGenerator";
import { FiniteRange } from "@/range/FiniteRange";
import { DualAxisRotationBuilder } from "@/vector/DualAxisRotationBuilder";
import { TripleAxisRotationBuilder } from "@/vector/TripleAxisRotationBuilder";
import { typeSentry } from "@typesentry";

export class RandomService {
    public constructor(private readonly randomNumberGenerator: RandomNumberGenerator) {}

    public uuid(): string {
        const chars = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.split('');

        for (let i = 0; i < chars.length; i++) {
            switch (chars[i]) {
                case 'x':
                    chars[i] = this.randomNumberGenerator.int(IntRange.minMax(0, 15)).toString(16);
                    break;
                case 'y':
                    chars[i] = this.randomNumberGenerator.int(IntRange.minMax(8, 11)).toString(16);
                    break;
            }
        }

        return chars.join('');
    }

    public chance(chance: number): boolean {
        return this.randomNumberGenerator.decimal(FiniteRange.minMax(0, 1)) < chance;
    }

    public sign(): 1 | -1 {
        return this.chance(0.5) ? 1 : -1;
    }

    public choice<const T>(list: T[]): T;

    public choice<const T>(set: Set<T>): T;

    public choice<const T>(iterable: T[] | Set<T>): T {
        if (Array.isArray(iterable)) {
            return iterable[this.randomNumberGenerator.int(IntRange.minMax(0, iterable.length - 1))]!;
        }
        else {
            return this.choice([...iterable]);
        }
    }

    public sample<T>(set: Set<T>, count: number): Set<T> {
        if (count < 0 || count > set.size) {
            throw new TypeError("countの値は0以上要素数以下である必要があります");
        }

        return new Set(
            this.shuffledClone([...set])
                .slice(0, count)
        );
    }

    public boxMuller(): number {
        let a: number, b: number;

        do {
            a = this.randomNumberGenerator.decimal(FiniteRange.minMax(0, 1));
        }
        while (a === 0);

        do {
            b = this.randomNumberGenerator.decimal(FiniteRange.minMax(0, 1));
        }
        while (b === 1);

        return Math.sqrt(-2 * Math.log(a)) * Math.sin(2 * Math.PI * b);
    }

    public rotation2(): DualAxisRotationBuilder {
        return new DualAxisRotationBuilder(
            this.randomNumberGenerator.decimal(FiniteRange.minMax(-180, 180)),
            this.randomNumberGenerator.decimal(FiniteRange.minMax(-90, 90))
        );
    }

    public rotation3(): TripleAxisRotationBuilder {
        return new TripleAxisRotationBuilder(
            this.randomNumberGenerator.decimal(FiniteRange.minMax(-180, 180)),
            this.randomNumberGenerator.decimal(FiniteRange.minMax(-90, 90)),
            this.randomNumberGenerator.decimal(FiniteRange.minMax(-180, 180))
        );
    }

    public weightedChoice<T extends string>(map: Record<T, number>): T {
        let sum: number = 0;
        for (const uncasted of Object.values(map)) {
            const val = uncasted as number;

            if (!(Number.isSafeInteger(val) && val > 0)) {
                throw new TypeError("重みとなる値は安全な範囲の正の整数である必要があります");
            }

            sum += val;
        }

        const random = this.randomNumberGenerator.int(IntRange.minMax(1, sum));

        let totalWeight = 0;
        for (const [key, weight] of Object.entries(map)) {
            totalWeight += weight as number;
            if (totalWeight >= random) return key as T;
        }

        throw new TypeError("NEVER HAPPENS");
    }

    public shuffledClone<T>(list: T[]): T[] {
        const clone = [...list];

        if (list.length <= 1) return clone;

        for (let i = clone.length - 1; i >= 0; i--) {
            const current = clone[i]!;
            const random = this.randomNumberGenerator.int(IntRange.minMax(0, i));

            clone[i] = clone[random]!;
            clone[random] = current;
        }

        return clone;
    }

    public static uInt32(): number {
        return Math.floor(Math.random() * (2 ** 32));
    }

    public static uBigInt64(): bigint {
        const high: number = Math.floor(Math.random() * (2 ** 32));
        const low: number = Math.floor(Math.random() * (2 ** 32));

        return (BigInt(high) << 32n) | BigInt(low);
    }

    public static hash(...integers: number[]): number {
        let hash = 17;

        for (const integer of integers) {
            hash = hash * 31 + typeSentry.number.nonNaN().int().cast(integer)
        }

        return hash;
    }
}
