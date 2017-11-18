declare var Object: any;

export default class Map {
  private dirty: Set<string>;

  constructor(private data: number[][]) {
    this.dirty = new Set();
  }

  flush() {
    let vals = [];
    const entries = this.dirty.entries();
    let entry = entries.next();

    while (entry.value) {
      vals.push(entry.value[0].split(',').map(y => parseInt(y, 10)));
      entry = entries.next();
    }
    this.dirty = new Set();

    return vals;
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
