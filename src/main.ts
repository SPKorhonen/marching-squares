import MarchingSquares from './marching-squares';
import VCR from './vcr';
import MouseEditor from './mouse-editor';
import RenderingPipeline from './RenderingPipeline';
import { DepthPathfinder } from './DepthPathfinder';
import { BreadthPathFinder } from './BreadthPathfinder';
// import { AStarPathfinder } from './AStarPathfinder';
// import { setTimeout } from 'timers';

export interface Renderer {
    getContext(name?: string): CanvasRenderingContext2D;
    getCanvas(name?: string): HTMLCanvasElement;
}

export class MarchingSquaresApp {
    shouldUpdate: boolean = false;
    instance: MarchingSquares;
    pipeline: RenderingPipeline;

    constructor(private cellSize: number = 10, private gridSize: number = 15) {
        this.pipeline = new RenderingPipeline();
        // The pipeline needs to generate a canvas to display things on to the user.
        const totalCellCount = this.cellSize * this.gridSize;
        this.pipeline.createCanvas(1240, 700);

        this.instance = this.createMarchingInstance();
        const bfs = new BreadthPathFinder(this.instance);
        bfs.on('update', this.toggleUpdateFlag.bind(this, true));

        const dfs = new DepthPathfinder(this.instance);
        dfs.on('update', this.toggleUpdateFlag.bind(this, true));

        // const astar = new AStarPathfinder(this.instance);
        // astar.on('update', this.toggleUpdateFlag.bind(this, true));

        const editor = this.createMouseEditor();

        this.pipeline.addRenderer(bfs);
        // this.pipeline.addRenderer(dfs);
        // this.pipeline.addRenderer(astar);
        // this.pipeline.addRenderer(<any>this.instance.getMap());
        this.pipeline.addRenderer(this.instance);
        this.pipeline.addRenderer(editor);


        const map: any = this.instance.getMap();
        map.on('update', this.toggleUpdateFlag.bind(this, true));

        this.pipeline.update();
        this.tick = this.tick.bind(this);
        this.tick();

        // console.log('astar', astar.search([6, 6], [20, 20]));
        // console.log('dfs', dfs.search([12, 12], [3, 3]));
        (async () => {
            let lastCoords = [1, 1];
            let newCoords;
            while (true) {
                newCoords = [Math.round(Math.random() * 20) + 1, Math.round(Math.random() * 20) + 1];
                await bfs.search(lastCoords, newCoords);
                lastCoords = newCoords;
                await new Promise(res => setTimeout(res, 1500));
            }
        })();
    }

    createMarchingInstance(): MarchingSquares {
        const totalCellCount = this.cellSize * this.gridSize;
        const virtualRenderer = new VCR(totalCellCount, totalCellCount);
        return new MarchingSquares(virtualRenderer, this.cellSize, this.gridSize);
    }

    toggleUpdateFlag(val: boolean): void {
        this.shouldUpdate = val;
    }

    createMouseEditor(): MouseEditor {
        const me = new MouseEditor(this.instance, this.pipeline.getCanvas());

        me.on('update', this.toggleUpdateFlag.bind(this, true));

        return me;
    }

    tick() {
        if (this.shouldUpdate) {
            this.pipeline.update();
            this.shouldUpdate = false;
        }
        requestAnimationFrame(this.tick);
    }
}

document.body.innerHTML = '';
const app = new MarchingSquaresApp(15, 50);
