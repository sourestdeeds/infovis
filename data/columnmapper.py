'''
This script creates a JSON object which maps a column name from planets.csv
(e. g. "pl_orbper") to its description (in this case, "Orbital Period [days]").
The resulting JSON object is incorporated in datahandler.js and used for
displaying tooltips.
'''


import json


def main():
    HEADER = '# COLUMN '
    obj = {}

    with open('planets.csv', 'r') as f:
        for line in f:
            if line.startswith(HEADER):
                name, description = (line[len(HEADER):]).split(':')
                obj[name.strip()] = description.strip()
    
    with open('columns.json', 'w') as f:
        f.write(json.dumps(obj, sort_keys = True, indent = 4))


if __name__ == '__main__':
    main()

