export { }
import { noiseModule } from "./perlin";

// var ifPaused = false;
let speed = 0.003;
let canvas = document.getElementsByTagName('canvas')[0];
canvas.width = 640;
canvas.height = 480;
let ctx: CanvasRenderingContext2D = canvas.getContext('2d');
let image = ctx.createImageData(canvas.width, canvas.height);
let data: Uint8ClampedArray = image.data;
let height = 0;
let fn = 'perlin';
// var fn = 'simplex';
let seeded = false;
let renderingray = false;

function drawFrame() {
    let start = Date.now();
    if (seeded === false) {
        noiseModule.seed(Math.random());
        seeded = true;
    }

    // Cache width and height values for the canvas.
    let cWidth = canvas.width;
    let cHeight = canvas.height;
    let noisefn = fn === 'simplex' ? noiseModule.simplex3 : noiseModule.perlin3;
    // let noisefn = noiseModule.perlin2;

    // using noisefn() to get a value,
    // turn it into RGB color,
    // store color in data,
    // put data in canvas.
    for (let x = 0; x < cWidth; x++) {
        for (let y = 0; y < cHeight; y++) {
            // Range of noisefn() output: -1 ~ 1
            let value = noisefn(x / 200, y / 150, height);

            // Change the range of value to 0 ~ 256
            value = 1 + value;
            value = value * 128;

            // Move the AVG slightly.
            value = value * 1.1;

            // "data[]"" is a 1D array, 
            // which stored values for cWidth * cHeight * 4 channel.
            let cell = (x + y * cWidth) * 4;

            if (!renderingray) {
                noiseToColor(value, cell);
            } else {
                data[cell] = data[cell + 1] = data[cell + 2] = value;
            }
            // alpha
            data[cell + 3] = 255;
        }
    }
    ctx.putImageData(image, 0, 0);
    let end = Date.now();

    drawRenderedTimeCost(start, end, cWidth, cHeight);

    height += speed;

    requestAnimationFrame(drawFrame);
}
function noiseToColor(
    noiseValue: number,
    cellCount: number) {
    if (noiseValue > 240) {
        // Orange
        data[cellCount] = noiseValue;
        data[cellCount + 1] = noiseValue - 120;
        data[cellCount + 2] = noiseValue - 220;
    } else if (noiseValue > 220) {
        // Yellow
        data[cellCount] = noiseValue;
        data[cellCount + 1] = 200 + noiseValue / 11
        data[cellCount + 2] = noiseValue - 150;
    } else if (noiseValue > 180) {
        // Green
        data[cellCount] = noiseValue - 160;
        data[cellCount + 1] = 100 + noiseValue / 10;
        data[cellCount + 2] = noiseValue - 160;
    } else if (noiseValue > 100) {
        // Blue
        data[cellCount] = 20;
        data[cellCount + 1] = 50 + noiseValue / 10;
        data[cellCount + 2] = 150 + noiseValue;
    } else {
        // Dark blue
        data[cellCount] = 0;
        data[cellCount + 1] = 50 + noiseValue / 10;
        data[cellCount + 2] = 150 + noiseValue;
    }
}

function drawRenderedTimeCost(
    start: number,
    end: number,
    cWidth: number,
    cHeight: number) {
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center';
    ctx.fillText(fn + ' rendered in ' + (end - start) + ' ms', cWidth / 2, cHeight - 20);
}

document.onclick = function () {
    // Swap noise function on click.
    fn = fn === 'simplex' ? 'perlin' : 'simplex';
};

requestAnimationFrame(drawFrame);   