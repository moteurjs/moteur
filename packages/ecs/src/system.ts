import { EntityStorage } from "./entity";

export abstract class System {
    protected entities: EntityStorage = null as any as EntityStorage;

    public constructor() {}

    public bindEntities(entities: EntityStorage) {
        this.entities = entities;
    }

    public async init() {}
    public async update(_timestamp: number) {}
}
