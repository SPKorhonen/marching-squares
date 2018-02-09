import TileMap, { MarchableSpace } from './Map';
import QuadTree, { Rect } from './QuadTree';
import { Renderer } from './main';
import { CanvasPrintable } from './canvas-printable';
import VCR from './vcr';

export default class Grid implements CanvasPrintable {

    private renderer: Renderer;

    constructor(
        private CELL_SIZE: number = 20,
        private GRID_SIZE: number = 25,
        private map: MarchableSpace
    ) {
        const size = this.CELL_SIZE * this.GRID_SIZE;
        this.renderer = new VCR(size, size);
    }

    print(toContext: CanvasRenderingContext2D, viewport: Rect, points: number[][] = []) {
        if (points.length) {
            const mapContext = this.renderer.getContext();
            mapContext.clearRect(0, 0, mapContext.canvas.width, mapContext.canvas.height);
            mapContext.fillStyle = `rgba(255, 0, 0, 0.2)`;
            let coords: number[];
            let x: number;
            let y: number;
            let value: number;

            for (let i = points.length - 1; i >= 0; i -= 1) {
                coords = points[i];
                if (!viewport.contains(coords)) {
                    continue;
                }

                x = coords[0];
                y = coords[1];
                value = this.map.get(x, y);

                if (value >= 1) {
                    this.drawSquare(mapContext, x, y);
                } else {
                    mapContext.clearRect(
                        x * this.CELL_SIZE,
                        y * this.CELL_SIZE,
                        this.CELL_SIZE,
                        this.CELL_SIZE
                    );
                }
            }
        }

        toContext.drawImage(this.renderer.getCanvas(), -viewport.xMin, -viewport.yMin);
    }

    private drawSquare(context: CanvasRenderingContext2D, x: number, y: number) {
        context.clearRect(x * this.CELL_SIZE, y * this.CELL_SIZE, this.CELL_SIZE, this.CELL_SIZE);
        context.fillRect(x * this.CELL_SIZE, y * this.CELL_SIZE, this.CELL_SIZE, this.CELL_SIZE);
    }

    private getMapPoints(xStart: number = 0, yStart: number = 0, xMax?: number, yMax?: number): number[][] {
        const points = [];
        xMax = xMax || this.GRID_SIZE;
        yMax = yMax || this.GRID_SIZE;

        for (let x = xStart - 1; x < xMax + 1; x += 1) {
            for (let y = yStart - 1; y < yMax + 1; y += 1) {
                points.push([x, y]);
            }
        }
        return points;
    }
}
