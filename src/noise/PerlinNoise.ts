import { RandomNumberGenerator } from "@/random/RandomNumberGenerator";
import { IntRange } from "@/range/IntRange";
import { Vector3Builder } from "@/vector/Vector3Builder";
import { CubeLattice } from "./CubeLattice";
import { CubeCorners } from "./CubeCorners";
import { NoiseGenerationOptions } from "./NoiseGenerationOptions";
import { OctavedNoiseGenerationOptions } from "./OctavedNoiseGenerationOptions";
import { VectorXZ } from "@/vector/VectorXZ";
import { Vector3 } from "@/vector/Vector3";

export class PerlinNoise {
    private readonly offset: Vector3;

    private readonly permutation: number[];

    public constructor(generator: RandomNumberGenerator) {
        this.offset = Vector3Builder.zero().operate(() => (generator.int(IntRange.minMax(0, 2 ** 31 - 1)) / (2 ** 31 - 1)) * 256);
        this.permutation = Array(256).fill(0).map(() => generator.int(IntRange.minMax(0, 255)));

        for (let i = 0; i < 256; i++) {
            let index: number = generator.int(IntRange.minMax(i, 255));
            let old: number = this.permutation[i]!;
            this.permutation[i] = this.permutation[index]!;
            this.permutation[index] = old;
            this.permutation[i + 256] = this.permutation[i]!;
        }
    }

    public noise3Simple(v: Vector3, options: NoiseGenerationOptions): number {
        // 入力の修正
        const vector = Vector3Builder.from(v)
            .scale(options.frequency)
            .add(this.offset);

        // 格子の最小座標を出す
        const chunkMinVector = vector.clone().operate(component => Math.floor(component));

        // 単位立方体格子の生成
        const lattice = new CubeLattice(chunkMinVector);

        // 単位立方体格子の各頂点の座標から入力ローカル座標へのベクトルを取得
        const offsets = lattice.getOffsetVectors(vector);
        // 単位立方体格子の各頂点に対応する勾配ベクトルを取得
        const gradients = lattice.getGradientVectors(this.permutation);

        // 最終的な影響値の算出
        const impactValues: CubeCorners<number> = {
            $000: offsets.$000.dot(gradients.$000),
            $001: offsets.$001.dot(gradients.$001),
            $010: offsets.$010.dot(gradients.$010),
            $011: offsets.$011.dot(gradients.$011),
            $100: offsets.$100.dot(gradients.$100),
            $101: offsets.$101.dot(gradients.$101),
            $110: offsets.$110.dot(gradients.$110),
            $111: offsets.$111.dot(gradients.$111)
        };

        // 補完係数を計算
        const fadedVector = Vector3Builder.from(vector).subtract(chunkMinVector).operate(PerlinNoise.fade);

        return options.amplitude * PerlinNoise.trilinear(fadedVector, impactValues);
    }

    public noise2Simple(v: VectorXZ, options: NoiseGenerationOptions): number {
        return this.noise3Simple({ x: v.x, y: 0, z: v.z }, options);
    }

    public noise1Simple(v: number, options: NoiseGenerationOptions): number {
        return this.noise2Simple({ x: v, z: 0 }, options);
    }

    public noise3Octaved(v: Vector3, options: OctavedNoiseGenerationOptions): number {
        let total = 0;
        let maxAmplitude = 0;

        let currentFrequency = options.frequency;
        let currentAmplitude = options.amplitude;

        for (let i = 0; i < options.octaves; i++) {
            total += this.noise3Simple(v, {
                frequency: currentFrequency,
                amplitude: currentAmplitude
            });

            maxAmplitude += currentAmplitude;

            currentAmplitude *= options.persistence;
            currentFrequency *= options.lacunarity;
        }

        // 正規化 -> *amplitude
        return options.amplitude * total / maxAmplitude;
    }

    public noise2Octaved(v: VectorXZ, options: OctavedNoiseGenerationOptions): number {
        return this.noise3Octaved({ x: v.x, y: 0, z: v.z }, options);
    }

    public noise1Octaved(v: number, options: OctavedNoiseGenerationOptions): number {
        return this.noise2Octaved({ x: v, z: 0 }, options);
    }

    private static fade(x: number): number {
        return (6 * x ** 5) - (15 * x ** 4) + (10 * x ** 3);
    }

    private static linear(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    private static trilinear(t: Vector3, area: CubeCorners<number>): number {
        // X
        const x00 = PerlinNoise.linear(t.x, area.$000, area.$100);
        const x10 = PerlinNoise.linear(t.x, area.$010, area.$110);
        const x01 = PerlinNoise.linear(t.x, area.$001, area.$101);
        const x11 = PerlinNoise.linear(t.x, area.$011, area.$111);

        // Y
        const y0 = PerlinNoise.linear(t.y, x00, x10);
        const y1 = PerlinNoise.linear(t.y, x01, x11);

        // Z
        return PerlinNoise.linear(t.z, y0, y1);
    }
}
