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

/**
 * Crée une ligne qui sera ajouté à un graphique
 * 
 * @param g         Le groupe SVG dans lequel le graphique doit être dessiné.
 * @param datum     Données liées à cette LineChart.
 * @param line      La fonction permettant de dessiner les lignes du graphique.
 * @param color     L'échelle de couleurs ayant une couleur associée à un nom de rue.
 * @param name      Nom à donner à la LineChart.
 */
function createLineChart(g, datum, line, color, name) {
    return g.append("path")
      .datum(datum)
      .attr("class", "line")
      .attr("d", line)
      .style("stroke", color(name))
      .attr("fill", "none")
  }

/**
 * Crée le graphique focus.
 *
 * @param g         Le groupe SVG dans lequel le graphique doit être dessiné.
 * @param sources   Les données à utiliser.
 * @param line      La fonction permettant de dessiner les lignes du graphique.
 * @param color     L'échelle de couleurs ayant une couleur associée à un nom de rue.
 */
function createFocusLineChart(g, sources, line, color) {
    // TODO: Dessiner le graphique focus dans le groupe "g".
    // Pour chacun des "path" que vous allez dessiner, spécifier l'attribut suivant: .attr("clip-path", "url(#clip)").
    Object.keys(sources).forEach(sect => {
        createLineChart(g, sources[sect], line, color, sect).attr("clip-path", "url(#clip)")
    })
  }
  
  
  /**
   * Crée le graphique contexte.
   *
   * @param g         Le groupe SVG dans lequel le graphique doit être dessiné.
   * @param sources   Les données à utiliser.
   * @param line      La fonction permettant de dessiner les lignes du graphique.
   * @param color     L'échelle de couleurs ayant une couleur associée à un nom de rue.
   */
function createContextLineChart(g, sources, line, color) {
    Object.keys(sources).forEach(sect => {
        createLineChart(g, sources[sect], line, color, sect)
    })
}

function createAxes(xFocus, yFocus, xContext, localization) {
    var xAxisFocus = d3.axisBottom(xFocus)
    var yAxisFocus = d3.axisLeft(yFocus)
    var xAxisContext = d3.axisBottom(xContext)
    return [xAxisFocus, yAxisFocus, xAxisContext]
}

function createGroups(group, height) {
    var focus = group.append("g")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")

    var context = group.append("g")
        .attr("transform", "translate(" + 0 + "," + height + ")")

    return [focus, context]
}

/**
 * Fichier permettant de générer la légende et de gérer les interactions de celle-ci.
 */


/**
 * Crée une légende à partir de la source.
 *
 * @param svg       L'élément SVG à utiliser pour créer la légende.
 * @param sources   Données triées par nom de rue et par date.
 * @param color     Échelle de 10 couleurs.
 */
function legend(svg, sources, color) {
    var node = svg.node()
    var width = node.getAttribute("width")
    var height = node.getAttribute("height")
  
    var legend = svg.append("g")
      .selectAll("g")
      .data(sources)
      .enter()
      .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
          var heightCase = height / (sources.length * 2)
          var x = width / 15;
          var y = 50 + i * heightCase;
          return 'translate(' + x + ',' + y + ')'
        })
  
    legend.append('rect')
      .attr('width', width / 125)
      .attr('height', height / 50)
      .style('fill', function(d) {
        return d.name === "Moyenne" ? "#000000" : color(d.name)
      })
      .style('stroke', color)
  
    legend.append('text')
      .attr('x', 20)
      .attr('y', 10)
      .text(function(d) { return d.name })
  }

function domainColor(color, data) {
    var sects = Object.keys(data)
    color.domain(sects)
}
  
function linkAxisBrushes(context, xAxisContext, brush, heightHisto) {
    context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + heightHisto + ")")
      .call(xAxisContext)

    context.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", -6)
      .attr("height", heightHisto + 7)
}

function brushUpdate(brush, g, line, xFocus, xContext, xAxis, yAxisFocus) {
    // brush et yAxisFocus inutiles
    var s = d3.event.selection || xContext.range()
    var inr = xContext.invert
    xFocus.domain(s.map(inr, xContext))
    var places = g.selectAll(".line")
    places.attr("d", line)
    var axe = d3.select(".x.axis") // l'id a été ajouté dans le fichier main.js
    axe.call(xAxis)
  }
  
function setDomains(xFocus, yFocus, xContext, yContext, data) {
    
    var dateMin = d3.min(Object.values(data).map(d => d3.min(d.map(elem => elem.date))))
    var dateMax = d3.max(Object.values(data).map(d => d3.max(d.map(elem => elem.date))))
    var countMin = 0
    var countMax = d3.max(Object.values(data).map(d => d3.max(d.map(elem => elem.count))))

    xFocus.domain([dateMin, dateMax])
    xContext.domain([dateMin, dateMax])
    yFocus.domain([countMin, countMax])
    yContext.domain([countMin, countMax])
}

function initHistos(groupPriv, groupPub, byDatePriv, byDatePub, localization){

    // meme dimension pr les deux graphes
    var svgBars = d3.select("#svghistosPriv")
    var heightHisto = svgBars.attr("height")*0.5
    var widthHisto = svgBars.attr("width")*0.5
    var heightHistoContext = heightHisto / 5

    var [xFocusPriv, yFocusPriv, xContextPriv, yContextPriv] = createLadders(widthHisto, heightHisto, heightHistoContext)
    var [xFocusPub, yFocusPub, xContextPub, yContextPub] = createLadders(widthHisto, heightHisto, heightHistoContext)

    setDomains(xFocusPriv, yFocusPriv, xContextPriv, yContextPriv, byDatePriv)
    setDomains(xFocusPub, yFocusPub, xContextPub, yContextPub, byDatePub)

    var [xAxisFocusPriv, yAxisFocusPriv, xAxisContextPriv] = createAxes(xFocusPriv, yFocusPriv, xContextPriv, localization)
    var [xAxisFocusPub, yAxisFocusPub, xAxisContextPub] = createAxes(xFocusPub, yFocusPub, xContextPub, localization)

    var [focusPriv, contextPriv] = createGroups(groupPriv, heightHisto)
    var [focusPub, contextPub] = createGroups(groupPub, heightHisto)

    var lineFocusPriv = createLine(xFocusPriv, yFocusPriv)
    var lineContextPriv = createLine(xContextPriv, yContextPriv)

    var lineFocusPub = createLine(xFocusPub, yFocusPub)
    var lineContextPub = createLine(xContextPub, yContextPub)

    /*var brushPriv = d3.brushX()
        .extent([[0, 0], [widthHisto, heightHistoContext]])
        .on("brush", function () {
          brushUpdate(brushPriv, focusPriv, lineFocusPriv, xFocusPriv, xContextPriv, xAxisFocusPriv, yAxisFocusPriv);
    })

    var brushPub = d3.brushX()
        .extent([[0, 0], [widthHisto, heightHistoContext]])
        .on("brush", function () {
          brushUpdate(brushPub, focusPub, lineFocusPub, xFocusPub, xContextPub, xAxisFocusPub, yAxisFocusPub);
    })*/

    var colorPriv = d3.scaleOrdinal(d3.schemeCategory10)
    var colorPub = d3.scaleOrdinal(d3.schemeCategory10)

    domainColor(colorPriv, byDatePriv)
    domainColor(colorPub, byDatePub)

    // Axes focus
    focusPriv.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + heightHisto + ")")
      .call(xAxisFocusPriv)

    focusPriv.append("g")
      .attr("class", "y axis")
      .call(yAxisFocusPriv)

      // Axes focus
    focusPub.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + heightHisto + ")")
        .call(xAxisFocusPub)

    focusPub.append("g")
        .attr("class", "y axis")
        .call(yAxisFocusPub)

    /***** Création du graphique contexte *****/
    createContextLineChart(contextPriv, byDatePriv, lineContextPriv, colorPriv)
    createContextLineChart(contextPub, byDatePub, lineContextPub, colorPub)


    createFocusLineChart(groupPriv, byDatePriv, lineFocusPriv, colorPriv)
    createFocusLineChart(groupPub, byDatePub, lineFocusPub, colorPub)

    // Axes contexte

    //linkAxisBrushes(contextPriv, xAxisContextPriv, brushPriv, heightHisto)
    //linkAxisBrushes(contextPub, xAxisContextPub, brushPub, heightHisto)
    
    /***** Création de la légende *****/
    legend(groupPriv, byDatePriv, colorPriv)
    legend(groupPub, byDatePub, colorPub)
}
