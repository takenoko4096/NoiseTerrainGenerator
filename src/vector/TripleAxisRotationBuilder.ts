import { typeSentry } from "@typesentry";
import { IVectorBuilder } from "./IVectorBuilder";
import { Vector3Builder } from "./Vector3Builder";
import { Vector2 } from "./Vector2";

export class TripleAxisRotationBuilder implements IVectorBuilder<TripleAxisRotationBuilder> {
    private __yaw__: number;
    private __pitch__: number;
    private __roll__: number;

    public constructor(yaw: number, pitch: number, roll: number) {
        const nonNaNNumber = typeSentry.number.nonNaN();

        if (!(nonNaNNumber.test(yaw) && nonNaNNumber.test(pitch) && nonNaNNumber.test(roll))) {
            throw new TypeError("回転の成分はNaNでない数値である必要があります");
        }

        this.__yaw__ = yaw;
        this.__pitch__ = pitch;
        this.__roll__ = roll;
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

    public get roll(): number {
        return this.__roll__;
    }

    public set roll(value: number) {
        if (!typeSentry.number.nonNaN().test(value)) {
            throw new TypeError("回転の成分はNaNでない数値である必要があります");
        }

        this.__roll__ = value;
    }

    public equals(other: unknown): boolean {
        if (other instanceof TripleAxisRotationBuilder) {
            return this.__yaw__ === other.__yaw__
                && this.__pitch__ === other.__pitch__
                && this.__roll__ === other.__roll__;
        }
        else return false;
    }

    public operate(callbackFn: (comopnent: number) => number): TripleAxisRotationBuilder;

    public operate(other: TripleAxisRotationBuilder, callbackFn: (comopnent1: number, comopnent2: number) => number): TripleAxisRotationBuilder;

    public operate(other1: TripleAxisRotationBuilder, other2: TripleAxisRotationBuilder, callbackFn: (comopnent1: number, comopnent2: number, component3: number) => number): TripleAxisRotationBuilder;

    public operate(a: TripleAxisRotationBuilder | ((comopnent: number) => number), b?: TripleAxisRotationBuilder | ((comopnent1: number, comopnent2: number) => number), c?: (component1: number, component2: number, component3: number) => number): TripleAxisRotationBuilder {
        if (typeof a === "function" && b === undefined && c === undefined) {
            this.__yaw__ = a(this.__yaw__);
            this.__pitch__ = a(this.__pitch__);
            this.__roll__ = a(this.__roll__);
        }
        else if (a instanceof TripleAxisRotationBuilder && typeof b === "function" && c === undefined) {
            this.__yaw__ = b(this.__yaw__, a.__yaw__);
            this.__pitch__ = b(this.__pitch__, a.__pitch__);
            this.__roll__ = b(this.__roll__, a.__roll__);
        }
        else if (a instanceof TripleAxisRotationBuilder && b instanceof TripleAxisRotationBuilder && typeof c === "function") {
            this.__yaw__ = c(this.__yaw__, a.__yaw__, b.__yaw__);
            this.__pitch__ = c(this.__pitch__, a.__pitch__, b.__pitch__);
            this.__roll__ = c(this.__roll__, a.__roll__, b.__roll__)
        }
        else {
            throw new TypeError("NEVER HAPPENS");
        }
        return this;
    }

    public add(other: TripleAxisRotationBuilder): TripleAxisRotationBuilder {
        return this.operate(other, (a, b) => a + b);
    }

    public subtract(other: TripleAxisRotationBuilder): TripleAxisRotationBuilder {
        return this.add(other.clone().invert());
    }

    public scale(scalar: number): TripleAxisRotationBuilder {
        if (!typeSentry.number.nonNaN().test(scalar)) {
            throw new TypeError("倍率はNaNでない数値である必要があります");
        }

        return this.operate(component => component * scalar);
    }

    public divide(scalar: number): TripleAxisRotationBuilder {
        if (!typeSentry.number.nonNaN().test(scalar)) {
            throw new TypeError("割る数はNaNでない数値である必要があります");
        }

        if (scalar === 0) {
            throw new TypeError("0は割る数として無効です");
        }

        return this.operate(component => component / scalar);
    }

    public invert(): TripleAxisRotationBuilder {
        const rotation: TripleAxisRotationBuilder = this.getObjectCoordsSystem().back();
        this.__yaw__ = rotation.__yaw__;
        this.__pitch__ = rotation.__pitch__;
        this.__roll__ = rotation.__roll__;
        return this;
    }

    public clamp(min: TripleAxisRotationBuilder, max: TripleAxisRotationBuilder): TripleAxisRotationBuilder  {
        return this.operate(min, max, (val, min, max) => {
            return Math.max(min, Math.min(val, max));
        });
    }

    public clone(): TripleAxisRotationBuilder {
        return new TripleAxisRotationBuilder(this.__yaw__, this.__pitch__, this.__roll__);
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
        const cz = this.__roll__.toFixed(digits);

        return format
            .replace(/\$yaw/g, cx)
            .replace(/\$pitch/g, cy)
            .replace(/\$roll/g, cz)
            .replace("$c", cx)
            .replace("$c", cy)
            .replace("$c", cz)
            .replace(/\$c/g, "");
    }

    public toString(): string {
        return this.format("($yaw, $pitch, $roll)", 1);
    }

    public getDirection3d(): Vector3Builder {
        return new Vector3Builder(
            -Math.sin(this.__yaw__ * Math.PI / 180) * Math.cos(this.__pitch__ * Math.PI / 180),
            -Math.sin(this.__pitch__ * Math.PI / 180),
            Math.cos(this.__yaw__ * Math.PI / 180) * Math.cos(this.__pitch__ * Math.PI / 180)
        );
    }

    public getObjectCoordsSystem(): InstanceType<typeof TripleAxisRotationBuilder.ObjectCoordsSystem> {
        return new TripleAxisRotationBuilder.ObjectCoordsSystem(this);
    }

    public isZero(): boolean {
        return this.equals(TripleAxisRotationBuilder.zero());
    }

    public static zero(): TripleAxisRotationBuilder {
        return new this(0, 0, 0);
    }

    public static filled(value: number): TripleAxisRotationBuilder {
        return new this(value, value, value);
    }

    public static from(vector2: Vector2, zAngle: number = 0): TripleAxisRotationBuilder {
        return new this(vector2.y, vector2.x, zAngle);
    }

    private static readonly ObjectCoordsSystem = class ObjectCoordsSystem {
        private readonly __rotation__: TripleAxisRotationBuilder;

        public constructor(rotation: TripleAxisRotationBuilder) {
            this.__rotation__ = rotation.clone();
        }

        public getX(): Vector3Builder {
            const forward: Vector3Builder = this.getZ();
    
            return new Vector3Builder(forward.z, 0, -forward.x)
                .normalize()
                .rotate(forward, this.__rotation__.roll);
        }
    
        public getY(): Vector3Builder {
            return this.getZ().cross(this.getX());
        }
    
        public getZ(): Vector3Builder {
            return this.__rotation__.getDirection3d();
        }
    
        public forward(): TripleAxisRotationBuilder {
            return this.__rotation__.clone();
        }
    
        public back(): TripleAxisRotationBuilder {
            return TripleAxisRotationBuilder.ObjectCoordsSystem.ofAxes(
                this.getX().invert(),
                this.getY()
            );
        }
    
        public left(): TripleAxisRotationBuilder {
            return TripleAxisRotationBuilder.ObjectCoordsSystem.ofAxes(
                this.getZ().invert(),
                this.getY()
            );
        }
    
        public right(): TripleAxisRotationBuilder {
            return TripleAxisRotationBuilder.ObjectCoordsSystem.ofAxes(
                this.getZ(),
                this.getY()
            );
        }
    
        public up(): TripleAxisRotationBuilder {
            return TripleAxisRotationBuilder.ObjectCoordsSystem.ofAxes(
                this.getX(),
                this.getZ().invert()
            );
        }
    
        public down(): TripleAxisRotationBuilder {
            return TripleAxisRotationBuilder.ObjectCoordsSystem.ofAxes(
                this.getX(),
                this.getZ()
            );
        }

        private static ofAxes(x: Vector3Builder, y: Vector3Builder): TripleAxisRotationBuilder {
            const z = x.cross(y);
    
            return new TripleAxisRotationBuilder(
                Math.atan2(-z.x, z.z) * 180 / Math.PI,
                Math.asin(-z.y) * 180 / Math.PI,
                Math.atan2(x.y, y.y) * 180 / Math.PI
            );
        }
    }
}
