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
        this.renderers.push(renderer);
    }

    public update(): void {
        this.renderers.forEach((renderer: CanvasPrintable) => {
            requestAnimationFrame(() => {
                renderer.print(this.outputContext);
            });
        });
    }
}
