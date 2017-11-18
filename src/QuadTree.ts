import { MarchableSpace } from './Map';
import { tempdir } from 'shelljs';
declare var Object: any;

export class Rect {
    constructor(public xMin, public xMax, public yMin, public yMax) { }

    public getCenter(): number[] {
        return [(this.xMax - this.xMin) / 2, (this.yMax - this.yMin) / 2];
    }
}

export default class QuadTree implements MarchableSpace {
    static MAX_KIDS: number = 4;

    private northWest: QuadTree;
    private northEast: QuadTree;
    private southEast: QuadTree;
    private southWest: QuadTree;

    private data: any;
    private numPoints: number;

    constructor(private dimensions: Rect) {
        this.northWest = null;
        this.northEast = null;
        this.southEast = null;
        this.southWest = null;

        this.data = {};
        this.numPoints = 0;
    }

    public set(x: number, y: number, val: number): void {
        if (val > 0) {
            return this.add(x, y, val);
        } else {
            return this.remove(x, y);
        }
    }

    public get(x: number, y: number): number {
        if (this.numPoints === 0 && this.northWest) {
            const center = this.dimensions.getCenter();
            const dir = `${y < center[1] ? 'north' : 'south'}${x < center[0] ? 'West' : 'East'}`;
            return this[dir].get(x, y);
        } else if (this.numPoints > 0) {
            const destPt = `${x},${y}`;
            return this.data[destPt] || 0;
        }

        return 0;
    }

    public getBinary(x: number, y: number, threshold: number): number {
        return this.get(x, y);
    }

    add(x: number, y: number, val: number) {
        if (this.northWest) {
            const center = this.dimensions.getCenter();
            const dir = `${y < center[1] ? 'north' : 'south'}${x < center[0] ? 'West' : 'East'}`;

            this[dir].add(x, y, val);
        } else {
            this.data[`${x},${y}`] = val;
            this.numPoints = Object.keys(this.data).length;

            if (this.numPoints > QuadTree.MAX_KIDS) {
                // this.split();
            }
        }
    }

    remove(x: number, y: number) {
        if (this.northWest) {
            const center = this.dimensions.getCenter();
            const dir = `${y < center[1] ? 'north' : 'south'}${x < center[0] ? 'West' : 'East'}`;
            this[dir].remove(x, y);
        } else {
            const key = `${x},${y}`;
            if (!this.data.hasOwnProperty(key)) {
                return;
            }

            delete this.data[`${x},${y}`];
            this.numPoints -= 1;
        }
    }

    split() {
        this.numPoints = 0;

        const { xMin, xMax, yMin, yMax } = this.dimensions;
        this.northWest = new QuadTree(
            new Rect(xMin, xMax / 2, yMin, yMax / 2)
        );
        this.northEast = new QuadTree(
            new Rect(xMax / 2, xMax, yMin, yMax / 2)
        );
        this.southEast = new QuadTree(
            new Rect(xMax / 2, xMax, yMax / 2, yMax)
        );
        this.southWest = new QuadTree(
            new Rect(xMin, xMax / 2, yMax / 2, yMax)
        );

        const center = this.dimensions.getCenter();
        for (const ptKey in this.data) {
            const point = ptKey.split(',').map(parseFloat);
            const x = point[0];
            const y = point[1];
            const dir = `${y < center[1] ? 'north' : 'south'}${x < center[0] ? 'West' : 'East'}`;
            this[dir].add(x, y, this.data[ptKey]);
            delete this.data[ptKey];
        }

        this.data = {};
    }

    public flush() {
        if (this.numPoints) {
            const returned = [];
            for (let strPoint in this.data) {
                const point = strPoint.split(',').map(parseFloat);
                returned.push([point[0], point[1], this.data[strPoint]]);
            }
            return returned;
        } else if (this.northWest) {
            return [].concat(
                this.northWest.flush(),
                this.northEast.flush(),
                this.southEast.flush(),
                this.southWest.flush(),
            );
        }

        return [];
    }
}