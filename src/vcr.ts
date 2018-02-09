import { Renderer } from './main';

interface VcrContext {
    id: string;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
}

export default class VirtualCanvasRenderer implements Renderer {
    instances: any = {};

    constructor(private height: number, private width: number) { }

    public getContext(name: string = 'main'): CanvasRenderingContext2D {
        if (!this.instances.hasOwnProperty(name)) {
            this.init(name);
        }

        return this.instances[name].context;
    }

    public getCanvas(name: string = 'main'): HTMLCanvasElement {
        if (!this.instances.hasOwnProperty(name)) {
            this.init(name);
        }

        return this.instances[name].canvas;
    }

    public free(name: string = 'main') {
        if (this.instances.hasOwnProperty(name)) {
            // Remove the element from the DOM in case it was appended.
            const canvas = this.instances[name].canvas;
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }

            this.instances[name].context = null;
            this.instances[name].canvas = null;

            delete this.instances[name];
        }
    }

    private createNew() {
        const canvas = document.createElement('canvas');
        canvas.setAttribute('height', `${this.height}px`);
        canvas.setAttribute('width', `${this.width}px`);
        const context = canvas.getContext('2d');

        return {
            canvas,
            context,
        };
    }

    private init(name: string) {
        const { canvas, context } = this.createNew();

        this.instances[name] = {
            name,
            canvas,
            context,
        };
    }
}