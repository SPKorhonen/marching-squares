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
        // The pipeline needs to generate a canvas to display things on to the user.
        const totalCellCount = this.cellSize * this.gridSize;
        this.pipeline.createCanvas(640, 480);

        this.instance = this.createMarchingInstance();
        this.pipeline.addRenderer(this.instance);
        // this.pipeline.addRenderer(this.instance.getRenderer());

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
const app = new MarchingSquaresApp(15, 100);
