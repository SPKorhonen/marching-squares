import TileMap, { MarchableSpace } from './Map';
import QuadTree, { Rect } from './QuadTree';
import { Renderer } from './main';
import { getRadiusCoords } from './coord-utils';
import { CanvasPrintable } from './canvas-printable';

const msLookupTable = {
    '0000': [],
    '0010': [
        [0, 0.5],
        [0.5, 1],
    ],
    '0001': [
        [0.5, 1],
        [1, 0.5],
    ],
    '0011': [
        [0, 0.5],
        [1, 0.5],
    ],
    '0100': [
        [0.5, 0],
        [1, 0.5],
    ],
    '0110': [
        [0, 0.5],
        [0.5, 0],

        [0.5, 1],
        [1, 0.5],
    ],
    '0101': [
        [0.5, 0],
        [0.5, 1],
    ],
    '0111': [
        [0, 0.5],
        [0.5, 0],
    ],
    '1000': [
        [0, 0.5],
        [0.5, 0],
    ],
    '1010': [
        [0.5, 0],
        [0.5, 1],
    ],
    '1001': [
        [0.5, 0],
        [1, 0.5],

        [0, 0.5],
        [0.5, 1],
    ],
    '1011': [
        [0.5, 0],
        [1, 0.5],
    ],
    '1100': [
        [0, 0.5],
        [1, 0.5],
    ],
    '1110': [
        [0.5, 1],
        [1, 0.5],
    ],
    '1101': [
        [0, 0.5],
        [0.5, 1]
    ],
    '1111': [],
};

export default class MarchingSquares implements CanvasPrintable {
    static lookupTable = msLookupTable;
    static lookup(code, x, y): number[][] {
        let transforms = MarchingSquares.lookupTable[code];
        // these variable names are awful
        transforms = transforms.map(i => i.map((j, idx) => j + (idx % 2 === 0 ? x : y)));

        return transforms;
    }

    private map: MarchableSpace;

    constructor(
        public renderer: Renderer,
        private CELL_SIZE: number = 20,
        private GRID_SIZE: number = 25,
    ) {
        this.generateMap();
    }

    static dedupe(array: number[][]) {
        const found = {};
        let newArray = [];
        let key;
        let pt;

        for (let i = array.length - 1; i >= 0; i -= 1) {
            pt = array[i];
            key = `${pt[0]},${pt[1]}`;
            if (!found[key]) {
                found[key] = true;
                newArray.unshift(pt);
            }
        }

        return newArray;
    }

    public getCellSize(): number {
        return this.CELL_SIZE;
    }

    public getGridSize(): number {
        return this.GRID_SIZE;
    }

    public getMap(): MarchableSpace {
        return this.map;
    }

    public getRenderer(): CanvasPrintable {
        return (this.map instanceof QuadTree ? this.map : null);
    }

    private generateMap() {
        this.map = new QuadTree(new Rect(0, this.GRID_SIZE, 0, this.GRID_SIZE));
        // this.map = new TileMap([]);

        // let val: 0 | 1;
        // for (let i = this.GRID_SIZE + 1; i >= -1; i -= 1) {
        //     for (let j = this.GRID_SIZE + 1; j >= -1; j -= 1) {
        //         val = Math.random() > 0.8 ? 1 : 0;
        //         // the map defaults to 0s, so we only need to set the active cells
        //         if (val) {
        //             this.map.set(i, j, val);
        //         }
        //     }
        // }

    }

    public printMap(points: any[], viewport: Rect) {
        const mapContext = this.renderer.getContext('map');
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

    print(toContext: CanvasRenderingContext2D, viewport: Rect, force: boolean = false) {
        // const dims = toContext.canvas.width * toContext.canvas.height;
        // toContext.clearRect(0, 0, dims, dims);

        let updatedPoints = this.map.flush();

        if (force && updatedPoints.length === 0) {
            const cellSize = this.getCellSize();
            const topLeft = [viewport.xMin % cellSize, viewport.yMin % cellSize];
            const bottomRight = [viewport.xMax % cellSize, viewport.yMax % cellSize];

            updatedPoints = this.getMapPoints(topLeft[0], topLeft[1], bottomRight[0], bottomRight[1]);
        } else if (updatedPoints.length > 0 && updatedPoints.length < Math.pow(this.getGridSize(), 2)) {
            let actualPoints = [];
            let pt;
            for (let i = updatedPoints.length - 1; i >= 0; i -= 1) {
                pt = updatedPoints[i];
                actualPoints = actualPoints.concat(getRadiusCoords(pt[0] - 1, pt[1] - 1, 2));
            }
            updatedPoints = actualPoints;
        }

        updatedPoints = MarchingSquares.dedupe(updatedPoints);

        if (updatedPoints.length) {
            this.printMap(updatedPoints, viewport);
            this.printBoundary(updatedPoints, viewport, 1);
        }

        toContext.drawImage(this.renderer.getCanvas('map'), -viewport.xMin, -viewport.yMin);
        toContext.drawImage(this.renderer.getCanvas('boundary'), -viewport.xMin, -viewport.yMin);
    }

    drawSquare(context: CanvasRenderingContext2D, ...points: number[]);
    drawSquare(context: CanvasRenderingContext2D, x: number, y: number) {
        context.clearRect(x * this.CELL_SIZE, y * this.CELL_SIZE, this.CELL_SIZE, this.CELL_SIZE);
        context.fillRect(x * this.CELL_SIZE, y * this.CELL_SIZE, this.CELL_SIZE, this.CELL_SIZE);
    }

    getFourCorners(x: number, y: number, threshold: number) {
        return [
            this.map.getBinary(x, y, threshold),
            this.map.getBinary(x + 1, y, threshold),
            this.map.getBinary(x, y + 1, threshold),
            this.map.getBinary(x + 1, y + 1, threshold)
        ];
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

    public printBoundary(points: number[][], viewport: Rect, threshold: number = 1) {
        const boundaryCtx = this.renderer.getContext('boundary');
        // boundaryCtx.clearRect(
        //     0, 0, (this.GRID_SIZE + 1) * this.CELL_SIZE, (this.GRID_SIZE + 1) * this.CELL_SIZE
        // );

        // boundaryCtx.strokeStyle = 'black';
        boundaryCtx.lineWidth = (0.067073 * this.CELL_SIZE) + 0.530488;
        // boundaryCtx.fillStyle = 'rgba(0, 0, 255, 0.1)';
        boundaryCtx.beginPath();

        let coords: number[];
        let x: number;
        let y: number;
        let cornersCode: string;
        let act: number[][];

        for (let i = points.length - 1; i >= 0; i -= 1) {
            coords = points[i];
            x = coords[0];
            y = coords[1];
            cornersCode = this.getFourCorners(x, y, threshold).join('');
            act = MarchingSquares.lookup(cornersCode, x, y);

            boundaryCtx.clearRect((x + 0.5) * this.CELL_SIZE, (y + 0.5) * this.CELL_SIZE, this.CELL_SIZE + 0.5, this.CELL_SIZE + 0.5);

            for (let i = act.length - 1; i >= 0; i -= 2) {
                const start = act[i - 1].map(z => (z + 0.5) * this.CELL_SIZE);
                const end = act[i].map(z => (z + 0.5) * this.CELL_SIZE);

                if (viewport.contains(start) || viewport.contains(end)) {
                    boundaryCtx.moveTo(start[0], start[1]);
                    boundaryCtx.lineTo(end[0], end[1]);
                }
            }
        }

        boundaryCtx.stroke();
        boundaryCtx.closePath();
    }
}
