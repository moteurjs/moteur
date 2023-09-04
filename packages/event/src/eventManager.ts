import { Event } from "./event";
import { System } from "@moteur/ecs";

export class EventManager extends System {
    private inputQueue: Event[];
    private removeQueue: number[];

    public constructor() {
        super();

        this.inputQueue = [];
        this.removeQueue = [];
    }

    public queue(event: Event) {
        this.inputQueue.push(event);
    }

    async init() {
        // @ts-ignore
        if (window.eventManagers) window.eventManagers.push(this);
        // @ts-ignore
        else window.eventManagers = [this];
    }

    public async update(_timestamp: number) {
        this.removeQueue.forEach((entityIndex) =>
            this.entities.removeEntity(entityIndex),
        );
        this.removeQueue = this.inputQueue.map((event) =>
            this.entities.addEntity(event),
        );
        this.inputQueue = [];
    }
}
