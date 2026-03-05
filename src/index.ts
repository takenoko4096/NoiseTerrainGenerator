import { PerlinNoise } from "@/noise/PerlinNoise";
import { Xorshift32 } from "@/random/Xorshift32";

import { system, world } from "@minecraft/server";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";
import { Chunk } from "@/terrain/Chunk";
import { RandomService } from "./random/RandomService";

await system.waitTicks(1);

const overworld = world.getDimension(MinecraftDimensionTypes.Overworld);
const chunks = Chunk.at(overworld, { x: 0, z: 0 }).around(2);

const perlinNoise = new PerlinNoise(new Xorshift32(RandomService.uInt32()));

const s = Date.now();

for (const chunk of chunks) {
    system.runJob(chunk.getTerrainGenerator(perlinNoise));
}

console.log((Date.now() - s) / 1000);
