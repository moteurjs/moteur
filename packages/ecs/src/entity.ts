import { Component } from "./component";

type TupleTypeOfToTupleInstanceOf<
    T extends any[],
    Result extends any[] = [],
> = T extends [
    infer Head extends abstract new (...args: any) => any,
    ...infer Rest,
]
    ? TupleTypeOfToTupleInstanceOf<Rest, [...Result, InstanceType<Head>]>
    : [...Result, number];

interface EntityStorageCacheEntry {
    query: Component[][];
    components: (typeof Component)[];
    entitySet: Set<number>;
}

export class EntityStorage {
    private entities: Record<number, Component[]>;
    private entityIndex: number;

    private entityAddQueue: Record<number, Component[]>;
    private entityRemoveQueue: Record<number, (typeof Component)[]>;

    private queryCache: Record<string, Readonly<EntityStorageCacheEntry>>;

    public constructor() {
        this.entities = {};
        this.entityIndex = 0;

        this.entityAddQueue = {};
        this.entityRemoveQueue = {};

        this.queryCache = {};
    }

    public query<U extends (abstract new (...args: any[]) => Component)[]>(
        ...components: U
    ): TupleTypeOfToTupleInstanceOf<typeof components>[] {
        const componentNames = components.map((component) => component.name);
        const queryCacheName = componentNames.join("-");

        if (!this.queryCache[queryCacheName]) {
            const query = Object.entries(this.entities)
                .map(
                    ([entityKey, entityComponents]) =>
                        [entityComponents, parseInt(entityKey)] as [
                            Component[],
                            number,
                        ],
                )
                .map(
                    ([entityComponents, entityIndex]) =>
                        [
                            components.map((component) =>
                                entityComponents.find(
                                    (ec) => ec instanceof component,
                                ),
                            ),
                            entityIndex,
                        ] as [Component[], number],
                )
                .filter(([entityComponents]) =>
                    entityComponents.every((ec) => ec !== undefined),
                )
                .map(([entityComponents, entityIndex]) => [
                    ...entityComponents,
                    entityIndex,
                ]);

            this.queryCache[queryCacheName] = {
                query,
                components,
                entitySet: new Set(
                    query.map((data) => data[data.length - 1]),
                ) as any,
            };
        }

        const result = this.queryCache[queryCacheName].query;

        return result as any;
    }

    public getEntityIndices(): number[] {
        return Object.keys(this.entities).map((entityIndex) =>
            parseInt(entityIndex),
        );
    }

    public addEntity(...components: Component[]): number {
        const entityIndex = this.entityIndex++;
        this.entityAddQueue[entityIndex] = components;

        return entityIndex;
    }

    public async addComponents(
        entityIndex: number,
        ...components: Component[]
    ) {
        this.entityAddQueue[entityIndex].push(...components);
    }

    public processAdds() {
        const entries = Object.entries(this.entityAddQueue).map(
            ([entityKey, components]) =>
                [parseInt(entityKey), components] as [number, Component[]],
        );

        if (entries.length === 0) return;

        entries.forEach(([entityIndex, components]) => {
            if (this.entities[entityIndex]) {
                this.entities[entityIndex].push(...components);
            } else {
                this.entities[entityIndex] = components;
            }
        });

        this.queryCache = Object.fromEntries(
            Object.entries(this.queryCache).filter(([_name, entry]) =>
                entries.every(
                    ([entityIndex, entityComponents]) =>
                        !entry.entitySet.has(entityIndex) &&
                        entry.components.every((component) =>
                            entityComponents.every(
                                (ec) => !(ec instanceof component),
                            ),
                        ),
                ),
            ),
        );

        this.entityAddQueue = {};
    }

    public removeEntity(entityIndex: number) {
        this.entityRemoveQueue[entityIndex] = [];
    }

    public removeComponents(
        entityIndex: number,
        ...components: (typeof Component)[]
    ) {
        const entry = this.entityRemoveQueue[entityIndex];

        // Note: Empty array will delete everything.
        if (entry && entry.length > 0)
            this.entityRemoveQueue[entityIndex].push(...components);
        else this.entityRemoveQueue[entityIndex] = components;
    }

    public processRemoves() {
        const entries = Object.entries(this.entityRemoveQueue).map(
            ([entityKey, components]) =>
                [parseInt(entityKey), components] as [
                    number,
                    (typeof Component)[],
                ],
        );

        if (entries.length === 0) return;

        entries.forEach(([entityIndex, components]) => {
            if (components.length === 0) {
                delete this.entities[entityIndex];
            } else {
                this.entities[entityIndex] = this.entities[entityIndex].filter(
                    (ec) =>
                        components.every(
                            (component) => !(ec instanceof component),
                        ),
                );
            }
        });

        this.queryCache = Object.fromEntries(
            Object.entries(this.queryCache).filter(([_name, entry]) =>
                entries.every(
                    ([entityIndex]) => !entry.entitySet.has(entityIndex),
                ),
            ),
        );

        this.entityRemoveQueue = {};
    }
}
