const radiusCache = {};
export function getRadiusCoords(xCenter: number, yCenter: number, radius: number): number[][] {
    const key = `${xCenter},${yCenter},${radius}`;
    const r2 = radius * radius;
    if (!radiusCache[key]) {
        let points = [];
        for (let x = xCenter - radius; x <= xCenter; x += 1) {
            for (let y = yCenter - radius; y <= yCenter; y += 1) {

                if ((x - xCenter) * (x - xCenter) + (y - yCenter) * (y - yCenter) <= r2) {
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
        radiusCache[key] = points;
    }

    return radiusCache[key];
}