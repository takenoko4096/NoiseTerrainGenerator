import { CommandPermissionLevel, CustomCommandStatus, system, world } from "@minecraft/server";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";
import { Chunk } from "@/terrain/Chunk";
import { TerrainGenerator } from "@/terrain/TerrainGenerator";
import { RandomService } from "@/random/RandomService";

let generator: TerrainGenerator;

system.beforeEvents.startup.subscribe(event => {
    event.customCommandRegistry.registerCommand(
        {
            name: "ntg:gentest",
            description: "terrain generation test",
            permissionLevel: CommandPermissionLevel.GameDirectors
        },
        () => {
            (async () => {
                const s = Date.now();
                await generator.generate();
                console.log((Date.now() - s) / 1000);
            })();

            return { status: CustomCommandStatus.Success };
        }
    );
});

await system.waitTicks(1);

const overworld = world.getDimension(MinecraftDimensionTypes.Overworld);

generator = new TerrainGenerator(Chunk.at(overworld, { x: 0, z: 0 }).around(2), {
    baseAltitude: 0,
    amplitude: 7,
    frequency: 0.05,
    height: { min: -15, max: 15 },
    seed: RandomService.uInt32()
});
