import { CanvasPrintable } from './canvas-printable';
import CanvasRenderer from './CanvasRenderer';
import { Rect } from './QuadTree';

export default class RenderingPipeline {
    private renderers: CanvasPrintable[] = [];

    private outputContext: CanvasRenderingContext2D;
    private outputCanvas: HTMLCanvasElement;

    private isFlagged: boolean = false;

    private viewport: Rect;
    private viewportCords: number[] = [0, 0];

    public createCanvas(width: number, height: number): void {
        const output = new CanvasRenderer(height, width);
        this.viewport = new Rect(
            this.viewportCords[0],
            this.viewportCords[1],
            width,
            height
        );

        this.outputCanvas = output.getCanvas();
        this.outputContext = output.getContext();

        // this.outputCanvas
        window.addEventListener('keydown', (evt: KeyboardEvent) => {
            switch (evt.keyCode) {
                case 37: // left;
                    this.viewportCords[0] -= 25;
                    break;
                case 38: // up;
                    this.viewportCords[1] -= 25;
                    break;
                case 39: // right;
                    this.viewportCords[0] += 25;
                    break;
                case 40: // down;
                    this.viewportCords[1] += 25;
                    break;

                default:
                    break;
            }

            this.viewport = new Rect(
                this.viewportCords[0],
                this.viewportCords[1],
                width,
                height
            );
            this.update();
        });
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

        this.outputContext.clearRect(0, 0, this.outputContext.canvas.width, this.outputContext.canvas.height);
        for (let i = all.length - 1; i >= 0; i -= 1) {
            all[i].print(this.outputContext, this.viewport);
        }
    }
}
