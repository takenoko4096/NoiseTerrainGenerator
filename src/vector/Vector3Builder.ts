import { Direction } from "./Direction";
import { IVectorBuilder } from "./IVectorBuilder";
import { typeSentry } from "@typesentry";
import { DualAxisRotationBuilder } from "./DualAxisRotationBuilder";
import { Vector3 } from "./Vector3";
import { VectorXZ } from "./VectorXZ";

export class Vector3Builder implements Vector3, IVectorBuilder<Vector3Builder> {
    private __x__: number;
    private __y__: number;
    private __z__: number;

    public constructor(x: number, y: number, z: number) {
        const nonNaNNumber = typeSentry.number.nonNaN();

        if (!(nonNaNNumber.test(x) && nonNaNNumber.test(y) && nonNaNNumber.test(z))) {
            throw new TypeError("ベクトルの成分はNaNでない数値である必要があります");
        }

        this.__x__ = x;
        this.__y__ = y;
        this.__z__ = z;
    }

    public get x(): number {
        return this.__x__;
    }

    public set x(value: number) {
        if (!typeSentry.number.nonNaN().test(value)) {
            throw new TypeError("ベクトルの成分はNaNでない数値である必要があります");
        }

        this.__x__ = value;
    }

    public get y(): number {
        return this.__y__;
    }

    public set y(value: number) {
        if (!typeSentry.number.nonNaN().test(value)) {
            throw new TypeError("ベクトルの成分はNaNでない数値である必要があります");
        }

        this.__y__ = value;
    }

    public get z(): number {
        return this.__z__;
    }

    public set z(value: number) {
        if (!typeSentry.number.nonNaN().test(value)) {
            throw new TypeError("ベクトルの成分はNaNでない数値である必要があります");
        }

        this.__z__ = value;
    }

    public equals(other: unknown): boolean {
        if (Vector3Builder.isVector3(other)) {
            return this.__x__ === other.x
            && this.__y__ === other.y
            && this.__z__ === other.z;
        }
        else return false;
    }

    public operate(callbackFn: (comopnent: number) => number): Vector3Builder;

    public operate(other: Vector3, callbackFn: (comopnent1: number, comopnent2: number) => number): Vector3Builder;

    public operate(other1: Vector3, other2: Vector3, callbackFn: (comopnent1: number, comopnent2: number, component3: number) => number): Vector3Builder;

    public operate(a: Vector3 | ((comopnent: number) => number), b?: Vector3 | ((comopnent1: number, comopnent2: number) => number), c?: (comopnent1: number, comopnent2: number, component3: number) => number): Vector3Builder {
        if (typeof a === "function" && b === undefined && c === undefined) {
            this.x = a(this.x);
            this.y = a(this.y);
            this.z = a(this.z);
        }
        else if (Vector3Builder.isVector3(a) && typeof b === "function" && c === undefined) {
            this.x = b(this.x, a.x);
            this.y = b(this.y, a.y);
            this.z = b(this.z, a.z);
        }
        else if (Vector3Builder.isVector3(a) && Vector3Builder.isVector3(b) && typeof c === "function") {
            this.x = c(this.x, a.x, b.x);
            this.y = c(this.y, a.y, b.y);
            this.z = c(this.z, a.z, b.z);
        }
        else {
            throw new TypeError("NEVER HAPPENS");
        }
        return this;
    }

    public add(other: Vector3): Vector3Builder {
        return this.operate(other, (a, b) => a + b);
    }

    public subtract(other: Vector3): Vector3Builder {
        return this.add(Vector3Builder.from(other).clone().invert());
    }

    public scale(scalar: number): Vector3Builder {
        if (!typeSentry.number.nonNaN().test(scalar)) {
            throw new TypeError("倍率はNaNでない数値である必要があります");
        }

        return this.operate(component => component * scalar);
    }

    public divide(scalar: number): Vector3Builder {
        if (!typeSentry.number.nonNaN().test(scalar)) {
            throw new TypeError("割る数はNaNでない数値である必要があります");
        }

        if (scalar === 0) {
            throw new TypeError("0は割る数として無効です");
        }

        return this.operate(component => component / scalar);
    }

    public invert(): Vector3Builder {
        return this.scale(-1);
    }

    public dot(other: Vector3): number {
        return this.__x__ * other.x + this.__y__ * other.y + this.__z__ * other.z;
    }

    public cross(other: Vector3): Vector3Builder {
        const x1 = this.__x__;
        const y1 = this.__y__;
        const z1 = this.__z__;
        const x2 = other.x;
        const y2 = other.y;
        const z2 = other.z;

        return new Vector3Builder(
            y1 * z2 - z1 * y2,
            z1 * x2 - x1 * z2,
            x1 * y2 - y1 * x2
        );
    }

    public hadamard(other: Vector3): Vector3Builder {
        return this.clone().operate(other, (a, b) => a * b);
    }

    public length(): number;

    public length(length: number): Vector3Builder;

    public length(length?: number): number | Vector3Builder {
        if (length === undefined) {
            return Math.sqrt(this.dot(this));
        }
        else if (typeSentry.number.nonNaN().test(length)) {
            const previous = this.length();

            if (previous === 0) {
                return this;
            }

            return this.operate(component => component / previous * length);
        }
        else {
            throw new TypeError("ベクトルの長さはNaNでない数値である必要があります");
        }
    }

    public normalize(): Vector3Builder {
        return this.length(1);
    }

    public getAngleBetween(other: Vector3): number {
        const cos: number = this.dot(other) / (this.length() * Vector3Builder.from(other).length());
        return Math.acos(cos) * 180 / Math.PI;
    }

    public getDistanceTo(other: Vector3): number {
        return Math.hypot(
            this.__x__ - other.x,
            this.__y__ - other.y,
            this.__z__ - other.z
        );
    }

    public getDirectionTo(other: Vector3): Vector3Builder {
        return Vector3Builder.from(other).clone()
            .subtract(this)
            .normalize();
    }

    public project(other: Vector3): Vector3Builder {
        const wrapped = Vector3Builder.from(other);

        return wrapped.clone().scale(
            wrapped.length() * this.length() / wrapped.length() * wrapped.length()
        );
    }

    public reject(other: Vector3): Vector3Builder {
        return this.clone().subtract(this.project(other));
    }

    public reflect(normal: Vector3): Vector3Builder {
        const dot = this.dot(normal);

        return this.clone().operate(normal, (a, b) => a - 2 * dot * b);
    }

    public lerp(other: Vector3, t: number): Vector3Builder {
        if (!typeSentry.number.nonNaN().test(t)) {
            throw new TypeError("tはNaNでない数値である必要があります");
        }

        const linear = (a: number, b: number) => (1 - t) * a + t * b;

        return new Vector3Builder(
            linear(this.__x__, other.x),
            linear(this.__y__, other.y),
            linear(this.__z__, other.z)
        );
    }

    public slerp(other: Vector3, s: number): Vector3Builder {
        if (!typeSentry.number.nonNaN().test(s)) {
            throw new TypeError("sはNaNでない数値である必要があります");
        }

        const angle = this.getAngleBetween(other) * Math.PI / 180;

        const p1 = Math.sin(angle * (1 - s)) / Math.sin(angle);
        const p2 = Math.sin(angle * s) / Math.sin(angle);

        const q1 = this.clone().scale(p1);
        const  q2 = Vector3Builder.from(other).clone().scale(p2);

        return q1.add(q2);
    }

    public clamp(min: Vector3, max: Vector3): Vector3Builder {
        return this.operate(min, max, (val, min, max) => {
            return Math.max(min, Math.min(val, max));
        });
    }

    public clone(): Vector3Builder {
        return new Vector3Builder(this.__x__, this.__y__, this.__z__);
    }

    public format(format: string, digits: number): string {
        if (!typeSentry.number.nonNaN().int().test(digits)) {
            throw new TypeError("桁数はNaNでない整数値である必要があります");
        }
        else if (digits < 0 || digits > 20) {
            throw new RangeError("digitsに使用可能な値は0以上20以下です");
        }

        const cx = this.__x__.toFixed(digits);
        const cy = this.__y__.toFixed(digits);
        const cz = this.__z__.toFixed(digits);

        return format
            .replace(/\$x/g, cx)
            .replace(/\$y/g, cy)
            .replace(/\$z/g, cz)
            .replace("$c", cx)
            .replace("$c", cy)
            .replace("$c", cz)
            .replace(/\$c/g, "");
    }

    public toString(): string {
        return this.format("($x, $y, $z)", 1);
    }

    public getRotation2f(): DualAxisRotationBuilder {
        const normalized = this.clone().normalize();

        return new DualAxisRotationBuilder(
            -Math.atan2(normalized.__x__, normalized.__z__) * 180 / Math.PI,
            -Math.asin(normalized.__y__) * 180 / Math.PI
        );
    }

    public rotate(axis: Vector3, angle: number): Vector3Builder {
        const angleInRad = angle * Math.PI / 180;
        const sin = Math.sin(angleInRad);
        const cos = Math.cos(angleInRad);
        const { x, y, z } = axis;

        const matrix = [
            [
                cos + x * x * (1 - cos),
                x * y * (1 - cos) - z * sin,
                x * z * (1 - cos) + y * sin
            ],
            [
                y * x * (1 - cos) + z * sin,
                cos + y * y * (1 - cos),
                y * z * (1 - cos) - x * sin
            ],
            [
                z * x * (1 - cos) - y * sin,
                z * y * (1 - cos) + x * sin,
                cos + z * z * (1 - cos)
            ]
        ] as const;

        const a: number = matrix[0][0] * this.x + matrix[0][1] * this.y + matrix[0][2] * this.z;
        const b: number = matrix[1][0] * this.x + matrix[1][1] * this.y + matrix[1][2] * this.z;
        const c: number = matrix[2][0] * this.x + matrix[2][1] * this.y + matrix[2][2] * this.z;

        this.__x__ = a;
        this.__y__ = b;
        this.__z__ = c;

        return this;
    }

    public isZero(): boolean {
        return this.equals(Vector3Builder.zero());
    }

    public toXZ(): VectorXZ {
        return { x: this.x, z: this.z };
    }

    public static isVector3(value: unknown): value is Vector3 {
        return typeSentry.structOf({
            x: typeSentry.number.nonNaN(),
            y: typeSentry.number.nonNaN(),
            z: typeSentry.number.nonNaN()
        }).test(value);
    }

    public static isVectorXZ(value: unknown): value is VectorXZ {
        return typeSentry.structOf({
            x: typeSentry.number.nonNaN(),
            z: typeSentry.number.nonNaN()
        }).test(value);
    }

    public static zero(): Vector3Builder {
        return new this(0, 0, 0);
    }

    public static forward(): Vector3Builder {
        return new this(0, 0, 1);
    }

    public static back(): Vector3Builder {
        return new this(0, 0, -1);
    }

    public static left(): Vector3Builder {
        return new this(1, 0, 0);
    }

    public static right(): Vector3Builder {
        return new this(-1, 0, 0);
    }

    public static up(): Vector3Builder {
        return new this(0, 1, 0);
    }

    public static down(): Vector3Builder {
        return new this(0, -1, 0);
    }

    public static filled(value: number): Vector3Builder {
        return new Vector3Builder(value, value, value);
    }

    public static from(vector3: Vector3): Vector3Builder;

    public static from(vectorXZ: VectorXZ, y?: number): Vector3Builder;

    public static from(direction: Direction): Vector3Builder;

    public static from(arg0: Vector3 | VectorXZ | Direction, arg1: number = 0): Vector3Builder {
        if (this.isVector3(arg0)) {
            return new Vector3Builder(arg0.x, arg0.y, arg0.z);
        }
        else if (this.isVectorXZ(arg0)) {
            return new this(arg0.x, arg1, arg0.z);
        }
        else if (Object.values(Direction).includes(arg0)) {
            switch (arg0) {
                case Direction.Up: return Vector3Builder.up();
                case Direction.Down: return Vector3Builder.down();
                case Direction.North: return Vector3Builder.back();
                case Direction.South: return Vector3Builder.forward();
                case Direction.East: return Vector3Builder.left();
                case Direction.West: return Vector3Builder.right();
                default: throw new TypeError("Unknown Direction Value");
            }
        }
        else {
            throw new TypeError("Unknown Type Value");
        }
    }

    public static min(a: Vector3, b: Vector3): Vector3Builder {
        return this.from(a).clone().operate(b, (a, b) => Math.min(a, b));
    }

    public static max(a: Vector3, b: Vector3): Vector3Builder {
        return this.from(a).clone().operate(b, (a, b) => Math.max(a, b));
    }
}
