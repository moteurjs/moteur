import { Vector2 } from "@webng/math";

export interface RigidBodyProps {
    velocity?: Vector2;
    acceleration?: Vector2;
}

export class RigidBody {
    public velocity: Vector2;
    public acceleration: Vector2;

    public constructor(props: RigidBodyProps) {
        this.velocity = props.velocity ?? new Vector2();
        this.acceleration = props.acceleration ?? new Vector2();
    }
}
