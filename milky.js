CANVAS_WIDTH = window.innerWidth;
CANVAS_HEIGHT = window.innerHeight;

GALACTIC_ECLIPTIC = CANVAS_WIDTH/2;

function circle(ctx, x_center, y_center, radius) {
    ctx.moveTo(x_center + radius, y_center);
    ctx.arc(x_center, y_center, radius, 0, Math.PI*2, true);
}

function rand_linear(lower, upper) {
    return lower + (upper - lower) * Math.random();
}

function galactic_band(ctx, star_count, star_radius, star_color, band_width) {
    ctx.beginPath();

    var x_center, y_center, radius;
    for (var i=0; i<star_count; i++) {
        x_center = rand_normal(band_width.stdev, band_width.mean);
        y_center = rand_linear(0, CANVAS_HEIGHT);
        radius = rand_linear(star_radius.min, star_radius.max);
        ctx.moveTo(x_center + radius, y_center);
        ctx.arc(x_center, y_center, radius, 0, Math.PI*2, true);
    }

    ctx.fillStyle = star_color;
    ctx.fill();
}

function rand_normal(stdev, mean) {
    var sum = 0;
    for (var i=0; i<3; i++) {
        sum += rand_linear(-1, 1);
    }
    sum = sum * stdev + mean;
    return sum;
}

function draw_galaxy() {
    var canvas = document.getElementById('galaxy');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    var ctx = canvas.getContext('2d');

    // If we just draw all the bands in one giant block, the browser becomes unresponsive.
    // So we split up each band into several parts, and place them in an array.
    // We then draw each part of each band with pauses in-between.
    background = {density: CANVAS_HEIGHT * 10,
                  star_radius: {min: 0.5, max: 0.8},
                  star_color: "rgba(255, 255, 255, 0.05)",
                  band_width: {mean: GALACTIC_ECLIPTIC, stdev: CANVAS_WIDTH/10}};

    background_highlight = {density: CANVAS_HEIGHT * 8,
                  star_radius: {min: 0.5, max: 0.8},
                  star_color: "rgba(255, 255, 255, 0.075)",
                  band_width: {mean: GALACTIC_ECLIPTIC, stdev: CANVAS_WIDTH/25}};

    foreground = {density: CANVAS_HEIGHT * 10,
                  star_radius: {min: 0.1, max: 1.1},
                  star_color: "rgba(255, 255, 255, 0.15)",
                  band_width: {mean: GALACTIC_ECLIPTIC, stdev: CANVAS_WIDTH/6}};

    foreground_highlight = {density: CANVAS_HEIGHT / 3,
                  star_radius: {min: 0.9, max: 1.5},
                  star_color: "rgba(255, 255, 255, 0.35)",
                  band_width: {mean: GALACTIC_ECLIPTIC, stdev: CANVAS_WIDTH/4}};

    bands = [];

    function add_bands(band, how_many) {
        for (var i=0; i<how_many; i++) {
            bands.push(function() {
                galactic_band(ctx, band.density, band.star_radius, band.star_color, band.band_width);
            });
        }
    }

    add_bands(background, 10);
    add_bands(background_highlight, 3);
    add_bands(foreground, 1);
    add_bands(foreground_highlight, 1);

    function draw_bands() {
        if (bands.length > 0) {
            var band = bands.shift();
            band();
            setTimeout(draw_bands, 100);
        }
        else {
            // We can't just blank the classnames inline with the rest of this function,
            // as the browser needs a reflow before it'll apply a CSS transition.
            setTimeout(function() {
                  canvas.className = '';
            }, 1000);
        }
    }

    draw_bands();
}
