import { Renderer } from './main';
import VCR from './vcr';

export default class CanvasRenderer implements Renderer {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    constructor(private height: number, private width: number) { }

    public getContext(): CanvasRenderingContext2D {
        if (!this.context) {
            this.create();
        }

        return this.context;
    }

    public getCanvas(): HTMLCanvasElement {
        if (!this.canvas) {
            this.create();
        }

        return this.canvas;
    }

    private create() {
        const canvas = document.createElement('canvas');
        canvas.setAttribute('height', `${this.height}px`);
        canvas.setAttribute('width', `${this.width}px`);
        document.body.appendChild(canvas);

        const context = canvas.getContext('2d');

        this.canvas = canvas;
        this.context = context;
    }
}
