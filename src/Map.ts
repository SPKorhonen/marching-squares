declare var Object: any;

export default class Map {
  private dirty: any;

  constructor(private data: number[][]) {
    this.dirty = {};
  }

  flush() {
    const vals = Object.keys(this.dirty);
    this.dirty = {};

    return vals.map(dirt => dirt.split(',').map(x => parseInt(x, 10)));
  }

  set(x: number, y: number, val: number) {
    if (!this.data[y]) {
      this.data[y] = [];
    } else if (this.data[y][x] === val) {
      return;
    }

    this.data[y][x] = val;
    this.dirty[`${x},${y}`] = true;
  }

  get(x: number, y: number) {
    return (this.data[y] && this.data[y][x]) || 0;
  }

  getRadius(xCenter: number, yCenter: number, radius: number): number[][] {
    let points = [];

    for (let x = xCenter - radius; x <= xCenter; x++) {
      for (let y = yCenter - radius; y <= yCenter; y++) {

        if ((x - xCenter) * (x - xCenter) + (y - yCenter) * (y - yCenter) <= radius * radius) {
          const xSym = xCenter - (x - xCenter);
          const ySym = yCenter - (y - yCenter);

          points = points.concat([
            [x, y],
            [x, ySym],
            [xSym, y],
            [xSym, ySym]
          ]);
        }
      }
    }

    return points;
  }

  getBinary(x: number, y: number, threshold: number = 1): number {
    return (this.data[y] && this.data[y][x] >= threshold) ? 1 : 0;
  }
}
