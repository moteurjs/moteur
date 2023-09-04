import { Scene } from "./scene";
import { System } from "@moteur/ecs";

export interface SceneManagerProps {
    sceneName: string;
}

export class SceneManager extends System {
    private currentScene: Scene | null = null;
    private keepEntityIndices: Set<number> = new Set();

    public constructor(protected props: SceneManagerProps) {
        super();
    }

    private async loadScene(name: string) {
        const scene = this.entities
            .query(Scene)
            .map(([scene]) => scene)
            .find((scene) => scene.name);

        if (scene === undefined) throw Error(`Could not find scene ${name}`);

        const snapshot = this.entities.getEntityIndices();
        if (this.currentScene !== null) {
            snapshot
                .filter((index) => !this.keepEntityIndices.has(index))
                .forEach((index) => this.entities.removeEntity(index));
        } else {
            this.keepEntityIndices = new Set(snapshot);
        }

        scene.entities.forEach((components) =>
            this.entities.addEntity(...components),
        );

        this.currentScene = scene;
    }

    public async update(_timestamp: number) {
        if (this.currentScene === null)
            await this.loadScene(this.props.sceneName);
    }
}
