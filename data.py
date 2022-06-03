import pandas as pd
import csv

from regex import P

df = pd.read_csv('netflix_titles.csv')

'''
na value count :

director 2634 ?
cast 825 ?

country 831
date_added 10
rating 4
duration 3 

'''

print(df.isna().sum())


print(df['rating'].value_counts())
#print((df['rating'] == '84 min').sum())
#print(df['rating'].value_counts())


'''
TV-Y : 適合所有兒童
TV-Y7 : 為了7歲以上的幼童設計
TV-G : 適合所有年齡
TV-PG : 不適合8歲以下兒童觀看
TV-14 : 不適合年齡低於14歲兒童的內容
TV-MA : 不適合年齡低於17歲的兒童

'''

tv_rating = ['TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA']

'''
G : 所有年齡皆可觀賞
PG : 一些內容可能不適合兒童觀看
PG-13 : 一些內容不適合13歲以下兒童觀看
R : 未滿17歲須由家長加護人陪同
NC-17 : 17歲以下不得觀賞
'''
movie_rating = ['G', 'PG', 'PG-13', 'R', 'NC-17']

print(df['rating'].isin(tv_rating + movie_rating).count())

d = {}
for row in df['country'].dropna():
    for c in row.split(', '):
        if c not in d:
            d[c] = 1
        else:
            d[c] += 1



gen = {}
for row in df['listed_in'].dropna():
    for g in row.split(', '):
        if g not in gen:
            gen[g] = 1
        else:
            gen[g] += 1

print(len(gen))
print(gen)


# print(df['duration'])
# print(df['duration'][0].split(' ')[0])
# df = df[~df['duration'].isna()]
# df['duration'] = df['duration'].map(lambda x : int(x.split(' ')[0]))
# print(df[df['type'] == 'Movie']['duration'])




# def transform(countrys):
#     o = []
#     for c in countrys.split(', '):
#         if c :
#             o.append(c.replace(' ', '_'))
#     return ', '.join(o)


# df = df[~df['country'].isna()]
# df = df[~df['listed_in'].isna()]
# df['country'] = df['country'].apply(transform)
# df['listed_in'] = df['listed_in'].apply(transform)

# df.to_csv('netflix_v2.csv', index=False)


imgs = pd.read_csv('https://raw.githubusercontent.com/zihong518/data_visualization/master/data.csv')
print(imgs)