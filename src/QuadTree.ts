import Emitter from './emitter';
import { MarchableSpace } from './Map';
import { CanvasPrintable } from './canvas-printable';

declare var Object: any;

export class Rect {
    constructor(public xMin, public xMax, public yMin, public yMax) {
        // const width = this.xMax - this.xMin;
        // const height = this.yMax - this.yMin;
        // console.log('new rect', width, height, '-', this.xMin, this.xMax, this.yMin, this.yMax);
    }

    public getCenter(): number[] {
        return [(this.xMax - this.xMin) / 2, (this.yMax - this.yMin) / 2];
    }

    public contains(point: number[]): boolean {
        const x = point[0];
        const y = point[1];

        return (x >= this.xMin && x <= this.xMax && y >= this.yMin && y <= this.yMax);
    }
}

export default class QuadTree extends Emitter implements MarchableSpace, CanvasPrintable {
    private northWest: QuadTree;
    private northEast: QuadTree;
    private southEast: QuadTree;
    private southWest: QuadTree;

    private isDivided: boolean = false;

    private data: { [point: string]: any } = {};

    constructor(private region: Rect) {
        super();
    }

    get(x: number, y: number): number {
        if (x < this.region.xMin || x > this.region.xMax || y < this.region.yMin || y > this.region.yMax) {
            return 1;
        }

        if (this.isDivided) {
            const northSouth = y < this.region.yMax / 2 ? 'north' : 'south';
            const eastWest = x < this.region.xMax / 2 ? 'West' : 'East';
            const dir = `${northSouth}${eastWest}`;

            return this[dir].get(x, y);
        }

        return this.data[`${x},${y}`] || 0;
    }
    getBinary(x: number, y: number): number {
        return this.get(x, y) >= 1 ? 1 : 0;
    }
    set(x: number, y: number, data: any, sendUpdate: boolean = true) {
        if (this.isDivided) {
            const northSouth = y < this.region.yMax / 2 ? 'north' : 'south';
            const eastWest = x < this.region.xMax / 2 ? 'West' : 'East';
            const dir = `${northSouth}${eastWest}`;

            return this[dir].set(x, y, data, sendUpdate);
        }

        const numPoints = Object.keys(this.data).length - 1;
        const nextWidth = Math.abs((this.region.xMax - this.region.xMin)) / 2;
        const nextHeight = Math.abs((this.region.yMax - this.region.yMin)) / 2;
        if (numPoints + 1 > 4 && (nextWidth >= 2 && nextHeight >= 2)) {
            this.split();
            // at this point we should now be 'divided' so calling 'set'
            // will simply pass it through to the proper region
            return this.set(x, y, data, sendUpdate);
        } else {
            this.data[`${x},${y}`] = data;
            if (sendUpdate) {
                this.emit('update', [x, y]);
            }
        }

    }

    split() {
        this.northWest = new QuadTree(
            new Rect(
                this.region.xMin,
                (this.region.xMax / 2),
                this.region.yMin,
                (this.region.yMax / 2)
            )
        );
        this.northEast = new QuadTree(
            new Rect(
                this.region.xMax / 2,
                this.region.xMax,
                this.region.yMin,
                (this.region.yMax / 2)
            )
        );
        this.southEast = new QuadTree(
            new Rect(
                this.region.xMax / 2,
                this.region.xMax,
                this.region.yMax / 2,
                this.region.yMax
            )
        );
        this.southWest = new QuadTree(
            new Rect(
                this.region.xMin,
                this.region.xMax / 2,
                this.region.yMax / 2,
                this.region.yMax
            )
        );
        this.isDivided = true;

        for (const ptString in this.data) {
            const point = ptString.split(',').map(parseFloat);
            const x = point[0];
            const y = point[1];
            const northSouth = y < this.region.yMax / 2 ? 'north' : 'south';
            const eastWest = x < this.region.xMax / 2 ? 'West' : 'East';
            const dir = `${northSouth}${eastWest}`;

            // console.log('adsf', dir, this[dir]);
            this[dir].set(x, y, this.data[ptString], false);
        }

        this.data = {};
    }

    flush(): number[][] {
        let flushed = [];
        if (this.isDivided) {
            flushed = flushed.concat(
                this.northWest.flush(),
                this.northEast.flush(),
                this.southEast.flush(),
                this.southWest.flush()
            );
        } else {
            for (const ptString in this.data) {
                const point = ptString.split(',').map(parseFloat);
                flushed.push(point);
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
            const width = this.region.xMax - this.region.xMin;
            const height = this.region.yMax - this.region.yMin;
            toContext.strokeRect(this.region.xMin * 15, this.region.yMin * 15, width * 15, height * 15);
            toContext.closePath();
        }
    }
}
