import Map from './Map';
import MarchingSquares from './marching-squares';
import VCR from './vcr';

export interface Renderer {
    getContext(name?: string): CanvasRenderingContext2D;
}

const ms = new MarchingSquares(10, 50, new VCR());
ms.printMap();
// ms.printBoundary(0);
// ms.printBoundary(0.5);
ms.printBoundary();

// const canvas:any = document.querySelector('#ok');
// canvas.setAttribute('width', '800px');
// canvas.setAttribute('height', '800px');

// let mouseDown = false;
// canvas.addEventListener('mousedown', (evt)=>{
//   mouseDown = true;

//   const x = Math.round(evt.offsetX / ms.getCellSize());
//   const y = Math.round(evt.offsetY / ms.getCellSize());

//   map.set(x, y, map.getBinary(x, y) === 1 ? 0 : 1);
//   ms.clearBoundary();
//   ms.printBoundary();
// })
// canvas.addEventListener('mouseup', ()=>{
//   mouseDown = false;
// })
// canvas.addEventListener('mouseout', ()=>{
//   mouseDown = false;
// })

// let last;
// canvas.addEventListener('mousemove', (evt) =>{
//   if (!mouseDown){ return; }
//   const x = Math.round(evt.offsetX / SIZE);
//   const y = Math.round(evt.offsetY / SIZE);
//   if (last === `${x},${y}`){ return; }

//   map.set(x, y, map.getBinary(x, y) === 1 ? 0 : 1);
//   last = `${x},${y}`;
//   update();
// });
