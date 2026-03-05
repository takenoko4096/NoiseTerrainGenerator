import { BlockVolume, Dimension } from "@minecraft/server";
import { NumberRange } from "@minecraft/common";
import { Vector3Builder } from "@/vector/Vector3Builder";
import { VectorXZ } from "@/vector/VectorXZ";
import { MinecraftBlockTypes } from "@minecraft/vanilla-data";

export class Chunk {
    public readonly dimension: Dimension;

    public readonly northWest: VectorXZ;

    public readonly center: VectorXZ;

    private constructor(dimension: Dimension, location: VectorXZ) {
        this.dimension = dimension;
        this.northWest = Vector3Builder.from(location).operate(component => Math.floor(component / 16) * 16);
        this.center = { x: this.northWest.x + 8, z: this.northWest.z + 8 };
    }

    public relativePosition(): VectorXZ {
        return Vector3Builder.from(this.northWest).operate(component => Math.floor(component / 16));
    }

    public *getBlockIterator(callbackFn: (location: VectorXZ, done: boolean) => void): Generator<void, void, void> {
        let x: number, z: number;
        const maxX = this.northWest.x + 15;
        const maxZ = this.northWest.z + 15;

        for (x = maxX; x >= this.northWest.x; x--) {
            for (z = maxZ; z >= this.northWest.z; z--) {
                callbackFn({ x, z }, x === this.northWest.x && z === this.northWest.z);
                if (z % 4 === 0) yield;
            }
            yield;
        }
    }

    public *clearer(height: NumberRange): Generator<void, void, void> {
        let x: number;
        const maxX = this.northWest.x + 15;
        const rangeZ: NumberRange = { min: this.northWest.z, max: this.northWest.z + 15 };

        for (x = maxX; x >= this.northWest.x; x--) {
            this.dimension.fillBlocks(
                new BlockVolume({ x, y: height.min, z: rangeZ.min }, { x, y: height.max, z: rangeZ.max }),
                MinecraftBlockTypes.Air
            );

            if (x % 4 === 0) yield;
        }
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
        return Chunk.at(this.dimension, { x: this.northWest.x, z: this.northWest.z - 1 });
    }

    public south(): Chunk {
        return Chunk.at(this.dimension, { x: this.northWest.x, z: this.northWest.z + 16 });
    }

    public east(): Chunk {
        return Chunk.at(this.dimension, { x: this.northWest.x + 16, z: this.northWest.z });
    }

    public west(): Chunk {
        return Chunk.at(this.dimension, { x: this.northWest.x - 1, z: this.northWest.z });
    }

    public toString(): string {
        const rel = this.relativePosition();
        return `Chunk(${this.dimension.id})[${rel.x}, ${rel.z}]`;
    }

    public static at(dimension: Dimension, location: VectorXZ): Chunk {
        return new Chunk(dimension, location);
    }

    public static inCircle(dimension: Dimension, center: Chunk, radius: number): Set<Chunk> {
        const centerPosOfCenterChunk = center.center;

        const chunks = new Set<Chunk>();

        const maxX = centerPosOfCenterChunk.x + radius;
        const minX = centerPosOfCenterChunk.x - radius;

        const maxZ = centerPosOfCenterChunk.z + radius;
        const minZ = centerPosOfCenterChunk.z - radius;

        let x: number, z: number;

        for (x = maxX; x >= minX; x -= 16) {
            for (z = maxZ; z >= minZ; z -= 16) {
                const chunk = Chunk.at(dimension, { x, z });

                if (Vector3Builder.from(chunk.center).getDistanceTo(Vector3Builder.from(centerPosOfCenterChunk)) <= radius) {
                    chunks.add(chunk);
                }
            }
        }

        return chunks;
    }
}
