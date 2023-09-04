import { Component, EntityStorage, System } from "@moteur/ecs";

export abstract class Game {
    private readonly entities: EntityStorage;
    private readonly systems: System[];

    public constructor() {
        this.entities = new EntityStorage();
        this.systems = [];
    }

    public async boot() {
        await this.init();
        await this.postInit();
    }

    protected async init() {}

    protected async postInit() {
        await Promise.all(this.systems.map((system) => system.init()));
    }

    public async loop(timestamp: number) {
        this.entities.processAdds();
        await this.update(timestamp);
        this.entities.processRemoves();

        // @ts-ignore
        requestAnimationFrame((timestamp: number) => this.loop(timestamp));
    }

    private async update(timestamp: number) {
        this.systems.forEach((system) => system.update(timestamp));
    }

    protected addEntity(...components: Component[]): this {
        this.entities.addEntity(...components);

        return this;
    }

    protected addSystem(system: System) {
        system.bindEntities(this.entities);

        this.systems.push(system);

        return this;
    }
}
