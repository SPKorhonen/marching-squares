import { Renderer } from './main';

interface VcrContext {
    id: string;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
}

export default class VirtualCanvasRenderer implements Renderer {
    contexts: any = {};

    static getRandomID(): string {
        return Math.random().toString(36).slice(2);
    }

    public getContext(name: string): CanvasRenderingContext2D {
        if (!this.contexts.hasOwnProperty(name)) {
            const { canvas, context } = this.createNewContext();
            this.contexts[name] = {
                name,
                canvas,
                context,
            };
        }

        return this.contexts[name].context;
    }

    private createNewContext() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        return {
            canvas,
            context,
        };
    }
}