import { Spin } from "./components/spin";
import { SpinSystem } from "./systems/spin";
import { Game } from "@moteur/core";
import { EventManager } from "@moteur/event";
import {
    Camera,
    RenderContext,
    Sprite,
    SpriteRenderer,
    Texture,
} from "@moteur/gfx";
import { Transform, Vector2 } from "@moteur/math";

const ENTITY_COUNT = 1000;

export default class SpinGame extends Game {
    protected async init() {
        const renderContext = new RenderContext("game-canvas");

        const textures = await Promise.all(
            new Array(10)
                .fill(0)
                .map((_, index) =>
                    Texture.fromFile(
                        renderContext.gl,
                        `sprites/planet0${index}.png`,
                    ),
                ),
        );

        this.addEntity(renderContext).addEntity(new Camera(), new Transform());

        new Array(ENTITY_COUNT).fill(0).forEach((_, index) => {
            this.addEntity(
                new Sprite({
                    texture: textures[index % textures.length],
                }),
                new Spin({
                    maxVelocity: Math.random() * 0.75,
                }),
                new Transform({
                    position: new Vector2(
                        Math.random() * 2 - 1,
                        Math.random() * 2 - 1,
                    ),
                    scale: Math.random() * 0.5 + 0.25,
                    rotation: Math.random() * Math.PI * 2,
                    depth: index / 100,
                }),
            );
        });

        this.addSystem(new EventManager())
            .addSystem(
                new SpinSystem({
                    deltaTimestamp: 500,
                    buttonId: "spin",
                }),
            )
            .addSystem(
                new SpriteRenderer({
                    backgroundColor: [0x00, 0x00, 0x00, 0xff],
                }),
            );
    }
}
