import { FiniteRange } from "@/range/FiniteRange";
import { IntRange } from "@/range/IntRange";

export interface RandomNumberGenerator {
    int(range: IntRange): number;

    decimal(range: FiniteRange): number;
}
