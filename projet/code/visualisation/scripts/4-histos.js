"use strict";

function createLine(x, y) {
    return d3.line()
        .x(d => x(d.date))
        .y(d => y(d.count))
        .curve(d3.curveBasisOpen)
}

function createLadders(width, heightFocus, heightContext) {
    
    var xFocus = d3.scaleTime().range([0, width])
    var yFocus = d3.scaleLinear().range([heightFocus, 0])

    var xContext = d3.scaleTime().range([0, width])
    var yContext = d3.scaleLinear().range([heightContext, 0])    
    
    return [xFocus, yFocus, xContext, yContext]
}

function createAxes(xFocus, yFocus, xContext, localization) {
    var xAxisFocus = d3.axisBottom(xFocus).tickFormat(localization.getFormattedDate)
    var yAxisFocus = d3.axisLeft(yFocus)

    var xAxisContext = d3.axisBottom(xContext).tickFormat(localization.getFormattedDate)

    return [xAxisFocus, yAxisFocus, xAxisContext]
}

function createGroups() {
    // Groupe affichant le graphique principal (focus).
    var focus = svg.append("g")
        .attr("transform", "translate(" + marginFocus.left + "," + marginFocus.top + ")")

    // Groupe affichant le graphique secondaire (contexte).
    var context = svg.append("g")
        .attr("transform", "translate(" + marginContext.left + "," + marginContext.top + ")")

    return [focus, context]
}

function initHistos(groupHisto, byDatePriv, byDatePub, localization){

    var svgBars = d3.select("#svghistos")
    var heightHisto = svgBars.attr("height")*0.5
    var widthHisto = svgBars.attr("width")*0.5
    var heightHistoContext = heightHisto / 5

    var [xFocusPriv, yFocusPriv, xContextPriv, yContextPriv] = createLadders(widthHisto, heightHisto, heightHistoContext)
    var [xFocusPub, yFocusPub, xContextPub, yContextPub] = createLadders(widthHisto, heightHisto, heightHistoContext)

    var [xAxisFocusPriv, yAxisFocusPriv, xAxisContextPriv] = createAxes(xFocusPriv, yFocusPriv, xContextPriv, localization)
    var [xAxisFocusPub, yAxisFocusPub, xAxisContextPub] = createAxes(xFocusPub, yFocusPub, xContextPub, localization)

    var [focusPriv, contextPriv] = createGroups()
    var [focusPub, contextPub] = createGroups()

    var lineFocusPriv = createLine(xFocusPriv, yFocusPriv)
    var lineContextPriv = createLine(xContextPriv, yContextPriv)

    var lineFocusPub = createLine(xFocusPub, yFocusPub)
    var lineContextPpub = createLine(xContextPub, yContextPub)

    var brushPriv = d3.brushX()
        .extent([[0, 0], [widthHisto, heightHistoContext]])
        .on("brush", function () {
          brushUpdate(brush, focusPriv, lineFocusPriv, xFocusPriv, xContextPriv, xAxisFocusPriv, yAxisFocusPriv);
    });

    var brushPub = d3.brushX()
        .extent([[0, 0], [widthHisto, heightHistoContext]])
        .on("brush", function () {
          brushUpdate(brush, focusPub, lineFocusPub, xFocusPub, xContextPub, xAxisFocusPub, yAxisFocusPub);
    });

}
