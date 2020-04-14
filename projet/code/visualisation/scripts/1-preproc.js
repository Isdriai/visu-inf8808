"use strict";

var reducer = (s, symb) => s.replace(new RegExp(symb, 'g'), "")
var removeSymbols = (str, symbols) => symbols.reduce(reducer, str)
var listStrTolist = (strs, transfoFun) => removeSymbols(strs, ["\\[", "\\[", "\\]", "'", "{", "}"])
                                            .split(", ")
                                            .map(s => transfoFun(s))

var listStrTolistInt = (intsStr) => listStrTolist(intsStr, parseInt)

function preprocActors(actors) {
    var procActor = (dict, actor) => {
        var act = { id: parseInt(actor.id),
        name: actor.name,
        type: actor['public|private'], // hum tres mauvais choix de nom de colonne dans le csv ... 
        rapportsIds: listStrTolistInt(actor.idsRapport),
        sectors: listStrTolist(actor.sectors, s => s),
        province: actor.province === "" ? null : actor.province }
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
        sectors: listStrTolist(priv.sectors, s => s).map(aggreg) }
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

function sankeyPreproc(rapports, privates, publics) {
    var groupBySector = (dict, priv) => {
        var maxSector = ([name, nbr], priv2) => {
            if (priv2.name.includes("limat")) {
                return [name, nbr]
            } else {
                return priv2.value > nbr ? [priv2.name, priv2.value] : [name, nbr]
            }
        }
        var [maxSectorName, _] = priv.sectors.reduce(maxSector, ["", 0])
        var publicsPriv = linkPublicsByPrivateId(rapports, publics, priv.id)
        Object.values(publicsPriv).forEach(pub => {
            if (maxSectorName in dict) {
                if (priv.id in dict[maxSectorName]) {
                    if (pub.type in dict[maxSectorName]) {
                        dict[maxSectorName][priv.name][pub.type][pub.name] += pub.count
                    } else{
                        dict[maxSectorName][priv.name][pub.type] = {}
                        dict[maxSectorName][priv.name][pub.type][pub.name] = pub.count 
                    }
                } else {
                    dict[maxSectorName][priv.name] = {}
                    dict[maxSectorName][priv.name][pub.type] = {}
                    dict[maxSectorName][priv.name][pub.type][pub.name] = pub.count 
                }
            } else {
                dict[maxSectorName] = {}
                dict[maxSectorName][priv.name] = {}
                dict[maxSectorName][priv.name][pub.type] = {}
                dict[maxSectorName][priv.name][pub.type][pub.name] = pub.count 
            }})
        return dict
    }

    return Object.values(privates).reduce(groupBySector, {})
}