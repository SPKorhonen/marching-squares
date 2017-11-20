import { CanvasPrintable } from './canvas-printable';
import Emitter from './emitter';
import VCR from './vcr';
import MarchingSquares from './marching-squares';

interface Node {
    coords: number[];
    parent?: Node;
    f?: number;
    g?: number;
    h?: number;
}

class TreeNode<T> {
    left: TreeNode<T>;
    right: TreeNode<T>;

    constructor(protected value: any, protected parent?: TreeNode<T>, protected data?: any) { }

    visit(): any {
        return this;
    }

    traverseInOrder(): T[] {
        let returned: T[] = [];
        this.left && (returned = returned.concat(this.left.traverseInOrder()));
        returned.push(this.visit());
        this.right && (returned = returned.concat(this.right.traverseInOrder()));

        return returned;
    }

    traversePreOrder(): T[] {
        let returned: T[] = [];
        returned.push(this.visit());
        this.left && (returned = returned.concat(this.left.traversePreOrder()));
        this.right && (returned = returned.concat(this.right.traversePreOrder()));

        return returned;
    }

    traversePostOrder(): T[] {
        let returned: T[] = [];
        this.left && (returned = returned.concat(this.left.traversePreOrder()));
        this.right && (returned = returned.concat(this.right.traversePreOrder()));
        returned.push(this.visit());

        return returned;
    }

    add(val: number, data?: any): void {
        if (val < this.value) {
            if (this.left) {
                this.left.add(val, data);
            } else {
                this.left = new TreeNode<T>(val, this, data);
            }
        } else if (val > this.value) {
            if (this.right) {
                this.right.add(val, data);
            } else {
                this.right = new TreeNode<T>(val, this, data);
            }
        }
    }

    getMin(): any {
        if (this.left) {
            return this.left.getMin();
        } else {
            if (this.parent) {
                this.parent.left = null;
                const { right } = this;
                if (right) {
                    this.parent.add(right.value, right.data);
                    delete this.right;
                }
            }
            return this;
        }
    }

    getMax(): any {
        if (this.right) {
            return this.right.getMax();
        } else {
            if (this.parent) {
                this.parent.right = null;
                const { left } = this;
                if (left) {
                    this.parent.add(left.value, left.data);
                    delete this.left;
                }
            }
            return this;
        }
    }
}

class Tree<T> {
    head: TreeNode<T>;

    add(val: number, data?: any): void {
        if (!this.head) {
            this.head = new TreeNode<T>(val, null, data);
        } else {
            this.head.add(val, data);
        }
    }

    getMin() {
        return this.head.getMin();
    }

    getMax() {
        return this.head.getMax();
    }

    hasData(): boolean {
        return !!this.head;
    }
}

export class AStarPathfinder extends Emitter implements CanvasPrintable {
    private vcr: VCR;
    private context: CanvasRenderingContext2D;

    constructor(private ms: MarchingSquares) {
        super();
        const size = ms.getGridSize() * ms.getCellSize();
        this.vcr = new VCR(size, size);
        this.context = this.vcr.getContext();
    }

    static dist(point1: number[], point2: number[]) {
        return Math.sqrt(Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2));
    }

    async search(start: number[], end: number[]) {
        const results = await this.astar(start, end);
        const cellSize = this.ms.getCellSize();
        if (results) {
            let printed: Node = results;
            this.context.fillStyle = 'green';
            while (printed) {
                this.context.fillRect(printed.coords[0] * cellSize, printed.coords[1] * cellSize, cellSize, cellSize);
                printed = printed.parent;
            }

            this.emit('update');
        }
    }

    async astar(start: number[], end: number[]) {
        const open: Tree<Node> = new Tree();
        const closed: Tree<Node> = new Tree();
        const cellSize = this.ms.getCellSize();

        open.add(0, {
            coords: start,
            g: 0,
            h: 0,
            f: 0,
        });

        while (open.hasData()) {
            await new Promise(res => setTimeout(res, 50));
            this.context.fillStyle = 'rgb(125,125,125)';
            const q = open.getMin();

            const x = q.data.coords[0];
            const y = q.data.coords[1];

            this.context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            this.emit('update');

            const neighbors = [
                [x - 1, y],
                [x, y - 1],
                [x + 1, y],
                [x, y + 1],
            ];
            const map = this.ms.getMap();

            for (let i = neighbors.length - 1; i >= 0; i -= 1) {
                const next = neighbors[i];
                this.context.fillRect(next[0] * cellSize, next[1] * cellSize, cellSize, cellSize);
                this.emit('update');
                if (map.getBinary(next[0], next[1], 1) === 1) {
                    continue;
                }
                if (next.join(',') === end.join(',')) {
                    return {
                        coords: next,
                        parent: q,
                        // cost?: number;
                        // pathCost?: number;
                        // remainingCost?: number;
                    };
                }

                const g = q.data.g + AStarPathfinder.dist(next, q.data.coords);
                const h = AStarPathfinder.dist(next, end);
                const f = g + h;

                const newNode: Node = {
                    coords: next,
                    parent: q,
                    g, // (distance from next and q),
                    h, // distance from next to goal
                    f, // cost for this node
                };

                const opens = open.head ? open.head.traverseInOrder() : [];
                let hasLesserScore = !!opens.find((x: any) => {
                    return x.data.coords.join(',') === next.join(',') && f <= x.f;
                });
                if (hasLesserScore) {
                    continue;
                }
                const closeds = closed.head ? closed.head.traverseInOrder() : [];
                hasLesserScore = !!closeds.find((x: any) => {
                    return x.data.coords.join(',') === next.join(',') && f <= x.f;
                });
                if (hasLesserScore) {
                    continue;
                }

                open.add(newNode.f, newNode);
            }

            closed.add(q.data.f, q.data);
        }

        /*
            for each successor
                if successor is the goal, stop the search
                successor.g = q.g + distance between successor and q
                successor.h = distance from goal to successor
                successor.f = successor.g + successor.h

                if a node with the same position as successor is in the OPEN list \
                    which has a lower f than successor, skip this successor
                if a node with the same position as successor is in the CLOSED list \
                    which has a lower f than successor, skip this successor
                otherwise, add the node to the open list
            end
            push q on the closed list
        end
        */
    }

    print(toContext: CanvasRenderingContext2D) {
        toContext.drawImage(this.vcr.getCanvas(), 0, 0);
        // toContext.drawImage(this.vcr.getCanvas('goal'), 0, 0);
    }
}