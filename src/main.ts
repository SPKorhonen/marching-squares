import Map from './Map';
import MarchingSquares from './marching-squares';
import VCR from './vcr';
import MouseEditor from './mouse-editor';
import RenderingPipeline from './RenderingPipeline';

export interface Renderer {
    getContext(name?: string): CanvasRenderingContext2D;
    getCanvas(name?: string): HTMLCanvasElement;
}

export class MarchingSquaresApp {
    shouldUpdate: boolean = false;
    instance: MarchingSquares;

    pipeline: RenderingPipeline;

    constructor(private cellSize: number = 10, private gridSize: number = 15) {
        this.pipeline = new RenderingPipeline();
        const totalCellCount = this.cellSize * this.gridSize;
        this.pipeline.createCanvas(totalCellCount, totalCellCount);

        this.instance = this.createMarchingInstance();
        this.pipeline.addRenderer(this.instance);

        const editor = this.createMouseEditor();
        this.pipeline.addRenderer(editor);

        this.pipeline.update();
        this.tick = this.tick.bind(this);
        this.tick();
    }

    createMarchingInstance(): MarchingSquares {
        const totalCellCount = this.cellSize * this.gridSize;
        const virtualRenderer = new VCR(totalCellCount, totalCellCount);
        return new MarchingSquares(virtualRenderer, this.cellSize, this.gridSize);
    }

    toggleUpdateFlag(val: boolean): void {
        this.shouldUpdate = val;
    }

    createMouseEditor(): MouseEditor {
        const me = new MouseEditor(this.instance, this.pipeline.getCanvas());

        me.on('update', this.toggleUpdateFlag.bind(this, true));

        return me;
    }

    tick() {
        if (this.shouldUpdate) {
            this.pipeline.update();
            this.shouldUpdate = false;
        }
        requestAnimationFrame(this.tick);
    }
}

document.body.innerHTML = '';
const app = new MarchingSquaresApp(15, 50);
