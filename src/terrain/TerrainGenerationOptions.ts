import { NoiseGenerationOptions } from "@/noise/NoiseGenerationOptions";
import { NumberRange } from "@minecraft/common";

export interface TerrainGenerationOptions extends NoiseGenerationOptions {
    seed: number;

    height: NumberRange;

    baseAltitude: number;
}
