import Map from './Map';
import { Renderer } from './main';

export default class MarchingSquares {
    static lookup(code, x, y) {
        switch (code) {
            case '0000':
                return [];

            case '0010':
                return [
                    [x, y + 0.5],
                    [x + 0.5, y + 1],
                ];

            case '0001':
                return [
                    [x + 0.5, y + 1],
                    [x + 1, y + 0.5],
                ];

            case '0011':
                return [
                    [x, y + 0.5],
                    [x + 1, y + 0.5],
                ];

            case '0100':
                return [
                    [x + 0.5, y],
                    [x + 1, y + 0.5],
                ];

            case '0110':
                return [
                    [x, y + 0.5],
                    [x + 0.5, y],

                    [x + 0.5, y + 1],
                    [x + 1, y + 0.5],
                ];

            case '0101':
                return [
                    [x + 0.5, y],
                    [x + 0.5, y + 1],
                ];

            case '0111':
                return [
                    [x, y + 0.5],
                    [x + 0.5, y],
                ];

            case '1000':
                return [
                    [x, y + 0.5],
                    [x + 0.5, y],
                ];

            case '1010':
                return [
                    [x + 0.5, y],
                    [x + 0.5, y + 1],
                ];

            case '1001':
                return [
                    [x + 0.5, y],
                    [x + 1, y + 0.5],

                    [x, y + 0.5],
                    [x + 0.5, y + 1],
                ];

            case '1011':
                return [
                    [x + 0.5, y],
                    [x + 1, y + 0.5],
                ];

            case '1100':
                return [
                    [x, y + 0.5],
                    [x + 1, y + 0.5],
                ];

            case '1110':
                return [
                    [x + 0.5, y + 1],
                    [x + 1, y + 0.5],
                ];

            case '1101':
                return [
                    [x, y + 0.5],
                    [x + 0.5, y + 1]
                ];

            case '1111':
                return [];

            default:
                return [];
        }
    }

    private map: Map;

    constructor(
        private CELL_SIZE: number = 20,
        private GRID_SIZE: number = 25,
        private renderer: Renderer,
    ) {
        this.generateMap();
    }

    static dist(point1: any, point2: any) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    public getCellSize(): number {
        return this.CELL_SIZE;
    }

    public getGridSize(): number {
        return this.GRID_SIZE;
    }

    public getMap(): Map {
        return this.map;
    }

    private generateMap() {
        const mapInner: number[][] = [];
        const halfPoint: number = Math.floor(this.GRID_SIZE / 2);
        this.map = new Map([]);

        for (let i = 0; i < this.GRID_SIZE; i += 1) {
            mapInner[i] = [];
            for (let j = 0; j < this.GRID_SIZE; j += 1) {
                // mapInner[i][j] = MarchingSquares.dist({ x: halfPoint, y: halfPoint }, { x: i, y: j}) / 3;// Math.random() > 0.8 ? 1 : 0;
                this.map.set(i, j, Math.random() > 0.8 ? 1 : 0);
                // mapInner[i][j] = Math.random() > 0.8 ? 1 : 0;
            }
        }

    }

    public printMap(points: any[]) {
        const mapContext = this.renderer.getContext('map');
        mapContext.fillStyle = `rgba(255, 0, 0, 0.2)`;

        const active = [];
        const inactive = [];

        points.forEach(coords => {
            const x = coords[0];
            const y = coords[1];
            const value = this.map.get(x, y);

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
        });
    }

    print(toContext: CanvasRenderingContext2D, force: boolean = false) {
        if (typeof toContext !== 'undefined') {
            toContext.clearRect(0, 0, this.getCellSize() * this.getGridSize(), this.getCellSize() * this.getGridSize());
        }

        let updatedPoints = this.map.flush();
        this.printMap(updatedPoints);

        if (force && updatedPoints.length === 0) {
            updatedPoints = this.getAllMapPoints();
        } else if (updatedPoints.length < Math.pow(this.getGridSize(), 2)) {
            let actualPoints = [];
            updatedPoints.forEach(pt => {
                actualPoints = actualPoints.concat(this.map.getRadius(pt[0] - 1, pt[1] - 1, 2));
            });
            updatedPoints = actualPoints;
        }

        const found = {};
        updatedPoints = updatedPoints.filter(pt => {
            const key = `${pt[0]},${pt[1]}`;
            if (!found[key]) {
                found[key] = true;
                return true;
            }

            return false;
        });

        if (updatedPoints.length) {
            this.printBoundary(updatedPoints, 1);
        }

        toContext.drawImage(this.renderer.getCanvas('map'), 0, 0);
        toContext.drawImage(this.renderer.getCanvas('boundary'), 0, 0);
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
        for (let x = -1; x < this.GRID_SIZE + 1; x += 1) {
            for (let y = -1; y < this.GRID_SIZE + 1; y += 1) {
                points.push([x, y]);
            }
        }
        return points;
    }

    public printBoundary(inputPoints: any[], threshold: number = 1) {
        const boundaryCtx = this.renderer.getContext('boundary');
        // boundaryCtx.clearRect(
        //     0, 0, (this.GRID_SIZE + 1) * this.CELL_SIZE, (this.GRID_SIZE + 1) * this.CELL_SIZE
        // );

        let actions = [];
        boundaryCtx.strokeStyle = 'blue';
        boundaryCtx.fillStyle = 'rgba(0, 0, 255, 0.1)';
        boundaryCtx.beginPath();

        let points = inputPoints;
        // boundaryCtx.clearRect(x * this.CELL_SIZE, y * this.CELL_SIZE, this.CELL_SIZE, this.CELL_SIZE);

        // this.map.flush().forEach(coords => { // - but it's already been flushed??
        points.forEach(coords => {
            const x = coords[0];
            const y = coords[1];
            const set = this.getFourCorners(x, y, threshold).join('');
            const act = MarchingSquares.lookup(set, x, y);

            boundaryCtx.clearRect((x + 0.5) * this.CELL_SIZE, (y + 0.5) * this.CELL_SIZE, this.CELL_SIZE + 0.5, this.CELL_SIZE + 0.5);
            for (let i = 0; i < act.length; i += 2) {
                const start = act[i].map(z => (z + 0.5) * this.CELL_SIZE);
                const end = act[i + 1].map(z => (z + 0.5) * this.CELL_SIZE);

                // boundaryCtx.fillRect(start[0], end[1], this.CELL_SIZE, this.CELL_SIZE);
                boundaryCtx.moveTo(start[0], start[1]);
                boundaryCtx.lineTo(end[0], end[1]);
            }
        });

        boundaryCtx.stroke();
        boundaryCtx.closePath();
    }
}
