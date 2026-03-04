import { IVectorBuilder } from "./IVectorBuilder";
import { typeSentry } from "@typesentry";
import { Vector3Builder } from "./Vector3Builder";
import { Vector2 } from "./Vector2";

export class DualAxisRotationBuilder implements Vector2, IVectorBuilder<DualAxisRotationBuilder> {
    private __yaw__: number;
    private __pitch__: number;

    public constructor(yaw: number, pitch: number) {
        const nonNaNNumber = typeSentry.number.nonNaN();

        if (!(nonNaNNumber.test(yaw) && nonNaNNumber.test(pitch))) {
            throw new TypeError("回転の成分はNaNでない数値である必要があります");
        }

        this.__yaw__ = yaw;
        this.__pitch__ = pitch;
    }

    public get x(): number {
        return this.pitch;
    }

    public set x(value) {
        this.pitch = value;
    } 

    public get y(): number {
        return this.yaw;
    }

    public set y(value) {
        this.yaw = value;
    }

    public get yaw(): number {
        return this.__yaw__;
    }

    public set yaw(value: number) {
        if (!typeSentry.number.nonNaN().test(value)) {
            throw new TypeError("回転の成分はNaNでない数値である必要があります");
        }

        this.__yaw__ = value;
    }

    public get pitch(): number {
        return this.__pitch__;
    }

    public set pitch(value: number) {
        if (!typeSentry.number.nonNaN().test(value)) {
            throw new TypeError("回転の成分はNaNでない数値である必要があります");
        }

        this.__pitch__ = value;
    }

    public equals(other: unknown): boolean {
        if (DualAxisRotationBuilder.isVector2(other)) {
            return this.x === other.x
                && this.y === other.y;
        }
        else return false;
    }

    public operate(callbackFn: (comopnent: number) => number): DualAxisRotationBuilder;

    public operate(other: Vector2, callbackFn: (comopnent1: number, comopnent2: number) => number): DualAxisRotationBuilder;

    public operate(other1: Vector2, other2: Vector2, callbackFn: (component1: number, component2: number, component3: number) => number): DualAxisRotationBuilder;

    public operate(a: Vector2 | ((comopnent: number) => number), b?: Vector2 | ((comopnent1: number, comopnent2: number) => number), c?: (component1: number, component2: number, component3: number) => number): DualAxisRotationBuilder {
        if (typeof a === "function" && b === undefined && c === undefined) {
            this.y = a(this.y);
            this.x = a(this.x);
        }
        else if (DualAxisRotationBuilder.isVector2(a) && typeof b === "function" && c === undefined) {
            this.y = b(this.y, a.y);
            this.x = b(this.x, a.x);
        }
        else if (DualAxisRotationBuilder.isVector2(a) && DualAxisRotationBuilder.isVector2(b) && typeof c === "function") {
            this.y = c(this.y, a.y, b.y);
            this.y = c(this.y, a.y, b.y);
        }
        else {
            throw new TypeError("NEVER HAPPENS");
        }
        return this;
    }

    public add(other: Vector2): DualAxisRotationBuilder {
        return this.operate(other, (a, b) => a + b);
    }

    public subtract(other: Vector2): DualAxisRotationBuilder {
        return this.add(DualAxisRotationBuilder.from(other).clone().invert());
    }

    public scale(scalar: number): DualAxisRotationBuilder {
        return this.operate(component => component * scalar);
    }

    public divide(scalar: number): DualAxisRotationBuilder {
        if (!typeSentry.number.nonNaN().test(scalar)) {
            throw new TypeError("割る数はNaNでない数値である必要があります");
        }

        if (scalar === 0) {
            throw new TypeError("0は割る数として無効です");
        }

        return this.operate(component => component / scalar);
    }

    public invert(): DualAxisRotationBuilder {
        this.__yaw__ += 180;
        this.__pitch__ *= -1;
        return this;
    }

    public clamp(min: Vector2, max: Vector2): DualAxisRotationBuilder {
        return this.operate(min, max, (val, min, max) => {
            return Math.max(min, Math.min(val, max));
        });
    }

    public clone(): DualAxisRotationBuilder {
        return new DualAxisRotationBuilder(this.__yaw__, this.__pitch__);
    }

    public format(format: string, digits: number): string {
        if (!typeSentry.number.nonNaN().int().test(digits)) {
            throw new TypeError("桁数はNaNでない整数値である必要があります");
        }
        else if (digits < 0 || digits > 20) {
            throw new RangeError("digitsに使用可能な値は0以上20以下です");
        }

        const cx = this.__yaw__.toFixed(digits);
        const cy = this.__pitch__.toFixed(digits);

        return format
            .replace(/\$yaw/g, cx)
            .replace(/\$pitch/g, cy)
            .replace("$c", cx)
            .replace("$c", cy)
            .replace(/\$c/g, "");
    }

    public toString(): string {
        return this.format("($yaw, $pitch)", 1);
    }

    public getDirection3d(): Vector3Builder {
        return new Vector3Builder(
            -Math.sin(this.__yaw__ * Math.PI / 180) * Math.cos(this.__pitch__ * Math.PI / 180),
            -Math.sin(this.__pitch__ * Math.PI / 180),
            Math.cos(this.__yaw__ * Math.PI / 180) * Math.cos(this.__pitch__ * Math.PI / 180)
        );
    }

    public isZero(): boolean {
        return this.equals(DualAxisRotationBuilder.zero());
    }

    public static isVector2(value: unknown): value is Vector2 {
        return typeSentry.structOf({
            x: typeSentry.number.nonNaN(),
            y: typeSentry.number.nonNaN()
        }).test(value);
    }

    public static zero(): DualAxisRotationBuilder {
        return new this(0, 0);
    }

    public static filled(value: number): DualAxisRotationBuilder {
        return new this(value, value);
    }

    public static from(vector2: Vector2): DualAxisRotationBuilder {
        return new this(vector2.y, vector2.x);
    }
}
