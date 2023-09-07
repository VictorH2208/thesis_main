import string
import random
import csv
import json

from django.contrib.auth import get_user_model
User = get_user_model()

#shingles
def compute_shingles(word,c):
    shingles = set()
    for i in range(len(word) - c + 1):
        a = word[i:i + c]
        shingles.add(a)
    return list(shingles)

def compute_distance(x,y):
    sx = set(x)
    sy = set(y)
    return len(sx - sy) + len(sy - sx)

#bitonic sort
def merge(a,start,s,direction):
    step = s//2
    while step>0:
        for i in range(0,s,step*2):
            j=i+start
            for k in range(0,step,1):
                if (a[j][3]<a[j+step][3]) == direction:
                    a[j],a[j+step] = a[j+step],a[j]
                j = j+1
        step = step//2

def shift_bit_length(x):
    return 1<<(x-1).bit_length()

def pad_list(a):
    n = len(a)
    power = shift_bit_length(n)
    a += [[None,None,None,1000,False]] * (power - n)

def bitonic_sort(a):
    n = len(a)
    s=2
    while s <= n:
        i = 0
        while i < n:
            merge(a,i,s,0)
            if i + s == n:
                break
            merge(a,i+s,s,1)
            i += s*2
        s *= 2

#edit distance
def levenshtein_edit_distance(a,b):
    rows = len(a)+1
    cols = len(b)+1
    dist = [[0 for j in range(cols)] for i in range(rows)]
    for i in range(0, rows):
        dist[i][0] = i
    for j in range(0, cols):
        dist[0][j] = j

    for i in range(1,rows):
        for j in range(1,cols):
            if a[i-1] == b[j-1]:
                dist[i][j] = dist[i-1][j-1]
            else:
                dist[i][j] = 1+ min(dist[i-1][j],dist[i][j-1],dist[i-1][j-1])

    return dist[rows-1][cols-1]

def pad_name(name):
    return name.ljust(30,'.')

def match_exists(example,dateofbirth,nameslist,c,t):
    names = list(nameslist)
    name = pad_name(example)
    shingles = compute_shingles(name,c)
    name = [name,dateofbirth,shingles]
    for i in range(len(names)):
        distance = compute_distance(name[2],json.loads(names[i][2]))
        names[i] = [*names[i],distance, distance < (2*c-1)*t]

    pad_list(names)
    bitonic_sort(names)

    #finalCandidates = names[:15]
    finalCandidates = [list(names[i]) for i in range(min(15,len(names))) if names[i][-1]]
    for i in range(len(finalCandidates)):
        finalCandidates[i] += [levenshtein_edit_distance(name[0],finalCandidates[i][0])]
        
    match = 0
    matches = []
    for i in finalCandidates:
        if i[-2] <= t:
            if i[1] == dateofbirth:
                match += 1
                matches += [i[0]]

    if match > 0:
        return True, shingles
    else:
        return False, shingles

def deduplicate(name,dateofbirth,c,t):
    nameslist = list(User.objects.exclude(tokenId__exact='').values_list('name','dateofbirth','nameshingles'))
    print(nameslist)
    match, shingles = match_exists(name,dateofbirth,nameslist,c,t)
    return match, shingles