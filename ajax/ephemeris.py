import dateutil.parser
import logging
import requests
import time
from bs4 import BeautifulSoup
from datetime import timedelta
from flask import Flask, jsonify, request
from logging import FileHandler

app = Flask(__name__)
file_handler = FileHandler('/web/www/ephemeris/ajax/server.log')
file_handler.setLevel(logging.ERROR)
app.logger.addHandler(file_handler)

@app.route('/ephemeris/ajax/coordinates')
def coordinates():
    date_param = request.args.get('date', '')
    today = dateutil.parser.parse(date_param)
    yesterday = today - timedelta(days=1)
    today_data = scrape_data_for_date(today)
    yesterday_data = scrape_data_for_date(yesterday)
    return jsonify(today=today_data, yesterday=yesterday_data)

def scrape_data_for_date(date):
    # http://serennu.com/astrology/ephemeris.php?inday=01&inmonth=11&inyear=2013&inhours=00&inmins=00&insecs=00&insort=type&z=0&gh=g&addobj=&inla=&inlo=&h=P
    response = requests.get(
        'http://serennu.com/astrology/ephemeris.php',
        params = {
            'inday': date.day,
            'inmonth': date.month,
            'inyear': date.year,
            'inhours': '00',
            'inmins': '00',
            'insecs': '00',
            'insort': 'type',
            'z': '0',  # "0" indicates a zodiac of "Sidereal - Fagan/Bradley"
            'gh': 'g',
            'addobj': '',
            'inla': '',
            'inlo': '',
            'h': 'P'
        })
    html = response.text
    soup = BeautifulSoup(html)
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
    # But, we only care about the major solar system bodies,
    # We also have a lot more data for each body than we care about.
    # Basically, we just want the name, position, and retrograde status.
    # We also want to do some parsing on the position to make it friendlier.
    # So rather than hardcoding all that into the previous step, we use a helper.
    result = massage_data(result)

    return result

def massage_data(planet_data):
    result = []
    for planet in planet_data[:10]:
        name = planet['Name'].strip()
        retrograde = True if planet['Rx'] == 'Rx' else False
        split_position = planet['Position'].split()
        degrees = int(split_position[0])
        sign = split_position[1]
        minutes = int(split_position[2].split("'")[0])  # Cut off the trailing apostrophe
        if minutes >= 30:
            degrees += 1

        result.append({'name': name,
                       'retrograde': retrograde,
                       'sign': sign,
                       'degrees': degrees})
    return result

if __name__ == '__main__':
    app.run(port=7901)
