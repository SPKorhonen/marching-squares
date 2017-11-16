interface CollisionObject {
    x: number; // current x position,
    y: number; // current y position,
    width: number; // object height,
    height: number; // object width,
    pixelMap: any; // pixel map object generated from buildPixelMap()
}

interface PixelData {
    x: number;
    y: number;
    pixelData: any;
}

export function hitTest ( source:CollisionObject, target:CollisionObject ) {
    const start = new Date().getTime();
    const hit = this.pixelHitTest(source, target);
    const end = new Date().getTime();

    if( hit == true ){
        console.log( 'detection took: ' + (end - start) + 'ms' );
    }

    return hit;
}


function pixelHitTest (source:CollisionObject, target:CollisionObject) {
        const top = Math.max( source.y, target.y );
        const bottom = Math.min(source.y+source.height, target.y+target.height);
        const left = Math.max(source.x, target.x);
        const right = Math.min(source.x+source.width, target.x+target.width);

        for (let y = top; y < bottom; y++)
        {
            for (let x = left; x < right; x++)
            {
                const pixel1 = source.pixelMap.data[ (x - source.x) +"_"+ (y - source.y) ];
                const pixel2 = target.pixelMap.data[ (x - target.x) +"_"+ (y - target.y) ];

                if( !pixel1 || !pixel2 ) {
                    continue;
                };

                if (pixel1.pixelData[3] == 255 && pixel2.pixelData[3] == 255)
                {
                    return true;
                }
            }
        }

        return false;
}

/*
    * public function buildPixelMap()
    *
    * Creates a pixel map on a canvas image. Everything
    * with a opacity above 0 is treated as a collision point.
    * Lower resolution (higher number) will generate a faster
    * but less accurate map.
    *
    *
    * @param source (Object) The canvas object
    *
    * @return object, a pixelMap object
    *
    */
export function buildPixelMap (canvas:HTMLCanvasElement) {
    const resolution = 1;
    const ctx = canvas.getContext("2d");
    const pixelMap:PixelData[] = [];

    for( var y = 0; y < canvas.height; y++) {
        for( var x = 0; x < canvas.width; x++ ) {
            var dataRowColOffset = y+"_"+x;//((y * canvas.width) + x);
            var pixel = ctx.getImageData(x,y,resolution,resolution);
            var pixelData = pixel.data;

            pixelMap[dataRowColOffset] = { x:x, y:y, pixelData: pixelData };

        }
    }

    return pixelMap;
}