'''
This script reads the planets.csv data and computes what fraction of a given
planet property is present for planets discovered by a certain method.
'''


from csv import DictReader


def parse():
    columns = None
    data = {}

    with open('planets.csv', 'r') as f:
        reader = DictReader(filter(lambda line: not line.startswith('#'), f))
        
        for row in reader:
            if not columns:
                columns = [c for c in row.keys() if c != 'pl_discmethod' and c.startswith('pl_')]
                columns.sort()
        
            method = row['pl_discmethod']
            
            if method not in data:
                data[method] = [0, {c: 0 for c in columns}]
            
            data[method][0] += 1
            
            for column in columns:
                if row[column] != '':
                    data[method][1][column] += 1

    return data, columns


def main():
    data, columns = parse()
    
    methods = {method: ''.join(filter(lambda c: c.upper() == c and c != ' ', method)) for method in data}    
    colwidth = max([len(column) for column in columns])

    formatstring = ('%%%ds ' % colwidth) * len(columns)
    formatstring += ('%%%ds' % colwidth)
    
    print(formatstring % ('', *columns))
    
    for method in data:
        total, percolumn = data[method]
        fractions = []
        
        for column in columns:
            fraction = round((percolumn[column] / total) * 100.0)
            fractions.append(str(fraction) + '%')
        
        print(formatstring % ((methods[method] + ' (%4d)' % total), *fractions))


if __name__ == '__main__':
    main()

