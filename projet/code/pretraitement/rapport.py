import csv
import pdb

def recolt(data, id, pivot, index=0):
    elems = [data[pivot]]
    before = False
    after = False
    shift = 1
    while(not before or not after):
        befElem = data[pivot - shift] 
        if int(befElem[index]) == id:
            elems.append(befElem)
        else:
            before = True
        aftElem = data[pivot + shift]
        if int(aftElem[index]) == id:
            elems.append(aftElem)
        else:
            after = True
        shift += 1
    return elems

def search(data, id, index=0, mode="multiple"):
    id = int(id)
    start = 0
    end = len(data)
    while(True):
        half = int((start + end) / 2)
        elem = data[half]
        elemId = int(elem[index])
        if elemId == id:
            if mode == "single":
                return elem
            else:
                return recolt(data, id, half, index)
        elif elemId > id:
            end = half
        elif elemId < id:
            start = half

def getListIdsRapports(stringIdsRapports):
    subsToRemove = ["'", "[", "]", " "]
    for sub in subsToRemove:
        stringIdsRapports = stringIdsRapports.replace(sub, "")
    return list(map(lambda id: int(id), stringIdsRapports.split(",")))


pathInput = "../../data/input/"
primairesFile = pathInput + "Primaire.csv"
sujetsNameFile = pathInput +"Sujets.csv"

pathOutput = "../../data/output/"
fileName = pathOutput + "lobbyingClimatiqueActeurs.csv"
rapportPrivate = pathOutput + "lobbyingClimatiquePrivates.csv"


with open(fileName, "r", encoding="utf-8") as f1,\
    open(sujetsNameFile, "r", encoding="utf-8") as f2,\
    open(rapportPrivate, "w", encoding="utf-8") as f3,\
    open(primairesFile, "r", encoding="utf-8") as f4:

    sortedData = lambda x: int(x[0])

    next(f1)
    acteurs = list(csv.reader(f1))

    sujets = list(csv.reader(f2))[1:]
    sujets.sort(key=sortedData)

    privates = csv.writer(f3)
    privates.writerow(["id", "sectors"])

    primaires = list(csv.reader(f4))[1:]
    primairesByCompanies = primaires[:]
    primaires.sort(key=sortedData)
    primairesByCompanies.sort(key=lambda x: int(x[1]))

    size = len(acteurs)
    n = 0
    for acteur in acteurs:
        n += 1
        print(str(n) + "/" + str(size))
        if acteur[2] =="private":
            private = [acteur[0]]
            sectors = {}

            rapportId = getListIdsRapports(acteur[3])[0]
            idCompany = search(primaires, rapportId, mode="single")[1]
            idsRapportsCompany = list(map(lambda rap: rap[0], search(primairesByCompanies, idCompany, 1)))

            for rapId in idsRapportsCompany:
                rapportEntries = search(sujets, rapId)
                for rapportEntry in rapportEntries:
                    sector = rapportEntry[2]
                    if sector in sectors:
                        sectors[sector] += 1
                    else:
                        sectors[sector] = 1 

            private.append(sectors)
            privates.writerow(private)