# coding: utf-8

import csv
import urllib.request, urllib.error, urllib.parse
import re
import pdb
from lxml import html
from lxml.etree import tostring as htmlstring
import requests
import random
from time import sleep

class Rapport():
    def __init__(self, id, privateId, publicsId, date):
        self.id = id
        self.privateId = privateId
        self.publicsId = publicsId
        self.date = date 
    
class Actor():
    def __init__(self, id, name, rapportsId, type, sectors, province):
        self.id = id
        self.name = name
        self.rapportsId = rapportsId
        self.type = type
        self.sectors = sectors
        self.province = province

def recolt(data, id, pivot):
    elems = [data[pivot]]
    before = False
    after = False
    shift = 1
    while(not before or not after):
        befElem = data[pivot - shift] 
        if int(befElem[0]) == id:
            elems.append(befElem)
        else:
            before = True
        aftElem = data[pivot + shift]
        if int(aftElem[0]) == id:
            elems.append(aftElem)
        else:
            after = True
        shift += 1
    return elems

def search(data, id):
    id = int(id)
    start = 0
    end = len(data)
    while(True):
        half = int((start + end) / 2)
        elem = data[half]
        elemId = int(elem[0])
        if elemId == id:
            return recolt(data, id, half)
        elif elemId > id:
            end = half
        elif elemId < id:
            start = half

def fetchProvince(id):
    site = "https://lobbycanada.gc.ca"
    uri = "/app/secure/ocl/lrs/do/cmmLgPblcVw?comlogId=" + str(id)

    page = requests.get(site + uri)
    tree = html.fromstring(page.content)
    table = tree.xpath('//table[@class="table"]')[0]
    uri = re.search(b'(?<=<a href=\")(.*)(?=\" target)', htmlstring(table)).groups(1)[0].decode("utf-8")

    page = requests.get(site + uri)
    tree = html.fromstring(page.content)
    uri = tree.get_element_by_id("regId").xpath('//option')[0].get("value")

    page = requests.get((site + uri).replace("#regStart", "") + "#indirect")
    tree = html.fromstring(page.content)
    addressHtml = tree.get_element_by_id("indirect").xpath('//div[@class="col-sm-5"]')[0]
    province = re.search(b'(?<=\\n)[^\\n]*(?=,)[^;]*;([A-Z][A-Z0-9]*)', htmlstring(addressHtml)).groups(1)[0].decode("utf-8")

    return province

def getProvince(id):
    while(True):
        try:
            return fetchProvince(id)
        except AttributeError:
            print("erreur avec rapport " + str(id))
            return "International"
        except:
            sleep(1)

def concatSectors(sujets):
    suj = {}
    for sujet in sujets:
        id = sujet[0]
        secteur = sujet[2]
        if id in suj:
            suj[id].append(secteur)
        else:
            suj[id] = [secteur]
    return suj

def getPrivateName(primaire):
    privateName = primaire[2]
    if privateName == "null":
        privateName = primaire[3]
    return privateName

def getPublicNames(titulaires):
    publicNames = []
    for titulaire in titulaires:
        publicName = titulaire[6]
        if publicName == "Other (Specify)":
            publicName = titulaire[5]
        publicNames.append(publicName)
    return publicNames

def linkActors(names, actors, rapportId, type, sectors, province):
    ids = []
    for name in names:
        if name in actors:
            actor = actors[name]
            if rapportId not in actor.rapportsId:
                actor.rapportsId.append(rapportId)
            ids.append(actor.id)
        else:
            n = len(actors)
            id = n + 1
            actor = Actor(id, name, [rapportId], type, sectors, province)
            actors[name] = actor
            ids.append(id)
    return ids

if __name__ == "__main__":
    # input files
    pathInput = "../../data/input/"
    primairesNameFile = pathInput + "Primaire.csv"
    sujetsNameFile = pathInput + "Sujets.csv"
    titulairesNameFile = pathInput + "Titulaires.csv"

    #output files
    pathOutput = "../../data/output/"
    climatFile = pathOutput + "lobbyingClimatiqueRapports.csv"
    actorsFile = pathOutput +"lobbyingClimatiqueActeurs.csv"

    with open(primairesNameFile, encoding="utf-8") as f1,\
        open(sujetsNameFile, encoding="utf-8") as f2,\
        open(titulairesNameFile, encoding="utf-8") as f3,\
        open(climatFile, "w", encoding="utf-8") as f4,\
        open(actorsFile, "w", encoding="utf-8") as f5:

        sortedData = lambda x: int(x[0])

        primaires = list(csv.reader(f1))[1:]
        primaires.sort(key=sortedData)

        sujets = list(csv.reader(f2))[1:]

        titulairesData = list(csv.reader(f3))[1:]
        titulairesData.sort(key=sortedData)

        lobbying = csv.writer(f4)
        lobbying.writerow(["idCom", "privatesIds", "publicsIds", "date"])

        actorsFile = csv.writer(f5)
        actorsFile.writerow(["id", "name", "public|private", "idsRapport", "sectors", "province"])

        rapports = {}
        actors = {}

        n = 0
        for rapportId, sectors in concatSectors(sujets).items(): 
            if "limat" in " ".join(sectors):
                n += 1
                print("n : " + str(n))
                province = getProvince(rapportId)
                primaire = search(primaires, rapportId)[0]
                titulaires = search(titulairesData, rapportId)
                if rapportId in rapports:
                    rapport = rapports[rapportId]
                    publicsName = getPublicNames(titulaire)
                    rapport.publicsId.append(linkActors(publicNames, actors, rapportId, "public", [], ""))
                else:
                    date = primaire[7]
                    privateName = getPrivateName(primaire)
                    idPrivate = linkActors([privateName], actors, rapportId, "private", sectors, province)
                    publicNames = getPublicNames(titulaires)
                    idsPublic = linkActors(publicNames, actors, rapportId, "public", [], "")
                    rapport = Rapport(rapportId, idPrivate, idsPublic, date)
                    rapports[rapportId] = rapport

        try:
            for i, rapport in rapports.items():
                lobbying.writerow([rapport.id, rapport.privateId, rapport.publicsId, rapport.date])

            for i, actor in actors.items():
                actorsFile.writerow([actor.id, actor.name, actor.type, actor.rapportsId, actor.sectors, actor.province])
        except:
            pdb.set_trace()