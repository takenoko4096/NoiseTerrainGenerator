import { BlockVolume, Dimension } from "@minecraft/server";
import { NumberRange } from "@minecraft/common";
import { Vector3Builder } from "@/vector/Vector3Builder";
import { NoiseGenerationOptions } from "@/noise/NoiseGenerationOptions";
import { VectorXZ } from "@/vector/VectorXZ";
import { MinecraftBlockTypes } from "@minecraft/vanilla-data";

export interface TerrainGenerationOptions extends NoiseGenerationOptions {
    seed: number;

    terrainHeightRange: NumberRange;

    referenceAltitude?: number;
}

export class Chunk {
    public readonly northWest: VectorXZ;

    public readonly dimension: Dimension;

    private constructor(dimension: Dimension, location: VectorXZ) {
        this.dimension = dimension;
        this.northWest = Vector3Builder.from({ x: location.x, y: 0, z: location.z })
            .operate(c => Math.floor(c / 16) * 16);
    }

    public *getBlockIterator(callbackFn: (location: VectorXZ, done: boolean) => void): Generator<void, void, void> {
        let x: number, z: number;
        const maxX = this.northWest.x + 15;
        const maxZ = this.northWest.z + 15;

        for (x = maxX; x >= this.northWest.x; x--) {
            for (z = maxZ; z >= this.northWest.z; z--) {
                let done: boolean = false;

                if (x === this.northWest.x && z === this.northWest.z) {
                    done = true;
                }

                callbackFn({ x, z }, done);

                if (z % 4 === 0) yield;
            }
            yield;
        }
    }

    public *getCleaner(heightRange: NumberRange): Generator<void, void, void> {
        let x: number;
        const maxX = this.northWest.x + 15;
        const rangeZ = { min: this.northWest.z, max: this.northWest.z + 15 };

        for (x = maxX; x >= this.northWest.x; x--) {
            this.dimension.fillBlocks(
                new BlockVolume({ x, y: heightRange.min, z: rangeZ.min }, { x, y: heightRange.max, z: rangeZ.max }),
                MinecraftBlockTypes.Air
            );

            if (x % 4 === 0) yield;
        }
    }

    public getCenterPos(): VectorXZ {
        return { x: this.northWest.x + 8, z: this.northWest.z + 8 };
    }

    public equals(other: Chunk): boolean {
        return this.northWest.x === other.northWest.x
            && this.northWest.z === other.northWest.z
            && this.dimension.id === other.dimension.id;
    }

    public isLoaded(): boolean {
        try {
            const block = this.dimension.getBlock({ x: this.northWest.x, y: 0, z: this.northWest.z });
            if (block === undefined) return false;
            else return block.isValid;
        }
        catch {
            return false;
        }
    }

    public north(): Chunk {
        return Chunk.getChunkAt(this.dimension, { x: this.northWest.x, z: this.northWest.z - 1 });
    }

    public south(): Chunk {
        return Chunk.getChunkAt(this.dimension, { x: this.northWest.x, z: this.northWest.z + 16 });
    }

    public east(): Chunk {
        return Chunk.getChunkAt(this.dimension, { x: this.northWest.x + 16, z: this.northWest.z });
    }

    public west(): Chunk {
        return Chunk.getChunkAt(this.dimension, { x: this.northWest.x - 1, z: this.northWest.z });
    }

    public static getChunkAt(dimension: Dimension, location: VectorXZ): Chunk {
        return new Chunk(dimension, location);
    }

    public static getChunksInCircle(dimension: Dimension, center: VectorXZ, radius: number): Set<Chunk> {
        const centerChunk = Chunk.getChunkAt(dimension, center);
        const centerPosOfCenterChunk = centerChunk.getCenterPos();

        const chunks: Chunk[] = [];

        const maxX = centerPosOfCenterChunk.x + radius;
        const minX = centerPosOfCenterChunk.x - radius;

        const maxZ = centerPosOfCenterChunk.z + radius;
        const minZ = centerPosOfCenterChunk.z - radius;

        let x: number, z: number;

        for (x = maxX; x >= minX; x -= 16) {
            for (z = maxZ; z >= minZ; z -= 16) {
                chunks.push(Chunk.getChunkAt(dimension, { x, z }));
            }
        }

        return new Set(chunks.filter(chunk => {
            return Vector3Builder.from(chunk.getCenterPos(), 0).getDistanceTo(Vector3Builder.from(centerPosOfCenterChunk, 0)) <= radius
                && chunk.isLoaded()
        }));
    }
}
