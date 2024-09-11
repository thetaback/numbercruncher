import random
wd = "/home/thetaback/numbercruncher/seed_of_the_day"
i = open(f'{wd}/wordlist', "r")
o = open(f'{wd}/seed.txt', "w")
words = i.readlines()
a=random.randint(0,len(words)-1)
word=words[a].strip()
o.write(word)