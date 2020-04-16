"use strict";

var reducer = (s, symb) => s.replace(new RegExp(symb, 'g'), "")
var removeSymbols = (str, symbols) => symbols.reduce(reducer, str)
var listStrTolist = (strs, transfoFun) => removeSymbols(strs, ["\\[", "\\[", "\\]", "'", "{", "}"])
                                            .split(", ")
                                            .map(s => transfoFun(s))

var listStrTolistInt = (intsStr) => listStrTolist(intsStr, parseInt)

function preprocActors(actors) {
    var provAbbr = new Set(["NL", "PE", "NS", "NB", "QC", "ON", "MB", "SK", "AB", "BC", "YT", "NT", "NU"])
    var procActor = (dict, actor) => {
        var act = { id: parseInt(actor.id),
        name: actor.name,
        type: actor['public|private'], // hum tres mauvais choix de nom de colonne dans le csv ... 
        rapportsIds: listStrTolistInt(actor.idsRapport),
        sectors: listStrTolist(actor.sectors, s => s),
        province: actor.province === "" ? null : provAbbr.has(actor.province) ? actor.province : "International" }
        dict[act.id] = act
        return dict
    }
    return actors.reduce(procActor, {})
}

function preprocPrivates(privates, actors) {
    // dans notre cas, on ne rencontre jamais deux fois le meme secteur
    var aggreg = (strTuple) => { 
        var tab = strTuple.split(":")
        return {name: tab[0], value: tab[1]}
    }
    
    var procPrivate = (dict, priv) => {
        var privId = parseInt(priv.id)
        var privateActor = { id: privId,
        name: actors[privId].name,
        sectors: listStrTolist(priv.sectors, s => s).map(aggreg),
        province: actors[privId].province
        }
        dict[privateActor.id] = privateActor
        return dict
    }
    return privates.reduce(procPrivate, {})
}

function preprocPublics(publics, actors) {
    return publics.reduce((dict, pub) => {
        var pubId = parseInt(pub.idPublic)
        var publicActor = { id: pubId,
                            type: pub.type,
                            name: actors[pubId].name
                        }
        dict[publicActor.id] = publicActor
        return dict
    }, {})
}

function preprocRapports(rapports) {
    var formatDate = d3.timeParse("%Y-%m-%d")
    var keptUniqueValues = (list) => {
        var values = new Set()
        list.forEach(v => values.add(v))
        return [...values]
    }
    var procRapport = (dict, rapport) => {
        var rap = { id: parseInt(rapport.idCom),
        privateId: listStrTolistInt(rapport.privatesIds)[0], // on remarquera qu'il y a toujours qu'une seule entreprise liée à un rapport
        publicsIds: keptUniqueValues(listStrTolistInt(rapport.publicsIds)),
        date: formatDate(rapport.date) }
        if (rap.privateId in dict) {
            dict[rap.privateId].push(rap)
        } else {
            dict[rap.privateId] = [rap]
        }
        return dict
    }
    return rapports.reduce(procRapport, {})
}

function linkPublicsByPrivateId(rapports, publics, privId) {
    var raps = rapports[privId]
    var fetchPublicsByRapport = (dict, rap) => {
        rap.publicsIds.forEach(pubId => {
            var pubActor = publics[pubId]
            if (pubId in dict) {
                dict[pubId].count += 1
            } else {
                dict[pubId] = {id: pubId, name: pubActor.name, type: pubActor.type, count: 1}
            }
        })
        return dict
    }
    return Object.values(raps).reduce(fetchPublicsByRapport, {})
}

function getSector(priSectors) {
    var maxSector = ([name, nbr], priv2) => {
        if (priv2.name.includes("limat")) {
            return [name, nbr]
        } else {
            return priv2.value > nbr ? [priv2.name, priv2.value] : [name, nbr]
        }
    }
    var [maxSectorName, _] = priSectors.reduce(maxSector, ["", 0])
    return maxSectorName
}

function preprocdict(rapports, privates, publics) {
    var groupBySector = (dict, priv) => {
        
        var maxSectorName = getSector(priv.sectors)
        var publicsPriv = linkPublicsByPrivateId(rapports, publics, priv.id)
        Object.values(publicsPriv).forEach(pub => {
            if (maxSectorName in dict) {
                if (priv.id in dict[maxSectorName]) {
                    if (pub.type in dict[maxSectorName]) {
                        dict[maxSectorName][priv.id][pub.type][pub.id] += pub.count
                    } else{
                        dict[maxSectorName][priv.id][pub.type] = {}
                        dict[maxSectorName][priv.id][pub.type][pub.id] = pub.count 
                    }
                } else {
                    dict[maxSectorName][priv.id] = {}
                    dict[maxSectorName][priv.id][pub.type] = {}
                    dict[maxSectorName][priv.id][pub.type][pub.id] = pub.count 
                }
            } else {
                dict[maxSectorName] = {}
                dict[maxSectorName][priv.id] = {}
                dict[maxSectorName][priv.id][pub.type] = {}
                dict[maxSectorName][priv.id][pub.type][pub.id] = pub.count 
            }})
        return dict
    }

    return Object.values(privates).reduce(groupBySector, {})
}

function preprocDate(rapports, privates, publics) {
    var publicsDate = {}
    var privatesDate = {}

    Object.keys(rapports).forEach(privId => {
        var rapport = rapports[privId]
        var sect = getSector(privates[privId].sectors)
        var date = rapport.date
        date.setDay(0)
        var privEntry = privatesDate[sect]

        if (typeof privEntry === 'undefined') {
            privatesDate[sect][date] = {
                date: date,
                count: 1
            } 
        } else {
            privatesDate[sect][date] = {
                date: date,
                count: +1
            } 
        }

        rapport.publicsIds.forEach(pubId => {
            var type = publics[pubId].type
            var publicEntry = publicsDate[type]
            if (typeof publicEntry === 'undefined') {
                publicsDate[type] = {}
                publicsDate[type][date] = {
                    date: date,
                    count: 1
                }
            } else {
                publicsDate[type][date] = {
                    date: date,
                    count: +1
                }
            }
        })
    })

    return [privatesDate, publicsDate]
}