import { Renderer } from './main';

interface VcrContext {
    id: string;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
}

export default class VirtualCanvasRenderer implements Renderer {
    instances: any = {};

    constructor(private height: number, private width: number) { }

    public getContext(name?: string): CanvasRenderingContext2D {
        if (!this.instances.hasOwnProperty(name || 'main')) {
            this.init(name || 'main');
        }

        return this.instances[name || 'main'].context;
    }

    public getCanvas(name?: string): HTMLCanvasElement {
        if (!this.instances.hasOwnProperty(name || 'main')) {
            this.init(name || 'main');
        }

        return this.instances[name || 'main'].canvas;
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