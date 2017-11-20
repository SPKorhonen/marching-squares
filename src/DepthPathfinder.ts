import { CanvasPrintable } from './canvas-printable';
import Emitter from './emitter';
import VCR from './vcr';
import MarchingSquares from './marching-squares';

export class DepthPathfinder extends Emitter implements CanvasPrintable {
    visited: Set<string> = new Set();
    private vcr: VCR;
    private context: CanvasRenderingContext2D;

    constructor(private ms: MarchingSquares) {
        super();
        const size = ms.getGridSize() * ms.getCellSize();
        this.vcr = new VCR(size, size);
        this.context = this.vcr.getContext();
    }

    visit(coords: number[]) {
        const cellSize = this.ms.getCellSize();
        this.visited.add(coords.join(','));
        // this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.fillStyle = 'red';
        this.context.fillRect(coords[0] * cellSize, coords[1] * cellSize, cellSize, cellSize);
        this.emit('update');
    }

    hasVisited(coords: number[]): boolean {
        return this.visited.has(coords.join(','));
    }

    async search(start: number[], end: number[]) {
        const path = await this.depthFirstSearch(end, [start])

        if (path) {
            const cellSize = this.ms.getCellSize();
            this.context.fillStyle = 'rgba(0,255,0,0.5)';
            path.forEach(pt => {
                this.context.fillRect(pt[0] * cellSize, pt[1] * cellSize, cellSize, cellSize);
            });

            this.emit('update');
        }
    }

    async depthFirstSearch(needle: number[], path: number[][]) {
        const cellSize = this.ms.getCellSize();
        const ctx = this.vcr.getContext('goal');
        ctx.fillStyle = 'green';
        ctx.fillRect(needle[0] * cellSize, needle[1] * cellSize, cellSize, cellSize);
        const last = path[path.length - 1];
        this.visit(last);
        const map = this.ms.getMap();
        const x = last[0];
        const y = last[1];

        const neighbors = [
            [x - 1, y],
            // [x - 1, y - 1],
            [x, y - 1],
            // [x + 1, y - 1],
            [x + 1, y],
            // [x + 1, y + 1],
            [x, y + 1],
            // [x - 1, y + 1],
        ];

        for (let i = neighbors.length - 1; i >= 0; i -= 1) {
            await new Promise(res => setTimeout(res, 50));

            if (this.hasVisited(neighbors[i])) {
                continue;
            }

            if (neighbors[i].join(',') === needle.join(',')) {
                return path.concat([neighbors[i]]);
            }

            if (map.getBinary(neighbors[i][0], neighbors[i][1], 1) === 0) {
                const found = await this.depthFirstSearch(needle, path.concat([neighbors[i]]));

                if (found) {
                    return found;
                }
            }
        }

        return null;
    }

    print(toContext: CanvasRenderingContext2D) {
        toContext.drawImage(this.vcr.getCanvas(), 0, 0);
        toContext.drawImage(this.vcr.getCanvas('goal'), 0, 0);
    }
}