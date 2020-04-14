"use strict";

function createBarChart(barsGroup, currentData, [xAxis, yAxis]) {

    barsGroup.selectAll("rect")
     .data(currentData.destinations)
     .enter()
     .append("rect")
     .attr("class", "rect")
     .attr("x", d => x(d.name))
     .attr("y", d => y(d.count))
     .style("fill", d => color(d.name))
     .attr("height", d => height - y(d.count))
     .attr("width", x.bandwidth())
     .on("mouseover", tip.show)
     .on("mouseout", tip.hide)
  }

function countByPriv(dictSect) {
    return Object.keys(dictSect).map(priv => ({
        name: priv,
        count: d3.sum(Object.keys(dictSect[priv]).map(typePub => 
             d3.sum(Object.keys(dictSect[priv][typePub]).map(actor => dictSect[priv][typePub][actor]))
        ))
    }))
}

function countBySect(dict) {
    return Object.keys(dict).map(sect => ({
        name: sect,
        count: d3.sum(countByPriv(dict[sect]).map(priv => priv.count))
    }))
}

function createAxesLadders(data, height, width, funX) {
    var x = d3.scaleBand().range([0, width]).round(0.05)
    var y = d3.scaleLinear().range([height, 0])
    x.domain(data.map(funX))
    y.domain(data.map(d => d.count))

    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y)

    return [x, y, xAxis, yAxis]
}

function drawBars(barsGroup, data, x, y, xAxis, yAxis, height, width) {
    barsGroup.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)" )
  
    barsGroup.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Value ($)")
  
    barsGroup.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "rect")
        .style("fill", "steelblue")
        .attr("x", d => x(d.name))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.count))
        .attr("height", d => height - y(d.count))
}

function setOnclick(barsGroup, dict, height, width) {
    barsGroup.selectAll(".rect")
        .on("click", d => {
            var [x, y, xAxis, yAxis] = createAxesLadders(dict[d.name], height, width, d => d.name)
            drawBars(barsGroup, x, y, xAxis, yAxis, height, width)
        })
}

function initBars(barsGroup, dict, privates) {
    
    var dataBySect = countBySect(dict)

    var svgBars = d3.select("#svgBars")
    var height = svgBars.attr("height")
    var width = svgBars.attr("width")

    var [x, y, xAxis, yAxis] = createAxesLadders(dataBySect, height, width, d => d.name)

    drawBars(barsGroup, x, y, xAxis, yAxis, height, width)
    setOnclick(barsGroup, dict, height, width)
}
