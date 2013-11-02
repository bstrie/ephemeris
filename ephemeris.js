$(document).ready(function() {
  var opts = {
    lines: 17, // The number of lines to draw
    length: 0, // The length of each line
    width: 30, // The line thickness
    radius: 0, // The radius of the inner circle
    corners: 1, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#fff', // #rgb or #rrggbb or array of colors
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: true, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '230px', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
  };
  var target = document.getElementsByTagName('html')[0];
  var spinner = new Spinner(opts).spin(target);

  tonight_local_time = moment().hour(22).minute(0).second(0);
  tonight_utc = tonight_local_time.clone().utc();

  var title = tonight_local_time.format('dddd, MMM D, hh:mm A') +
              ' local time (UTC' + tonight_local_time.format('Z') + ')';

  $.get('ajax/positions', {date: tonight_utc.toISOString()}, function(positions) {
    var table_html = '<table>';
    $.each(positions.today, function(i) {
      var planet = positions.today[i];
      table_html += '<tr' + (planet.has_changed_since_yesterday ? ' class="changed"' : '') + '>' +
                    '<td>' + planet.name + '</td>' +
                    '<td>' + planet.degrees + '</td>' +
                    '<td class="sign">' + planet.sign + '</td>' +
                    '<td>' + (planet.is_retrograde ? 'Rx' : '') + '</td>' +
                    '</tr>';

      spinner.stop();

      $('div#title').text(title);
      $('div#data').html(table_html);
    });
  });
});
