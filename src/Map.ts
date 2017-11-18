declare var Object: any;

export interface MarchableSpace {
  flush(): number[][];
  get(x: number, y: number): number;
  getBinary(x: number, y: number, threshold: number): number;
  set(x: number, y: number, val: number): void;
}

export default class TileMap implements MarchableSpace {
  private dirty: Set<string>;

  constructor(private data: number[][]) {
    this.dirty = new Set();
  }

  flush(): number[][] {
    let vals = [];
    const entries = this.dirty.entries();
    let entry = entries.next();

    while (entry.value) {
      vals.push(entry.value[0].split(',').map(parseFloat));
      entry = entries.next();
    }
    this.dirty = new Set();

    return vals;
  }

  set(x: number, y: number, val: number): void {
    if (!this.data[y]) {
      this.data[y] = [];
    } else if (this.data[y][x] === val) {
      return;
    }

    this.data[y][x] = val;
    this.dirty.add(`${x},${y}`);
  }


  get(x: number, y: number): number {
    return (this.data[y] && this.data[y][x]) || 0;
  }

  getBinary(x: number, y: number, threshold: number = 1): number {
    return (this.data[y] && this.data[y][x] >= threshold) ? 1 : 0;
  }
}
