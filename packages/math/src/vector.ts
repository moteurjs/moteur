export class Vector2 {
    public constructor(
        public x: number = 0,
        public y: number = 0,
    ) {}

    public set(v: Vector2) {
        this.x = v.x;
        this.y = v.y;
    }

    public add(other: Vector2): Vector2 {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    public mult(other: number): Vector2 {
        return new Vector2(this.x * other, this.y * other);
    }
}
