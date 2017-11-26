import Map, { MarchableSpace } from './Map';
import { PhysicsSystem } from './physics';
import MarchingSquares from './marching-squares';
import Emitter from './emitter';

export default class PhysicsDemo extends Emitter {
    system: PhysicsSystem;
    map: MarchableSpace;

    selectionX: number = -1;
    selectionY: number = -1;

    constructor(private ms: MarchingSquares, private output: HTMLCanvasElement) {
        super();
        this.map = ms.getMap();
        this.bindMouseEvents();

        this.system = new PhysicsSystem(this.map);
    }

    private bindMouseEvents(): void {
        const handler = this.updateSelection.bind(this);
        this.output.addEventListener('mousedown', handler);
        this.output.addEventListener('mouseup', handler);
        this.output.addEventListener('mouseout', handler);
        this.output.addEventListener('mousemove', handler);

        window.addEventListener('keyup', this.spawnEntity.bind(this));
    }

    private updateSelection(evt: MouseEvent): void {
        const cellSize = this.ms.getCellSize();
        const gridSize = this.ms.getGridSize();

        this.selectionX = Math.round((evt.offsetX / cellSize) - 0.5);
        this.selectionY = Math.round((evt.offsetY / cellSize) - 0.5);
    }

    private spawnEntity(evt: MouseEvent): void {
        if (this.selectionX === -1 || this.selectionY === -1) { return; }


    }
}
