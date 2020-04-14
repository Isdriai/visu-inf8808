"use strict";

function countSinglePriv(dictPriv) {
    return d3.sum(Object.keys(dictPriv).map(typePub => 
        d3.sum(Object.keys(dictPriv[typePub]).map(actor => dictPriv[typePub][actor]))
   ))
}

function countByPriv(dictSect) {
    return Object.keys(dictSect).map(priv => ({
        name: priv,
        count: countSinglePriv(dictSect[priv])
    }))
}

function countBySect(dict) {
    return Object.keys(dict).map(sect => ({
        name: sect,
        count: d3.sum(countByPriv(dict[sect]).map(priv => priv.count))
    }))
}

function countByProv(dict, privates) {
    var byProv = {}
    Object.keys(dict).forEach(sect => {
        Object.keys(dict[sect]).forEach(priv => {
            var prov = privates[priv].province
            var provEntry = byProv[prov]
            var countPriv = countSinglePriv(dict[sect][priv])
            if (typeof provEntry === 'undefined') {
                byProv[prov] = {
                    province: prov,
                    count: countPriv
                }
            } else {
                provEntry.count += countPriv
            }
        })
    })
    return Object.values(byProv)
}

function createAxesLadders(data, height, width, funX) {
    var x = d3.scaleBand().range([0, width])
    var y = d3.scaleLinear().range([height, 0])
    x.domain(data.map(funX))
    y.domain([0, d3.max(data.map(d => d.count))])

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y)

    return [x, y, xAxis, yAxis]
}

function drawBars(barsGroup, data, x, y, xAxis, yAxis, height, funX) {

    barsGroup.selectAll("*").remove()

    barsGroup.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "start")
        .attr("transform","translate(0,0)rotate(45)")
  
    barsGroup.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      
  
    barsGroup.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "rect")
        .style("fill", "steelblue")
        .attr("x", d => x(funX(d)))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count))
}

function setOnclick(barsGroup, dict, height, width) {
    barsGroup.selectAll(".rect")
        .on("click", d => {
            var countBypriv = countByPriv(dict[d.name])
            var [x, y, xAxis, yAxis] = createAxesLadders(countBypriv, height, width, d => d.name)
            drawBars(barsGroup, countBypriv, x, y, xAxis, yAxis, height, d => d.name)
        })
}

function initBars(barsGroup, barProvinceGroup, dict, privates) {
    
    var dataBySect = countBySect(dict)

    var svgBars = d3.select("#svgbarCharts")
    var heightBars = svgBars.attr("height")*0.5
    var widthBars = svgBars.attr("width")*0.5

    var [x, y, xAxis, yAxis] = createAxesLadders(dataBySect, heightBars, widthBars, d => d.name)

    drawBars(barsGroup, dataBySect, x, y, xAxis, yAxis, heightBars, d => d.name)
    setOnclick(barsGroup, dict, heightBars, widthBars)


    var svgBarProvince = d3.select("#svgbarProvince")
    var heightProv = svgBarProvince.attr("height")*0.5
    var widthProv = svgBarProvince.attr("width")*0.5

    var dataByProv = countByProv(dict, privates) 
    var [xPro, yPro, xAxisPro, yAxisPro] = createAxesLadders(dataByProv, heightProv, widthProv, (d => d.province))
    drawBars(barProvinceGroup, dataByProv, xPro, yPro, xAxisPro, yAxisPro, heightProv, d => d.province)

}
