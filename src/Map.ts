export default class Map {
  cache: any = {};

  constructor(public data: number[][]) { }

  set(x: number, y: number, val: number) {
    let key = x + '-' + y;
    delete this.cache[key];
    key = 'b' + x + '-' + y;
    delete this.cache[key];

    this.data[y][x] = val;
  }

  get(x: number, y: number) {
    const key = x + '-' + y;
    if (!this.cache[key]) {
      this.cache[key] = this.data[y] && this.data[y][x] || 0;
    }
    return this.cache[key];
  }

  getBinary(x: number, y: number, threshold: number = 0) {
    const key = 'b' + x + '-' + y + '-' + threshold;

    if (!this.data.hasOwnProperty(y.toString())) {
      return 0;
    }

    if (!this.cache[key]) {
      this.cache[key] = this.data[y] && this.data[y][x] >= threshold ? 1 : 0;
    }
    return this.cache[key];
  }
}
