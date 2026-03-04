import { NoiseGenerationOptions } from "./NoiseGenerationOptions";

export interface OctavedNoiseGenerationOptions extends NoiseGenerationOptions {
    octaves: number;

    persistence: number;

    lacunarity: number;
}
