import { Spin } from "../components/spin";
import { System } from "@moteur/ecs";
import { Transform } from "@moteur/math";
import { ButtonClickEvent } from "@moteur/ui";

export interface SpinSystemProps {
    buttonId: string;
    deltaTimestamp: number;
}

export class SpinSystem extends System {
    private readonly buttonId: string;
    private readonly deltaTimestamp: number;

    private lastClickTimestamp: number;

    public constructor(props: SpinSystemProps) {
        super();

        this.buttonId = props.buttonId;
        this.deltaTimestamp = props.deltaTimestamp;

        this.lastClickTimestamp = -this.deltaTimestamp;
    }

    async update(timestamp: number) {
        let buttonClicked =
            this.entities
                .query(ButtonClickEvent)
                .findIndex(([event]) => event.id === this.buttonId) >= 0;
        if (buttonClicked) this.lastClickTimestamp = timestamp;

        this.entities.query(Spin, Transform).forEach(([spin, transform]) => {
            if (timestamp - this.lastClickTimestamp < this.deltaTimestamp) {
                spin.velocity = Math.min(
                    spin.velocity + spin.maxVelocity * 0.1,
                    spin.maxVelocity,
                );
            } else {
                spin.velocity = Math.max(
                    spin.velocity - spin.maxVelocity * 0.1,
                    0,
                );
            }

            transform.rotation += spin.velocity;
        });
    }
}
