import { Vector3Builder } from "@/vector/Vector3Builder";
import { CubeCorners } from "./CubeCorners";
import { Vector3 } from "@/vector/Vector3";

export class CubeLattice {
    private static readonly GRADIENT_VECTORS: Vector3[] = [
        { x: 1, y: 1, z: 0 },
        { x: -1, y: 1, z: 0 },
        { x: 1, y: -1, z: 0 },
        { x: -1, y: -1, z: 0 },
        { x: 1, y: 0, z: 1 },
        { x: -1, y: 0, z: 1 },
        { x: 1, y: 0, z: -1 },
        { x: -1, y: 0, z: -1 },
        { x: 0, y: 1, z: 1 },
        { x: 0, y: -1, z: 1 },
        { x: 0, y: 1, z: -1 },
        { x: 0, y: -1, z: -1 },
        { x: 1, y: 1, z: 0 },
        { x: -1, y: 1, z: 0 },
        { x: 0, y: -1, z: 1 },
        { x: 0, y: -1, z: -1 }
    ];

    private readonly min: Vector3;

    public constructor(min: Vector3) {
        this.min = min;
    }

    private getIndices(): Vector3 {
        return Vector3Builder.from(this.min).operate(component => component & 255);
    }

    private hash(p: number[], x: number, y: number, z: number): number {
        return p[p[p[x]! + y]! + z]!;
    }

    /**
     * 各頂点のハッシュ値を求める関数
     */
    private getCubeHashes(permutation :number[]): CubeCorners<number> {
        const { x, y, z } = this.getIndices();
        return {
            $000: this.hash(permutation, x,     y,     z    ),
            $100: this.hash(permutation, x + 1, y,     z    ),
            $010: this.hash(permutation, x,     y + 1, z    ),
            $110: this.hash(permutation, x + 1, y + 1, z    ),
            $001: this.hash(permutation, x,     y,     z + 1),
            $101: this.hash(permutation, x + 1, y,     z + 1),
            $011: this.hash(permutation, x,     y + 1, z + 1),
            $111: this.hash(permutation, x + 1, y + 1, z + 1)
        };
    }

    /**
     * ハッシュ値から勾配ベクトルを求める関数
     */
    private getGradientVectorByHash(hash: number): Vector3 {
        return CubeLattice.GRADIENT_VECTORS[hash & 15]!;
    }

    public getGradientVectors(permutation: number[]): CubeCorners<Vector3> {
        const hashes = this.getCubeHashes(permutation);

        return {
            $000: this.getGradientVectorByHash(hashes.$000),
            $001: this.getGradientVectorByHash(hashes.$001),
            $010: this.getGradientVectorByHash(hashes.$010),
            $011: this.getGradientVectorByHash(hashes.$011),
            $100: this.getGradientVectorByHash(hashes.$100),
            $101: this.getGradientVectorByHash(hashes.$101),
            $110: this.getGradientVectorByHash(hashes.$110),
            $111: this.getGradientVectorByHash(hashes.$111)
        };
    }

    public getOffsetVectors(point: Vector3): CubeCorners<Vector3Builder> {
        const builder = Vector3Builder.from(point).subtract(this.min);
        return {
            $000: builder.clone().subtract({ x: 0, y: 0, z: 0 }),
            $100: builder.clone().subtract({ x: 1, y: 0, z: 0 }),
            $010: builder.clone().subtract({ x: 0, y: 1, z: 0 }),
            $110: builder.clone().subtract({ x: 1, y: 1, z: 0 }),
            $001: builder.clone().subtract({ x: 0, y: 0, z: 1 }),
            $101: builder.clone().subtract({ x: 1, y: 0, z: 1 }),
            $011: builder.clone().subtract({ x: 0, y: 1, z: 1 }),
            $111: builder.clone().subtract({ x: 1, y: 1, z: 1 }),
        };
    }
}
