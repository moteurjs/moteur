import { Vector2 } from "./vector";
import { Component } from "@webng/ecs";

export interface TransformProps {
    position?: Vector2;
    rotation?: number;
    depth?: number;
    scale?: Vector2 | number;
}

export class Transform extends Component {
    public position: Vector2;
    public rotation: number;
    public depth: number;
    public scale: Vector2;

    public constructor(props?: TransformProps) {
        super();

        this.position = props?.position ?? new Vector2();
        this.rotation = props?.rotation ?? 0;
        this.depth = props?.depth ?? 0;

        if (props?.scale instanceof Vector2) this.scale = props.scale;
        else if (props?.scale !== undefined)
            this.scale = new Vector2(props.scale, props.scale);
        else this.scale = new Vector2(1, 1);
    }
}
