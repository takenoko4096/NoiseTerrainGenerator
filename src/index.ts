import { PerlinNoise } from "@/noise/PerlinNoise";
import { Xorshift32 } from "@/random/Xorshift32";
import { OctavedNoiseGenerationOptions } from "@/noise/OctavedNoiseGenerationOptions";

import { system, world } from "@minecraft/server";
import { MinecraftBlockTypes, MinecraftDimensionTypes } from "@minecraft/vanilla-data";
import { Chunk } from "@/terrain/Chunk";
import { Vector3Builder } from "./vector/Vector3Builder";

const perlinNoise = new PerlinNoise(new Xorshift32(7));

const options: OctavedNoiseGenerationOptions = {
    amplitude: 5,
    frequency: 0.03,
    octaves: 4,
    lacunarity: 2,
    persistence: 0.5
}

await system.waitTicks(1);

const overworld = world.getDimension(MinecraftDimensionTypes.Overworld);
const chunks = Chunk.inCircle(overworld, Chunk.at(overworld, { x: 0, z: 0 }), 2 * 16);

for (const chunk of chunks) {
    system.runJob(chunk.clearer({ min: -15, max: 15 }));

    system.runJob((function*(this: Chunk) {
        let x: number, z: number;
        const maxX = this.northWest.x + 15;
        const maxZ = this.northWest.z + 15;

        for (x = maxX; x >= this.northWest.x; x--) {
            for (z = maxZ; z >= this.northWest.z; z--) {
                //callbackFn({ x, z }, x === this.northWest.x && z === this.northWest.z);
                chunk.dimension.setBlockType(Vector3Builder.from({x,z}, perlinNoise.noise2Octaved({ x: x, y: z }, options)), MinecraftBlockTypes.GrassBlock);
                if (z % 4 === 0) yield;
            }
            yield;
        }
    }).call(chunk));
}
