import requests
import pdb
import csv
import urllib.request, urllib.error, urllib.parse
from lxml import html
from lxml.etree import tostring as htmlstring
import re


S = requests.Session()

def parse(data):
    data = data.decode("utf-8")
    start = data.find(">Type") + 16
    n = 0
    while(data[start + n] != "\n"):
        n += 1
    type = data[start:start + n] 
    return type

def search(name):

    URL = "https://en.wikipedia.org/w/api.php"
    PARAMS = {
        "action": "query",
        "format": "json",
        "list": "search",
        "srsearch": name
    }

    R = S.get(url=URL, params=PARAMS).json()
    id = R['query']['search'][0]['pageid']
    wiki = "https://en.wikipedia.org/?curid=" + str(id)

    wikiEn = requests.get(wiki).content

    tree = html.fromstring(wikiEn)
    table = tree.xpath('//div[@id="p-lang"]')[0]

    link = table.xpath('//a[@hreflang="fr"]')[0].get("href")

    return requests.get(link).content

pathOutput = "../../data/output/"
fileName = pathOutput + "lobbyingClimatiqueActeurs.csv"
publicsFileName = pathOutput + "lobbyingClimatiquePublics.csv"

with open(fileName, "r",encoding="utf-8") as f1,\
    open(publicsFileName, "w", encoding="utf-8") as f2:

    publicsFile = csv.writer(f2)
    publicsFile.writerow(["idPublic", "type"])

    actors = list(csv.reader(f1))[1:]
    publics = list(filter(lambda actor : actor[2] == "public", actors))

    for public in publics:
        print(public[1])
        type = "null"
        try:
            data = search(public[1])
            type = parse(data)
        except:
            pass
        pubFile = [public[0], type]
        publicsFile.writerow(pubFile)

