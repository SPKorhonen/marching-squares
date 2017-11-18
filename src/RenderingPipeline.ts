import { CanvasPrintable } from './canvas-printable';
import CanvasRenderer from './CanvasRenderer';

export default class RenderingPipeline {
    private renderers: CanvasPrintable[] = [];

    private outputContext: CanvasRenderingContext2D;
    private outputCanvas: HTMLCanvasElement;

    private isFlagged: boolean = false;

    public createCanvas(width: number, height: number): void {
        const output = new CanvasRenderer(width, height);

        this.outputCanvas = output.getCanvas();
        this.outputContext = output.getContext();
    }

    public getCanvas(): HTMLCanvasElement {
        return this.outputCanvas;
    }

    public addRenderer(renderer: CanvasPrintable): void {
        this.renderers.unshift(renderer);
    }

    public update(): void {
        const all = this.renderers;
        let renderer: CanvasPrintable;

        for (let i = all.length - 1; i >= 0; i -= 1) {
            all[i].print(this.outputContext);
        }
    }
}
