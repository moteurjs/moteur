import { Component } from "@moteur/ecs";

export interface SpinProps {
    maxVelocity: number;
}

export class Spin extends Component {
    public velocity: number;

    public readonly maxVelocity: number;

    public constructor(props: SpinProps) {
        super();

        this.velocity = 0;
        this.maxVelocity = props.maxVelocity;
    }
}
