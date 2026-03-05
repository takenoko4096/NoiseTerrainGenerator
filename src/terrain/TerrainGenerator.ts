import { PerlinNoise } from "@/noise/PerlinNoise";
import { Chunk } from "./Chunk";
import { TerrainGenerationOptions } from "./TerrainGenerationOptions";
import { Xorshift32 } from "@/random/Xorshift32";
import { MinecraftBlockTypes } from "@minecraft/vanilla-data";
import { BlockVolume, system } from "@minecraft/server";

export class TerrainGenerator {
    private readonly chunks: Set<Chunk>;

    private readonly options: TerrainGenerationOptions;

    private readonly noise: PerlinNoise;

    private isGenerating = false;

    public constructor(chunks: Set<Chunk>, options: TerrainGenerationOptions) {
        this.chunks = chunks;
        this.options = options;
        this.noise = new PerlinNoise(new Xorshift32(options.seed));
    }

    private *generator(resolve: () => void): Generator<void, void, void> {
        for (const chunk of this.chunks) {
            let x: number, z: number;
            const maxX = chunk.northWest.x + 15;
            const maxZ = chunk.northWest.z + 15;

            for (x = maxX; x >= chunk.northWest.x; x--) {
                for (z = maxZ; z >= chunk.northWest.z; z--) {
                    const y = this.noise.noise2Simple({ x, z }, this.options) + this.options.baseAltitude;
                    chunk.dimension.fillBlocks(
                        new BlockVolume({ x, y: this.options.height.min + this.options.baseAltitude, z }, { x, y: this.options.height.max + this.options.baseAltitude, z }),
                        MinecraftBlockTypes.Air
                    );
                    chunk.dimension.setBlockType({ x, y, z }, MinecraftBlockTypes.Stone);
                }
                yield;
            }
        }
        resolve();
    }

    public async generate(): Promise<void> {
        if (this.isGenerating) throw new Error("Processing");

        this.isGenerating = true;
        await new Promise<void>(resolve => system.runJob(this.generator(resolve)));
        this.isGenerating = false;
    }
}
