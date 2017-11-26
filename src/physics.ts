import { Rect } from './QuadTree';
import { MarchableSpace } from './Map';

export interface IPhysicsBody {
    update(gameTime: number, deltaTime: number): void;
}

export class RigidBody implements IPhysicsBody {
    private ySpeed: number = 0;
    private xSpeed: number = 0;
    private position: number[] = [0, 0];

    constructor(private width: number, private height: number) { }

    update(gameTime: number, deltaTime: number): void {
        this.position[0] += this.xSpeed;
        this.position[1] += this.ySpeed;
    }
}

export class PhysicsSystem {
    public speed: number = 1;
    private bodies: IPhysicsBody[];

    private totalTime: number = 0;
    private lastTickTime: number = 0;

    constructor(private boundary: MarchableSpace) { }

    private tick(): void {
        const tickTime = Date.now();
        // we adjust the dleta by the speed so we can do things like slowmo
        const delta = (tickTime - this.lastTickTime) * this.speed;
        this.totalTime += delta;

        for (let i = this.bodies.length - 1; i >= 0; i -= 1) {
            this.bodies[i].update(tickTime, delta);
        }



        requestAnimationFrame(this.tick.bind(this));
    }
}