import Emitter from './emitter';
import { MarchableSpace } from './Map';
import { CanvasPrintable } from './canvas-printable';
import { getRadiusCoords } from './coord-utils';

declare var Object: any;

export class Rect {
    public xMin: number;
    public yMin: number;
    public xMax: number;
    public yMax: number;

    constructor(public xPoint: number, public yPoint: number, public width: number, public height: number) {
        this.yMin = yPoint;
        this.xMin = xPoint;
        this.xMax = xPoint + width;
        this.yMax = yPoint + height;
        // const width = this.xMax - this.xMin;
        // const height = this.yMax - this.yMin;
        // console.log('new rect', width, height, '-', this.xMin, this.xMax, this.yMin, this.yMax);
    }

    public getCenter(): number[] {
        return [this.xMin + (this.width / 2), this.yPoint + (this.height / 2)];
    }

    public contains(point: number[]): boolean {
        const x = point[0];
        const y = point[1];

        return (x >= this.xMin && x <= this.xMax && y >= this.yPoint && y <= this.yMax);
    }
}

function debounce(func: Function, wait: number, immediate: boolean = true): () => void {
    var timeout;
    return function () {
        const later = function () {
            timeout = null;
            if (!immediate) func();
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func();
    };
};

export default class QuadTree extends Emitter implements MarchableSpace, CanvasPrintable {
    private northWest: QuadTree;
    private northEast: QuadTree;
    private southEast: QuadTree;
    private southWest: QuadTree;

    private isDivided: boolean = false;

    private data: { [point: string]: number } = {};
    protected dirty: { [point: string]: any } = {};

    constructor(private region: Rect, private parent?: QuadTree) {
        super();
        this.unsplit = debounce(this.unsplit.bind(this), 25);
    }

    static getDirection(x: number, y: number, region: Rect): string {
        const northSouth = y < region.yMin + (region.height / 2) ? 'north' : 'south';
        const eastWest = x < region.xMin + (region.width / 2) ? 'West' : 'East';
        const dir = `${northSouth}${eastWest}`;
        return dir;
    }

    getNeighboringPoints(x: number, y: number): number[][] {
        if (x < this.region.xMin || x > this.region.xMax || y < this.region.yMin || y > this.region.yMax) {
            return [];
        }

        return getRadiusCoords(x, y, 3);

        // if (this.isDivided) {
        //     const dir = QuadTree.getDirection(x, y, this.region);
        //     return this[dir].getNeighboringPoints(x, y);
        // }

        // return Object.keys(this.data).map(x => x.split(',').map(parseFloat));
    }

    get(x: number, y: number): number {
        if (x < this.region.xMin || x > this.region.xMax || y < this.region.yMin || y > this.region.yMax) {
            return 1;
        }

        if (this.isDivided) {
            const dir = QuadTree.getDirection(x, y, this.region);

            return this[dir].get(x, y);
        }

        return this.data[`${x},${y}`] || 0;
    }
    getBinary(x: number, y: number): number {
        return this.get(x, y) >= 1 ? 1 : 0;
    }
    set(x: number, y: number, data: any, sendUpdate: boolean = true) {
        if (this.isDivided) {
            const dir = QuadTree.getDirection(x, y, this.region);
            return this[dir].set(x, y, data, sendUpdate);
        }

        const numPoints = Object.keys(this.data).length - 1;
        const nextWidth = this.region.width / 2;
        const nextHeight = this.region.height / 2;

        if (numPoints + 1 > 4 && (nextWidth >= 1 && nextHeight >= 1)) {
            this.split();
            // at this point we should now be 'divided' so calling 'set'
            // will simply pass it through to the proper region
            return this.set(x, y, data, sendUpdate);
        } else {
            this.dirty[`${x},${y}`] = data;
            if (data === 0) {
                delete this.data[`${x},${y}`];
                if (this.parent) {
                    this.parent.unsplit();
                }
            } else {
                this.data[`${x},${y}`] = data;
            }

            if (sendUpdate) {
                this.emit('update', [x, y]);
            }
        }

    }

    unsplit() {
        console.log('unsplit');
        if (this.isDivided) {
            const count = this.getCount();
            if (count <= 4) {
                const data = this.flush(true);
                this.isDivided = false;
                this.northEast = null;
                this.northWest = null;
                this.southEast = null;
                this.southWest = null;

                data.forEach(pt => {
                    this.set(pt[0], pt[1], 1, false);
                });
            }
        }
    }

    getCount() {
        let num = Object.keys(this.data).length;
        if (this.isDivided) {
            num += this.northEast.getCount();
            num += this.northWest.getCount();
            num += this.southEast.getCount();
            num += this.southWest.getCount();
        }

        return num;
    }

    split() {
        const halfWidth = this.region.width / 2;
        const halfHeight = this.region.height / 2;

        this.northWest = new QuadTree(
            new Rect(this.region.xPoint, this.region.yPoint, halfWidth, halfHeight),
            this
        );
        this.northEast = new QuadTree(
            new Rect(this.region.xPoint + halfWidth, this.region.yPoint, halfWidth, halfHeight),
            this
        );

        this.southEast = new QuadTree(
            new Rect(this.region.xPoint + halfWidth, this.region.yPoint + halfHeight, halfWidth, halfHeight),
            this
        );
        this.southWest = new QuadTree(
            new Rect(this.region.xPoint, this.region.yPoint + halfHeight, halfWidth, halfHeight),
            this
        );

        this.isDivided = true;

        for (const ptString in this.data) {
            const point = ptString.split(',').map(parseFloat);
            const x = point[0];
            const y = point[1];
            const dir = QuadTree.getDirection(x, y, this.region);

            // console.log('adsf', dir, this[dir]);
            this[dir].set(x, y, this.data[ptString], false);
        }

        this.data = {};
    }

    flush(getAll: boolean = false): number[][] {
        let flushed = [];
        if (this.isDivided) {
            flushed = flushed.concat(
                this.northWest.flush(),
                this.northEast.flush(),
                this.southEast.flush(),
                this.southWest.flush()
            );
        } else {
            const data = getAll ? this.data : this.dirty;
            for (const ptString in data) {
                const point = ptString.split(',').map(parseFloat);
                flushed.push(point);
            }
            if (!getAll) {
                this.dirty = {};
            }
        }

        return flushed;
    }

    print(toContext: CanvasRenderingContext2D) {
        // return;
        if (this.isDivided) {
            this.northWest.print(toContext);
            this.northEast.print(toContext);
            this.southEast.print(toContext);
            this.southWest.print(toContext);
        } else {
            toContext.beginPath();
            toContext.strokeStyle = 'purple';
            toContext.strokeRect(this.region.xMin * 15, this.region.yMin * 15, this.region.width * 15, this.region.height * 15);
            toContext.closePath();
        }
    }
}
