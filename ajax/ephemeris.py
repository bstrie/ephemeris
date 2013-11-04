# -*- coding: utf-8 -*-

import bs4
import dateutil.parser
import datetime
import flask
import logging
import requests
import time

app = flask.Flask(__name__)

# Tail this file to observe runtime errors
file_handler = logging.FileHandler('server.log')
file_handler.setLevel(logging.ERROR)
app.logger.addHandler(file_handler)

@app.route('/ephemeris/ajax/positions')
def positions():
    # The date parameter looks like "2013-11-04T03:00:00.866Z" (ISO 8601)
    date_param = flask.request.args.get('date', '')

    today = dateutil.parser.parse(date_param)
    yesterday = today - datetime.timedelta(days=1)

    today_data = scrape_data_for_date(today)
    yesterday_data = scrape_data_for_date(yesterday)

    for planet_today, planet_yesterday in zip(today_data, yesterday_data):
        planet_today['has_changed_since_yesterday'] = True
        if planet_today['sign'] == planet_yesterday['sign'] \
           and planet_today['degrees'] == planet_yesterday['degrees']:
           planet_today['has_changed_since_yesterday'] = False

    return flask.jsonify(today=today_data)

def scrape_data_for_date(date):
    # http://serennu.com/astrology/ephemeris.php?inday=01&inmonth=11&inyear=2013&inhours=00&inmins=00&insecs=00&insort=type&z=0&gh=g&addobj=&inla=&inlo=&h=P
    response = requests.get(
        'http://serennu.com/astrology/ephemeris.php',
        params = {
            'inday': date.day,
            'inmonth': date.month,
            'inyear': date.year,
            'inhours': date.hour,
            'inmins': date.minute,
            'insecs': date.second,
            'insort': 'type',
            'z': '0',  # "0" indicates a zodiac of "Sidereal - Fagan/Bradley"
            'gh': 'g',
            'addobj': '',
            'inla': '',
            'inlo': '',
            'h': 'P'
        })
    html = response.text
    soup = bs4.BeautifulSoup(html)
    table = soup.find('table')  # `.find()` finds only the first matching tag
    result = []
    columns = []
    header = table.find('tr')
    for cell in header.find_all('td'):
        columns.append(cell.string)

    for row in header.find_all_next('tr'):
        result.append({})
        for idx, cell in enumerate(row.find_all('td')):
            result[-1][columns[idx]] = cell.string

    # Now we have all the data from the table in a nice format.
    # But, we have data for way more bodies than we care about.
    # We also have a lot more data for each body than we care about.
    # Basically, we just want the name, position, and retrograde status.
    # We also want to do some parsing on the position to make it friendlier.
    # Rather than hardcoding all that into the previous step, we use a helper.
    result = munge_data(result)

    return result

def munge_data(planet_data):
    result = []
    for planet in planet_data[:10]:
        name = planet['Name'].strip()
        if name == 'Pluto-Charon': name = 'Pluto'
        is_retrograde = True if planet['Rx'] == 'Rx' else False
        split_position = planet['Position'].split()
        degrees = int(split_position[0])
        sign = get_zodiac_symbol(split_position[1])
        minutes = int(split_position[2].split("'")[0])  # Cut off the trailing apostrophe
        if minutes >= 30:
            degrees += 1

        result.append({'name': name,
                       'is_retrograde': is_retrograde,
                       'sign': sign,
                       'degrees': degrees})
    return result

def get_zodiac_symbol(abbrev):
    zodiac = {'ar': '♈',
              'ta': '♉',
              'ge': '♊',
              'cn': '♋',
              'le': '♌',
              'vi': '♍',
              'li': '♎',
              'sc': '♏',
              'sa': '♐',
              'cp': '♑',
              'aq': '♒',
              'pi': '♓'}
    return zodiac[abbrev]
