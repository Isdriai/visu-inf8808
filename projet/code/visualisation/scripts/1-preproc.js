"use strict";

var reducer = (s, symb) => s.replace(new RegExp(symb, 'g'), "")
var removeSymbols = (str, symbols) => symbols.reduce(reducer, str)
var listStrTolist = (strs, transfoFun) => removeSymbols(strs, ["\\[", "\\[", "\\]", "'", "{", "}"])
                                            .split(", ")
                                            .map(s => transfoFun(s))

var listStrTolistInt = (intsStr) => listStrTolist(intsStr, parseInt)

// on va devoir recouper les données, on veut donc etre sur que ces dernieres soient triées 
var compareFun = (obj1, obj2) => obj1.id - obj2.id

function preprocActors(actors) {
    var procActor = (actor) => ({
        id: parseInt(actor.id),
        name: actor.name,
        type: actor['public|private'], // hum tres mauvais choix de nom de colonne dans le csv ... méchant Dobby
        rapportsIds: listStrTolistInt(actor.idsRapport),
        sectors: listStrTolist(actor.sectors, s => s),
        province: actor.province === "" ? null : actor.province
    })
    return actors.map(procActor).sort(compareFun)
}

function preprocPrivates(privates) {
    // dans notre cas, on ne rencontre jamais deux fois le meme secteur
    var aggreg = (strTuple) => { 
        var tab = strTuple.split(":")
        return {name: tab[0], value: tab[1]}
    }
    var procPrivate = (priv) => ({
        id: parseInt(priv.id),
        sectors: listStrTolist(priv.sectors, s => s).map(aggreg)
    })
    return privates.map(procPrivate).sort(compareFun)
}

function preprocPublics(publics) {
    return publics.map(pub => ({
        id: parseInt(pub.idPublic),
        type: pub.type
    })).sort(compareFun)
}

function preprocRapports(rapports) {
    var formatDate = d3.timeParse("%Y-%m-%d")
    var procRapport = (rapport) => ({
        id: parseInt(rapport.idCom),
        privateId: listStrTolistInt(rapport.privatesIds)[0], // on remarquera qu'il y a toujours qu'une seule entreprise liée à un rapport
        publicsIds: listStrTolistInt(rapport.publicsIds), // TODO : enlever les doublons
        date: formatDate(rapport.date)
    })
    return rapports.map(procRapport).sort(compareFun)
}



function sankeyPreproc(rapports, privates, publics) {
    var groupBySector = (dict, priv) => {
        var maxSector = ([name, nbr], priv2) => {
            if (priv2.name === "Climate") {
                return [name, nbr]
            } else {
                return priv2.value > nbr ? [priv2.name, priv2.value] : [name, nbr]
            }
        }
        var [maxSectorName, _] = priv.sectors.reduce(maxSector, ["", 0])
        publics = fetch public liés a ce priv avec public {name: , type: , count: }
        publics.forEach(public => {
            var recordPublic = {name: public.name, count: public.count}
            if (maxSector in dict) {
                if (public.type in dict[maxSector]) {
                    dict[maxSector][public.type].push(recordPublic)
                } 
            } else {
                dict[maxSector] = {}
                dict[maxSector][public.type] = [recordPublic]
            }})
        return dict
    }
    console.log("privates")
    console.log(privates)
    console.log("test")
    console.log(privates.reduce(groupBySector, {}))
}