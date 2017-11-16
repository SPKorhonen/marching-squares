export default class Map {
  constructor(private data: number[][]) { }

  set(x: number, y: number, val: number) {
    if (!this.data[y]) {
      this.data[y] = [];
    }
    this.data[y][x] = val;
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
