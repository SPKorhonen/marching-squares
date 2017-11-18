declare var Object: any;

export default class Map {
  private dirty: Set<string>;

  constructor(private data: number[][]) {
    this.dirty = new Set();
  }

  flush() {
    const vals = Array.from(this.dirty);
    this.dirty = new Set();

    return vals.map(x => x.split(',').map(y => parseInt(y, 10)));
  }

  set(x: number, y: number, val: number) {
    if (!this.data[y]) {
      this.data[y] = [];
    } else if (this.data[y][x] === val) {
      return;
    }

    this.data[y][x] = val;
    this.dirty.add(`${x},${y}`);
  }


  get(x: number, y: number) {
    return (this.data[y] && this.data[y][x]) || 0;
  }

  getBinary(x: number, y: number, threshold: number = 1): number {
    return (this.data[y] && this.data[y][x] >= threshold) ? 1 : 0;
  }
}
