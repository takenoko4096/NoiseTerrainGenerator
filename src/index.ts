import { PerlinNoise } from "@/noise/PerlinNoise";
import { Xorshift32 } from "@/random/Xorshift32";

import { system, world } from "@minecraft/server";
import { NoiseGenerationOptions } from "@/noise/NoiseGenerationOptions";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";

const noise = new PerlinNoise(new Xorshift32(7));

const options: NoiseGenerationOptions = {
    amplitude: 10,
    frequency: 9
}

const M = 100;

system.runInterval(() => {
    for (let i = 0; i < M; i++) {
        const x = (20 * i / M);
        const y = noise.noise1(i / M, options);
        world.getDimension(MinecraftDimensionTypes.Overworld).spawnParticle("minecraft:basic_flame_particle", { x, y, z: 0 });
    }
}, 10);
