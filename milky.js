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

  for (var i=0; i<star_count; i++) {
    circle(ctx,
           rand_normal(band_width.stdev, band_width.mean),
           rand_linear(0, CANVAS_HEIGHT),
           rand_linear(star_radius.min, star_radius.max));
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

function canvas() {
  var canvas = document.getElementById('galaxy');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  var ctx = canvas.getContext('2d');

  // background band
  galactic_band(ctx,
                CANVAS_HEIGHT * 100,
                {min: 0.5, max: 0.8},
                "rgba(255, 255, 255, 0.05)",
                {mean: GALACTIC_ECLIPTIC, stdev: CANVAS_WIDTH/10});

  // background highlight band
  galactic_band(ctx,
                CANVAS_HEIGHT * 25,
                {min: 0.5, max: 0.8},
                "rgba(255, 255, 255, 0.075)",
                {mean: GALACTIC_ECLIPTIC, stdev: CANVAS_WIDTH/25});

  // foreground band
  galactic_band(ctx,
                CANVAS_HEIGHT * 10,
                {min: 0.1, max: 1.1},
                "rgba(255, 255, 255, 0.15)",
                {mean: GALACTIC_ECLIPTIC, stdev: CANVAS_WIDTH/6});

  // foreground highlight band
  galactic_band(ctx,
                CANVAS_HEIGHT/3,
                {min: 0.9, max: 1.5},
                "rgba(255, 255, 255, 0.35)",
                {mean: GALACTIC_ECLIPTIC, stdev: CANVAS_WIDTH/4});

  // We can't just blank the classnames inline with the rest of this function,
  // as the browser needs a reflow before it'll apply a CSS transition.
  // Fortunately the delay actually looks quite pleasant,
  // which is why we wait for a whole second rather than just a single milli.
  setTimeout(function() {
        canvas.className = '';
  }, 1000);
}

onload = canvas;
