import Map from './Map';
import MarchingSquares from './marching-squares';
import VCR from './vcr';
import CanvasRenderer from './CanvasRenderer';

export interface Renderer {
    getContext(name?: string): CanvasRenderingContext2D;
    getCanvas(name?: string): HTMLCanvasElement;
}

const size = [5, 200];
const num = size[0] * size[1];

const ms = new MarchingSquares(size[0], size[1], new VCR(num, num));
const output = new CanvasRenderer(num, num);
ms.print(output.getContext(), true);

const canvas: any = output.getCanvas();

let drawSize: number = 0;
let mouseDown: boolean = false;
let last: string;
let mode: number = 0;
canvas.addEventListener('mousedown', (evt) => {
    mouseDown = true;

    const x = Math.round(evt.offsetX / ms.getCellSize());
    const y = Math.round(evt.offsetY / ms.getCellSize());
    const map = ms.getMap();
    last = `${x},${y}`;

    const newValue = map.getBinary(x, y) ? 0 : 1;
    // map.set(x, y, newValue);
    mode = newValue;

    map.getRadius(x, y, drawSize).forEach(pt => {
        map.set(pt[0], pt[1], mode);
    });

    ms.print(output.getContext());
});
canvas.addEventListener('mouseup', () => {
    mouseDown = false;
});
canvas.addEventListener('mouseout', () => {
    mouseDown = false;
});

canvas.addEventListener('mousemove', (evt) => {
    if (!mouseDown) { return; }
    const x = Math.round(evt.offsetX / ms.getCellSize());
    const y = Math.round(evt.offsetY / ms.getCellSize());
    if (last === `${x},${y}`) { return; }

    const map = ms.getMap();
    map.getRadius(x, y, drawSize).forEach(pt => {
        map.set(pt[0], pt[1], mode);
    });
    last = `${x},${y}`;

    ms.print(output.getContext());
});

document.body.addEventListener('wheel', evt => {
    drawSize += evt.deltaY > 0 ? 1 : -1;
    drawSize = Math.min(Math.max(drawSize, 0), 5);

    console.log(drawSize);
});
