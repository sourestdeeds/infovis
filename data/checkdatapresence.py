'''
This script reads the planets.csv data and computes what fraction of a given
planet property is present for planets discovered by a certain method.
'''


from csv import DictReader
import json


def parse():
    columns = ['pl_bmasse', 'pl_dens', 'pl_eqt', 'pl_imppar', 'pl_impparlim', 'pl_insol', 'pl_occdep', 'pl_orbeccen', 'pl_orbincl', 'pl_orblper', 'pl_orbper', 'pl_orbsmax', 'pl_orbtper', 'pl_rade', 'pl_ratdor', 'pl_ratror', 'pl_rvamp']
    data = {}

    with open('planets.csv', 'r') as f:
        reader = DictReader(filter(lambda line: not line.startswith('#'), f))
        
        for row in reader:
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
    
    with open('presence.txt', 'w') as f:
        print(formatstring % ('', *columns), file = f)
        
        for method in data:
            total, percolumn = data[method]
            fractions = []
            
            for column in columns:
                fraction = round((percolumn[column] / total) * 100.0)
                fractions.append(str(fraction) + '%')
            
            print(formatstring % ((methods[method] + ' (%4d)' % total), *fractions), file = f)
        
        print('', file = f)
        avg = {method: (sum(data[method][1].values()) / (data[method][0] * len(columns))) for method in data}
        lower, upper = min(avg.values()), max(avg.values())
        
        for entry in avg:
            avg[entry] -= lower
            avg[entry] /= (upper - lower)
        
        print(json.dumps(avg, indent = 4), file = f)
        

if __name__ == '__main__':
    main()

