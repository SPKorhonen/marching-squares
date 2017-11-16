import { Greeter } from './greeter';
import Map from './Map';

const g = new Greeter('Juri');
g.greet();

const SIZE = 10;
const GRID_SIZE = 50;

const mapInner = [];
for (let i = 0; i < GRID_SIZE; i += 1) {
  mapInner[i] = [];
  for (let j = 0; j < GRID_SIZE; j += 1) {
    mapInner[i][j] = i % 3; //Math.floor(Math.random() * 2);
  }
}

const map = new Map(mapInner);
// const map = new Map([
//   [0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 1, 1, 1, 1, 1, 0, 0],
//   [0, 1, 2, 6, 1, 0, 1, 0],
//   [0, 1, 2, 1, 0, 0, 0, 0],
//   [0, 1, 2, 2, 0, 0, 0, 0],
//   [0, 1, 2, 2, 1, 0, 1, 0],
//   [0, 1, 1, 1, 1, 1, 1, 0],
//   [0, 0, 0, 0, 0, 1, 1, 0],
// ]);

const drawSquare = (ctx, x, y, size = SIZE) =>{
  // ctx.fillRect(x * size, y * size, size, size);
  ctx.fillRect(x * size, y * size, size, size);
  // ctx.clearRect(x * size, y * size, size, size);
}

const drawLine = (ctx, x, y) => {
  ctx.lineTo(x + (SIZE / 2), y + (SIZE / 2));
}


const printMap = () => {
  const reds = [];
  const blacks = [];

  for(let x = 0; x < GRID_SIZE; x += 1){
    for(let y = 0; y < GRID_SIZE; y += 1){
      const point = map.get(x, y);
      if (point > 0) {
        reds.push([x, y]);
      } else {
        blacks.push([x, y]);
      }
    }
  }

  context.fillStyle = 'red';
  reds.forEach(x => drawSquare(context, x[0], x[1]));

  context.fillStyle = 'grey';
  blacks.forEach(x => drawSquare(context, x[0], x[1]));
};

// ------

const canvas:any = document.querySelector('#ok');
canvas.setAttribute('width', '800px');
canvas.setAttribute('height', '800px');

const context = canvas.getContext('2d');
printMap();

const getFours = (x, y) => {
  return [
    map.getBinary(x - 1, y),
    map.getBinary(x, y - 1),
    map.getBinary(x + 1, y),
    map.getBinary(x, y + 1)
  ];
}


/*

pre-gym ideas:
- iterate over each active cell (has `1` binary value)
- check up/down/left/right for other active cells
  - if none - keep going
  - if all - keep going


 */


const lookup = (code, x, y) => {
  switch (code) {
    case '0000':
    case '1111':
      return [];

    case '0010':
      return [
        [x, y],
        [x + 1, y]
      ]

    case '0001':
      return [
        [x, y],
        [x + 1, y],
        [x + 1, y],
        [x + 1, y + 1],
        [x, y],
        [x, y + 1],
      ];

    case '0011':
      return [
        [x + 0.5, y + 1],
        [x + 1, y + 0.5]
      ];

    case '0111':
      return [
        [x + 0.5, y],
        [x + 0.5, y + 1],
      ];

    case '0110':
      return [
        [x + 0.5, y],
        [x + 1, y + 0.5]
      ];

    case '1011':
      return [
        [x, y + 0.5],
        [x + 1, y + 0.5]
      ];

    case '1110':
      return [
        [x, y + 0.5],
        [x + 1, y + 0.5]
      ];

    case '1101':
      return [
        [x + 1, y],
        [x + 1, y + 1]
      ];

    case '1100':
      return [
        [x + 1, y],
        [x, y + 0.5],
      ];

    case '1001':
      return [
        [x, y],
        [x + 1, y + 1],
      ];

    case '1000':
      return [
        [x, y + 0.5],
        [x, y + 1],
      ];

    default:
      console.log(code);
      return [];
  }
}


let actions = [];
for (let x = 0; x < GRID_SIZE; x += 1) {
  for (let y = 0; y < GRID_SIZE; y += 1) {
    if(map.getBinary(x, y) === 1){
      const set = getFours(x, y).join('');
      actions.push(lookup(set, x, y));
    }
  }
}

context.strokeStyle = 'blue';

actions.forEach(act => {
  if (!act.length){ return; }

  for(let i = 0; i < act.length; i += 2) {
    context.beginPath();
    context.moveTo(...act[i + 0].map(z => z * SIZE));
    context.lineTo(...act[i + 1].map(z => z * SIZE));
    context.stroke();
  }

});
