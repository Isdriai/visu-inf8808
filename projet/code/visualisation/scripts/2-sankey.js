"use strict";



function prepareForSankey(links) {
    var n = 0
    var nodes = {}
    var pubs = new Set()
    links.forEach(link => {
        var sec = link.source
        if (!(sec in nodes)) {
            nodes[sec] = {node: n, name: sec}
        }
        n++
        var pub = link.target
        if (!(pub in nodes)) {
            nodes[pub] = {node: n, name: pub}
            pubs.add(pub)
        }
        n++
    })
    
    nodes = Object.values(nodes)

    var nodeMap = {}
    nodes.forEach(function(x) { nodeMap[x.name] = x; });

    links = links.map(function(x) {
      return {
        source: nodeMap[x.source],
        target: nodeMap[x.target],
        value: x.value
      }
    })
    return [nodes, links, pubs]
}

function computeNodesLinksInit (dictSankey) {
    var linksBySector = []
    var links = []
    Object.keys(dictSankey).forEach(sector => {
        var sectorsPublicsValue = {}
        var totSect = 0
        Object.keys(dictSankey[sector]).forEach(priv => {
            Object.keys(dictSankey[sector][priv]).forEach(typePub => {
                var countSectPubPriv = d3.sum(Object.values(dictSankey[sector][priv][typePub]))
                totSect += countSectPubPriv
                if (typePub in sectorsPublicsValue) {
                    sectorsPublicsValue[typePub] += countSectPubPriv
                } else {
                    sectorsPublicsValue[typePub] = countSectPubPriv
                }    
            })
        })
        linksBySector.push({name: sector, count: totSect, details: sectorsPublicsValue})
    })

    linksBySector = linksBySector.sort((sec1, sec2) => d3.descending(sec1.count, sec2.count)).slice(0, 10)

    linksBySector.forEach(sect => 
        Object.keys(sect.details).forEach(typePub => 
            links.push({source: sect.name, target: typePub, value: sect.details[typePub]}
            )
        )
    )

    return prepareForSankey(links)
}

function computeSelectLink (dictSector, publicType) {
    var links = []
    Object.keys(dictSector).forEach(priv => {
        var publicTypeEntries = dictSector[priv][publicType]
        if (typeof publicTypeEntries !== 'undefined') {
            Object.entries(publicTypeEntries).forEach(entry => {
                links.push({source: priv, target: entry[0], value: entry[1]})
            })
        }
    })
    return prepareForSankey(links)
}

function computeSelectPublicNode (dictSankey, typePub, zoomPriv) {
    if (zoomPriv === null) {
        var links = []
        Object.keys(dictSankey).forEach(sect => {
            Object.keys(dictSankey[sect]).forEach(priv => {
                var sectTypePubEntries = dictSankey[sect][priv][typePub]
                if (typeof sectTypePubEntries !== 'undefined') {
                    Object.keys(sectTypePubEntries).forEach(actorPub => {
                        links.push({source: sect, target: actorPub, value: sectTypePubEntries[actorPub]})
                    })
                }
            })
        })
        return prepareForSankey(links)
    } else {
        return computeSelectLink(dictSankey[zoomPriv], typePub)
    }
}

function computeSelectPrivateNode (dictSankeySect, zoomPub) {
    var links = []
    Object.keys(dictSankeySect).forEach(priv => {
        Object.keys(dictSankeySect[priv]).forEach(typePub => {
            var dictTypePub = dictSankeySect[priv][typePub]
            if (zoomPub === null) {
                var count = d3.sum(Object.keys(dictTypePub).map(pub => dictSankeySect[priv][typePub][pub]))
                links.push({source: priv, target: typePub, value: count})
            } else if (typePub === zoomPub) {
                Object.keys(dictSankeySect[priv][typePub]).forEach(pub => {
                    links.push({source: priv, target: pub, value: dictTypePub[pub]})
                })
            }                
        })
    })
    

    return prepareForSankey(links)
}

var zooms = (() => {
    var [zoomPriv, zoomPub] = [null, null] 

    return {
        getZoomPriv: () => zoomPriv,
        getZoomPub: () => zoomPub,
        setZoomPriv: (zPriv) => {zoomPriv = zPriv},
        setZoomPub: (zPub) => {zoomPub = zPub},
        reset: () => {
            zoomPriv = null
            zoomPub = null
        }
    }
})()

function setOnClick(sankeyGroup) {

    sankeyGroup.selectAll(".link").on("click", d => {
        if (zooms.getZoomPub() === null &&  zooms.getZoomPriv() === null) {
            var [nodesSub, linksSub, pubsSub] = computeSelectLink(dict[d.source.name], d.target.name)
            drawSankey(sankeyGroup, nodesSub, linksSub, pubsSub)
        }
    })
        
    sankeyGroup.selectAll(".node.pub").on("click", d => {
        if (zooms.getZoomPub() === null) {
            var [nodesSub, linksSub, pubsSub] = computeSelectPublicNode(dict, d.name, zooms.getZoomPriv())
            drawSankey(sankeyGroup, nodesSub, linksSub, pubsSub)
            zooms.setZoomPub(d.name)
        } 
    })
        
    sankeyGroup.selectAll(".node.priv").on("click", d => {
        if (zooms.getZoomPriv() === null) {
            var [nodesSub, linksSub, pubsSub] = computeSelectPrivateNode(dict[d.name], zooms.getZoomPub())
            drawSankey(sankeyGroup, nodesSub, linksSub, pubsSub)
            zooms.setZoomPriv(d.name)
        }
    })
}
    

function drawSankey (sankeyGroup, nodes, links, pubs) {

    sankeyGroup.selectAll("*").remove()

    var sankeyRect = d3.select("#svgsankey")
    
    var sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(10)
        .size([sankeyRect.attr("width")*0.5, sankeyRect.attr("height")*0.5])
        .nodes(nodes)
        .links(links)

    var graph = sankey()

    var pubsArray = Array.from(pubs)
    var color = d3.scaleOrdinal().domain(pubsArray)
    .range(d3.schemeAccent)

    var link = sankeyGroup.append("g")
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.5)
            .selectAll("path")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("stroke", d => color(d.target.name))
            .attr("d", d3.sankeyLinkHorizontal())
            .style("stroke-width", d => d.width)

    link.append("title")
        .text(function(d) {
            return d.source.name + " → " + d.target.name + "\n" + d.value 
        })

    var node = sankeyGroup.append("g").selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", d => {
                var classBase = "node"
                return pubs.has(d.name) ? classBase + " pub" : classBase + " priv"
            })
            .attr("transform", function(d) { 
              return "translate(" + d.x0 + "," + d.y0 + ")"
            })
    
    node.append("rect")
        .attr("height", d => (d.y1 - d.y0) * 1.2)
        .attr("width", sankey.nodeWidth()) 
        .attr("y", (d, i) => i-1)
        .attr("fill", d => (d.name in pubs) ? color(d.name) : "black")
        .append("title")
        .text(function(d) { 
          return d.name + "\n" + d.value
        })
        
    node.append("text")
        .attr("x", d => d.layer === 0 ? -100 : 100)
        .attr("y", function(d) { return d.y ; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .attr("text-anchor", "start");

    setOnClick(sankeyGroup)
    return sankey
}

function initSankey (sankeyGroup, dictSankey) {
    var [nodes, links, pubs] = computeNodesLinksInit(dictSankey)
    drawSankey(sankeyGroup, nodes, links, pubs)
}