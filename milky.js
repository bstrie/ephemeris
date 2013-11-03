var CANVAS_WIDTH = window.innerWidth;
var CANVAS_HEIGHT = window.innerHeight;


function draw_galaxy() {
    var canvas = document.getElementById('galaxy');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    var ctx = canvas.getContext('2d');

    // The vertical center of the collective bands
    var galactic_ecliptic = CANVAS_WIDTH/2;

    // If we just draw all the bands in a single step, the browser becomes unresponsive.
    // So we split up each band into several parts, and place them in an array.
    // We then draw each part of each band with periodic pauses in-between.
    background = {density: CANVAS_HEIGHT * 10,
                  star_radius: {min: 0.5, max: 0.8},
                  star_color: "rgba(255, 255, 255, 0.05)",
                  band_width: {mean: galactic_ecliptic, stdev: CANVAS_WIDTH/10}};

    background_highlight = {density: CANVAS_HEIGHT * 8,
                  star_radius: {min: 0.5, max: 0.8},
                  star_color: "rgba(255, 255, 255, 0.075)",
                  band_width: {mean: galactic_ecliptic, stdev: CANVAS_WIDTH/25}};

    foreground = {density: CANVAS_HEIGHT * 10,
                  star_radius: {min: 0.1, max: 1.1},
                  star_color: "rgba(255, 255, 255, 0.15)",
                  band_width: {mean: galactic_ecliptic, stdev: CANVAS_WIDTH/6}};

    foreground_highlight = {density: CANVAS_HEIGHT / 3,
                  star_radius: {min: 0.9, max: 1.5},
                  star_color: "rgba(255, 255, 255, 0.35)",
                  band_width: {mean: galactic_ecliptic, stdev: CANVAS_WIDTH/4}};

    bands = [];

    function add_bands(band, how_many) {
        for (var i=0; i<how_many; i++) {
            bands.push(function() {
                draw_band(ctx, band.density, band.star_radius, band.star_color, band.band_width);
            });
        }
    }

    add_bands(background, 10);
    add_bands(background_highlight, 3);
    add_bands(foreground, 1);
    add_bands(foreground_highlight, 1);

    function draw_all_bands() {
        if (bands.length > 0) {
            var band = bands.shift();
            // Draw a band...
            band();
            // ...then schedule the next band to be drawn
            setTimeout(draw_all_bands, 100);
        }
        else {
            // This final timeout is to give the browser time to reflow the page.
            // Otherwise the CSS transition to reveal the galaxy won't trigger.
            setTimeout(function() {
                  canvas.className = '';
            }, 100);
        }
    }

    draw_all_bands();
}

function draw_band(ctx, star_count, star_radius, star_color, band_width) {
    ctx.beginPath();

    for (var i=0; i<star_count; i++) {
        draw_star(ctx,
                  rand_normal(band_width.stdev, band_width.mean),
                  rand_linear(0, CANVAS_HEIGHT),
                  rand_linear(star_radius.min, star_radius.max));
    }

    ctx.fillStyle = star_color;
    ctx.fill();
}

function draw_star(ctx, x_center, y_center, radius) {
    ctx.moveTo(x_center + radius, y_center);
    ctx.arc(x_center, y_center, radius, 0, Math.PI*2, true);
}

function rand_normal(stdev, mean) {
    var sum = 0;
    for (var i=0; i<3; i++) {
        sum += rand_linear(-1, 1);
    }
    return sum * stdev + mean;
}

function rand_linear(lower, upper) {
    return lower + (upper - lower) * Math.random();
}
