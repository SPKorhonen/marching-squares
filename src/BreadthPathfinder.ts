import { CanvasPrintable } from './canvas-printable';
import Emitter from './emitter';
import VCR from './vcr';
import MarchingSquares from './marching-squares';
import TileMap from './Map';

interface Node {
    coords: number[];
    parent?: Node;
}

export class BreadthPathFinder extends Emitter implements CanvasPrintable {
    private vcr: VCR;
    private context: CanvasRenderingContext2D;
    private walls: any;

    constructor(private ms: MarchingSquares) {
        super();
        const size = ms.getGridSize() * ms.getCellSize();
        this.vcr = new VCR(size, size);
        this.context = this.vcr.getContext();
        this.walls = {};
    }

    public async search(start: number[], end: number[]) {
        const queue: Node[] = [{
            coords: start
        }];
        let visited = {};

        const map: any = this.ms.getMap();
        map.on('dirty', (pt, val) => {
            delete visited[pt.join(',')];
            delete this.walls[pt.join(',')];
        });

        const cellSize = this.ms.getCellSize();
        const goalCtx = this.vcr.getContext('goal');
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        goalCtx.clearRect(0, 0, goalCtx.canvas.width, goalCtx.canvas.height);
        goalCtx.fillStyle = 'green';
        goalCtx.fillRect(end[0] * cellSize, end[1] * cellSize, cellSize, cellSize);
        this.context.fillStyle = 'blue';

        while (queue.length) {
            const item = queue.shift();
            if (visited[item.coords.join(',')] || this.walls[item.coords.join(',')]) {
                continue;
            }
            await new Promise(res => setTimeout(res, 5));
            visited[item.coords.join(',')] = true;
            this.context.fillStyle = 'rgba(255,255,255,0.02)';
            this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
            this.context.fillStyle = 'blue';
            this.context.fillRect(item.coords[0] * cellSize, item.coords[1] * cellSize, cellSize, cellSize);
            this.emit('update')

            const x: number = item.coords[0];
            const y: number = item.coords[1];

            const neighbors = [
                [x - 1, y],
                [x, y - 1],
                [x + 1, y],
                [x, y + 1],
            ];

            for (let i = neighbors.length - 1; i >= 0; i -= 1) {
                const ptKey = neighbors[i].join(',');
                // this.context.fillStyle = 'rgba(255,0,255,0.1)';
                // this.context.fillRect(neighbors[i][0] * cellSize, neighbors[i][1] * cellSize, cellSize, cellSize);

                if (visited[ptKey]) {
                    continue;
                }

                if (ptKey === end.join(',')) {
                    // console.log('found!', {
                    //     coords: neighbors[i],
                    //     parent: item,
                    // });

                    let printed = item;
                    this.context.fillStyle = 'green';
                    while (printed) {
                        this.context.fillRect(printed.coords[0] * cellSize, printed.coords[1] * cellSize, cellSize, cellSize);
                        printed = printed.parent;
                    }
                    this.emit('update');

                    return {
                        coords: neighbors[i],
                        parent: item,
                    };
                }

                if (map.getBinary(neighbors[i][0], neighbors[i][1], 1) === 0) {
                    queue.push({
                        coords: neighbors[i],
                        parent: item,
                    });
                } else {
                    this.vcr.getContext('brain').fillStyle = 'rgba(0,0,0,0.5)';
                    this.vcr.getContext('brain').fillRect(neighbors[i][0] * cellSize, neighbors[i][1] * cellSize, cellSize, cellSize);
                    // if it's a wall, mark it as such to prevent us looking at it again in the future
                    this.walls[ptKey] = true;
                }
            }
        }

        return null;
    }

    print(toContext: CanvasRenderingContext2D) {
        toContext.drawImage(this.vcr.getCanvas(), 0, 0);
        toContext.drawImage(this.vcr.getCanvas('goal'), 0, 0);
        // toContext.drawImage(this.vcr.getCanvas('brain'), 0, 0);
    }
    /*
    function bfs(node start_position)
        add start_position to the queue
        while the queue is not empty
            pop a node off the queue, call it "item"
            color item on the graph // make sure we don't search it again
            generate the 8 successors to item
            set the parent of each successor to "item" // this is so we can backtrack our final solution
            for each successor
                if the successor is the goal node, end the search
                else, push it to the back of the queue // So we can search this node
            end
        end

        if we have a goal node, look at its ancestry to find the path (node->parent->parent->parent..., etc)
        if not, the queue was empty and we didn't find a path :^\
    end

    */

}