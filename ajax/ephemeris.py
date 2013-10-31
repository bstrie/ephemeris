import logging
import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify
from logging import FileHandler

app = Flask(__name__)
file_handler = FileHandler('/web/www/ephemeris/ajax/server.log')
file_handler.setLevel(logging.ERROR)
app.logger.addHandler(file_handler)

@app.route('/ephemeris/ajax/coordinates')
def coordinates():
    response = requests.get(
        'http://serennu.com/astrology/ephemeris.php',
        params = {
            'inday': '1',
            'inmonth': '11',
            'inyear': '2013',
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
    table = soup.find('table')
    result = []
    columns = []
    header = table.find('tr')
    for cell in header.find_all('td'):
        columns.append(cell.string)

    for row in header.find_all_next('tr'):
        result.append({})
        for idx, cell in enumerate(row.find_all('td')):
            result[-1][columns[idx]] = cell.string

    return jsonify(foo=result)

if __name__ == '__main__':
    app.run(port=7901)
