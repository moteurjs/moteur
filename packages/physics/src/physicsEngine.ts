import { RigidBody } from "./rigidBody";
import { System } from "@webng/ecs";
import { Transform } from "@webng/math";

export class PhysicsEngine extends System {
    private previousTimestamp: number = undefined as any as number;

    public async update(timestamp: number) {
        const delta =
            (timestamp - (this.previousTimestamp ?? timestamp)) / 1000;
        this.previousTimestamp = timestamp;

        this.entities
            .query(RigidBody, Transform)
            .forEach(([rigidBody, transform]) => {
                rigidBody.velocity.set(
                    rigidBody.velocity.add(rigidBody.acceleration.mult(delta)),
                );
                transform.position.set(
                    transform.position.add(rigidBody.velocity.mult(delta)),
                );
            });
    }
}
