"use strict";

// Retrieves the transition duration of an element, in milliseconds
function transition_duration(element_id) {
    var element = document.getElementById(element_id);
    var element_style = window.getComputedStyle(element);
    // Here's hoping that this value's name is consistent across browsers
    var duration_string = element_style.getPropertyValue('transition-duration');
    // A duration string is of the form "0.5s"
    // Here's hoping that form is consistent across browsers
    var duration_ms = 1000 * parseFloat(duration_string.replace(/s$/, ''));
    return duration_ms;
}

// Configuration options for the progress spinner
var opts = {
    lines: 13, // The number of lines to draw
    length: 0, // The length of each line
    width: 3, // The line thickness
    radius: 60, // The radius of the inner circle
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
    top: '200px', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
};
var spinner = new Spinner(opts);

// Get the current day, then set the time to sometime tonight
var tonight_local_time = moment().hour(22).minute(0).second(0);
var tonight_utc = tonight_local_time.clone().utc();

var info = tonight_local_time.format('dddd, MMM D, hh:mm A') +
           ' local time (UTC' + tonight_local_time.format('Z') + ')';

var ajax = new XMLHttpRequest();

ajax.onreadystatechange = function() {
    if (ajax.readyState == 4 && ajax.status == 200) {
        var positions = JSON.parse(ajax.responseText);
        var table_html = '<table>';
        for (var i=0; i<positions.today.length; i++) {
            var planet = positions.today[i];
            table_html += '<tr' + (planet.has_changed_since_yesterday ? ' class="changed"' : '') + '>' +
                          '<td>' + planet.name + '</td>' +
                          '<td>' + planet.degrees + '</td>' +
                          '<td class="sign">' + planet.sign + '</td>' +
                          '<td>' + (planet.is_retrograde ? 'Rx' : '') + '</td>' +
                          '</tr>';
        }
        table_html += '</table>';

        document.getElementById('positions').innerHTML = table_html;
        document.getElementById('info').innerHTML = info;

        var spinner_fadeout_duration = transition_duration('spinner');
        var content_fadein_duration = transition_duration('content');

        // Trigger the CSS transition to hide the spinner...
        document.getElementById('spinner').className = 'hidden';
        // ...then stop the spinner once it's done
        setTimeout(function() {
            spinner.stop();
            // Trigger the CSS transition to show the data...
            document.getElementById('content').className = '';
            // ...then start drawing the galaxy once it's done
            setTimeout(function() {
              milky.draw_galaxy();
            }, content_fadein_duration);
        }, spinner_fadeout_duration);
    }
};

window.onload = function() {
    spinner.spin(document.getElementById('spinner'));

    ajax.open('GET', 'ajax/positions?date=' + tonight_utc.toISOString(), true);
    ajax.send();
};
