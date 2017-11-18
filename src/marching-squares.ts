import TileMap, { MarchableSpace } from './Map';
import QuadTree, { Rect } from './QuadTree';
import { Renderer } from './main';
import { getRadiusCoords } from './coord-utils';
import { CanvasPrintable } from './canvas-printable';

export default class MarchingSquares implements CanvasPrintable {
    static lookupCache = {};
    static lookup(code, x, y) {
        const key = `${code},${x},${y}`;
        if (MarchingSquares.lookupCache[key]) {
            return MarchingSquares.lookupCache[key];
        }

        let val = [];
        switch (code) {
            case '0000':
                val = [];

                break;
            case '0010':
                val = [
                    [x, y + 0.5],
                    [x + 0.5, y + 1],
                ];

                break;
            case '0001':
                val = [
                    [x + 0.5, y + 1],
                    [x + 1, y + 0.5],
                ];

                break;
            case '0011':
                val = [
                    [x, y + 0.5],
                    [x + 1, y + 0.5],
                ];

                break;
            case '0100':
                val = [
                    [x + 0.5, y],
                    [x + 1, y + 0.5],
                ];

                break;
            case '0110':
                val = [
                    [x, y + 0.5],
                    [x + 0.5, y],

                    [x + 0.5, y + 1],
                    [x + 1, y + 0.5],
                ];

                break;
            case '0101':
                val = [
                    [x + 0.5, y],
                    [x + 0.5, y + 1],
                ];

                break;
            case '0111':
                val = [
                    [x, y + 0.5],
                    [x + 0.5, y],
                ];

                break;
            case '1000':
                val = [
                    [x, y + 0.5],
                    [x + 0.5, y],
                ];

                break;
            case '1010':
                val = [
                    [x + 0.5, y],
                    [x + 0.5, y + 1],
                ];

                break;
            case '1001':
                val = [
                    [x + 0.5, y],
                    [x + 1, y + 0.5],

                    [x, y + 0.5],
                    [x + 0.5, y + 1],
                ];

                break;
            case '1011':
                val = [
                    [x + 0.5, y],
                    [x + 1, y + 0.5],
                ];

                break;
            case '1100':
                val = [
                    [x, y + 0.5],
                    [x + 1, y + 0.5],
                ];

                break;
            case '1110':
                val = [
                    [x + 0.5, y + 1],
                    [x + 1, y + 0.5],
                ];

                break;
            case '1101':
                val = [
                    [x, y + 0.5],
                    [x + 0.5, y + 1]
                ];

                break;
            case '1111':
                val = [];

            default:
                val = [];
        }

        MarchingSquares.lookupCache[key] = val;
        return val;
    }

    private map: MarchableSpace;

    constructor(
        public renderer: Renderer,
        private CELL_SIZE: number = 20,
        private GRID_SIZE: number = 25,
    ) {
        this.generateMap();
        // this.getAllMapPoints().forEach(pt => {
        //     getRadiusCoords(pt[0], pt[1], 1);
        //     getRadiusCoords(pt[0], pt[1], 2);
        //     getRadiusCoords(pt[0], pt[1], 3);
        //     getRadiusCoords(pt[0], pt[1], 4);
        //     getRadiusCoords(pt[0], pt[1], 5);
        // });
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
        // this.map = new QuadTree(new Rect(0, this.GRID_SIZE, 0, this.GRID_SIZE));
        this.map = new TileMap([]);

        let val: 0 | 1;
        for (let i = this.GRID_SIZE - 1; i >= 0; i -= 1) {
            for (let j = 0; j < this.GRID_SIZE; j += 1) {
                val = Math.random() > 0.8 ? 1 : 0;
                // the map defaults to 0s, so we only need to set the active cells
                if (val) {
                    this.map.set(i, j, val);
                }
            }
        }

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
        if (typeof toContext !== 'undefined') {
            toContext.clearRect(0, 0, this.getCellSize() * this.getGridSize(), this.getCellSize() * this.getGridSize());
        }

        let updatedPoints = this.map.flush();

        if (force && updatedPoints.length === 0) {
            updatedPoints = this.getAllMapPoints();
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
    drawSquare(context: CanvasRenderingContext2D, x, y) {
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

    private getAllMapPoints(): number[][] {
        const points = [];
        for (let x = 0; x < this.GRID_SIZE + 1; x += 1) {
            for (let y = 0; y < this.GRID_SIZE + 1; y += 1) {
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

                if (!viewport.contains(start) && !viewport.contains(end)) {
                    continue;
                }

                boundaryCtx.moveTo(start[0], start[1]);
                boundaryCtx.lineTo(end[0], end[1]);
            }
        }

        boundaryCtx.stroke();
        boundaryCtx.closePath();
    }
}
