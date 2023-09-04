import { Component } from "@webng/ecs";

export interface SceneProps {
    name: string;
}

export class Scene extends Component {
    public readonly name: string;
    public readonly entities: Component[][];

    public constructor(protected props: Readonly<SceneProps>) {
        super();

        this.name = props.name;
        this.entities = [];
    }

    public addEntity(...components: Component[]): this {
        this.entities.push(components);

        return this;
    }
}
