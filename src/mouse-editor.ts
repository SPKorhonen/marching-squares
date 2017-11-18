import Emitter from './emitter';
import MarchingSquares from './marching-squares';
import { getRadiusCoords } from './coord-utils';
import VCR from './vcr';
import { CanvasPrintable } from './canvas-printable';
import Map, { MarchableSpace } from './Map';
import QuadTree from './QuadTree';

export default class MouseEditor extends Emitter implements CanvasPrintable {
    static MIN_SIZE: number = 0;
    static MAX_SIZE: number = 5;

    drawSize: number = 0;
    isActive: boolean = false;
    last: string;
    mode: number = 0;
    map: MarchableSpace;
    renderer: VCR;

    selectionX: number = -1;
    selectionY: number = -1;

    context: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;

    lastDimensions: number[] = [0, 0, 0, 0];

    constructor(private ms: MarchingSquares, private output: HTMLCanvasElement) {
        super();
        const size = ms.getCellSize() * ms.getGridSize();
        this.renderer = new VCR(size, size);
        this.map = ms.getMap();
        this.bindMouseEvents();

        this.canvas = this.renderer.getCanvas('hover');
        this.context = this.renderer.getContext('hover');
        this.context.fillStyle = 'rgba(0, 255, 0, 0.2)';
    }

    private bindMouseEvents(): void {
        this.output.addEventListener('contextmenu', (evt) => { evt.preventDefault(); });
        this.output.addEventListener('wheel', this.onMouseWheel.bind(this));
        this.output.addEventListener('mousedown', this.onMouseActivate.bind(this));
        this.output.addEventListener('mouseup', this.onMouseDeactivate.bind(this));
        this.output.addEventListener('mouseout', this.onMouseDeactivate.bind(this));
        this.output.addEventListener('mousemove', this.onMouseMove.bind(this));
    }

    private onMouseWheel(evt: MouseWheelEvent): void {
        evt.preventDefault();
        this.drawSize += evt.deltaY > 0 ? 1 : -1;
        this.drawSize = Math.min(Math.max(this.drawSize, 0), 5);
        this.emit('update');
    }

    private onMouseActivate(evt: MouseEvent): void {
        evt.preventDefault();

        this.isActive = true;
        this.mode = evt.which === 1 ? 1 : 0;
        this.toggleSection(evt);
    }

    private onMouseDeactivate(): void {
        this.isActive = false;
    }

    private clearSelectionHighlight(): void {
        this.selectionX = -1;
        this.selectionY = -1;
    }

    private updateSelectionHighlight(evt: MouseEvent): void {
        const cellSize = this.ms.getCellSize();
        const gridSize = this.ms.getGridSize();

        this.selectionX = Math.round((evt.offsetX / cellSize) - 0.5);
        this.selectionY = Math.round((evt.offsetY / cellSize) - 0.5);

        this.emit('update');
    }

    private onMouseMove(evt: MouseEvent): void {
        if (this.isActive) {
            // this.clearSelectionHighlight();
            this.toggleSection(evt);
        } // else {
        this.updateSelectionHighlight(evt);
        // }
    }

    private toggleSection(evt: MouseEvent): void {
        const cellSize = this.ms.getCellSize();
        const x = Math.round((evt.offsetX / cellSize) - 0.5);
        const y = Math.round((evt.offsetY / cellSize) - 0.5);

        const key = `${x},${y},${this.mode}`;
        if (this.last === key) { return; }

        const coords: number[][] = getRadiusCoords(x, y, this.drawSize);
        let pt: number[];

        for (let i = coords.length - 1; i >= 0; i -= 1) {
            pt = coords[i];
            this.map.set(pt[0], pt[1], this.mode);
        }
        this.last = key;

        this.emit('update');
    }

    public print(toContext: CanvasRenderingContext2D): void {
        const cellSize = this.ms.getCellSize();
        const x = this.selectionX;
        const y = this.selectionY;


        // if we don't grow the `clearRect` size a little bit,
        // bits of remnant rects remain behind.
        const padding = cellSize;
        this.context.clearRect(
            this.lastDimensions[0] - (padding / 2),
            this.lastDimensions[1] - (padding / 2),
            this.lastDimensions[2] + padding,
            this.lastDimensions[3] + padding,
        );

        if ((x | y) !== -1) {
            this.lastDimensions = [
                (x - this.drawSize / 2) * cellSize,
                (y - this.drawSize / 2) * cellSize,
                cellSize * (this.drawSize + 1),
                cellSize * (this.drawSize + 1)
            ];

            this.context.fillRect(
                this.lastDimensions[0],
                this.lastDimensions[1],
                this.lastDimensions[2],
                this.lastDimensions[3],
            );
        }

        toContext.drawImage(this.canvas, 0, 0);
    }
}
