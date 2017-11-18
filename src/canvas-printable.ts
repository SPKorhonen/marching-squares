import { Rect } from './QuadTree';

export interface CanvasPrintable {
    print(toContext: CanvasRenderingContext2D, viewport: Rect): void;
}