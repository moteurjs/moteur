import { Texture } from "./texture";
import { Component } from "@moteur/ecs";

export interface SpriteProps {
    texture: Texture;
}

export class Sprite extends Component {
    public readonly texture: Texture;

    public constructor(props: SpriteProps) {
        super();

        this.texture = props.texture;
    }
}
