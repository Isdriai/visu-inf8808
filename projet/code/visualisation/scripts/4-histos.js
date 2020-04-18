"use strict";

function createLine(x, y) {
    return d3.line()
        .x(d => x(d.date))
        .y(d => y(d.count))
        .curve(d3.curveMonotoneX) 
        // on voit bien les extremes mais on garde une certaine courbure pr garder une certaine esthétique,
        // la ou avec curveOpenBasis on perdait les extremes
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
function createLineChart(g, datum, line, color, name, id) {
    return g.append("path")
      .datum(datum)
      .attr("class", "line" + id)
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
        createLineChart(g, sources[sect], line, color, sect, "Focus").attr("clip-path", "url(#clip)")
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
        createLineChart(g, sources[sect], line, color, sect, "Context")
    })
}

function createAxes(xFocus, yFocus, xContext) {
    var xAxisFocus = d3.axisBottom(xFocus)
    var yAxisFocus = d3.axisLeft(yFocus)
    var xAxisContext = d3.axisBottom(xContext)
    return [xAxisFocus, yAxisFocus, xAxisContext]
}

function createGroups(group, height) {
    var focus = group.append("g")
        .attr("transform", "translate(" + 0 + "," + 0 + ")")

    var context = group.append("g")
        .attr("transform", "translate(" + 0 + "," + height * 1.1 + ")")

    return [focus, context]
}


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

function brushUpdate(g, line, xFocus, xContext, xAxis, id) {
    console.log("\n\n\n\n")
    var s = d3.event.selection || xContext.range()
    console.log(s)
    var inr = xContext.invert
    console.log(inr)
    console.log(s.map(inr, xContext))
    xFocus.domain(s.map(inr, xContext))
    var lines = d3.selectAll(".lineFocus")
    console.log(lines)
    lines.attr("d", line)
    var axe = d3.select("#xAxis" + id) 
    console.log(axe)
    axe.call(xAxis)
    console.log("\n\n\n\n")
  }
  
function setDomains(xFocus, yFocus, xContext, yContext, data) {
    
    var dateMin = d3.min(Object.values(data).map(d => d3.min(d.map(elem => elem.date))))
    var dateMax = d3.max(Object.values(data).map(d => d3.max(d.map(elem => elem.date))))
    var countMax = d3.max(Object.values(data).map(d => d3.max(d.map(elem => elem.count))))

    xFocus.domain([dateMin, dateMax])
    xContext.domain([dateMin, dateMax])
    yFocus.domain([0, countMax])
    yContext.domain([0, countMax])
}

function setAxes(focus, height, xAxis, yAxis, idXAxis) {
  focus.append("g")
    .attr("class", "x axis")
    .attr("id", "xAxis" + idXAxis)
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

    if (yAxis !== null) {
      focus.append("g")
      .attr("class", "y axis")
      .call(yAxis)  
    }
}

function setBrush(context, brush, height) {
  context.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", -6)
      .attr("height", height);
}

function initHistos(groupPriv, groupPub, byDatePriv, byDatePub){

    // meme dimension pr les deux graphes
    var svgBars = d3.select("#svghistosPriv")
    var heightHisto = svgBars.attr("height")*0.5
    var widthHisto = svgBars.attr("width")*0.5
    var heightHistoContext = heightHisto / 5

    var [xFocusPriv, yFocusPriv, xContextPriv, yContextPriv] = createLadders(widthHisto, heightHisto, heightHistoContext)
    var [xFocusPub, yFocusPub, xContextPub, yContextPub] = createLadders(widthHisto, heightHisto, heightHistoContext)

    setDomains(xFocusPriv, yFocusPriv, xContextPriv, yContextPriv, byDatePriv)
    setDomains(xFocusPub, yFocusPub, xContextPub, yContextPub, byDatePub)

    var [xAxisFocusPriv, yAxisFocusPriv, xAxisContextPriv] = createAxes(xFocusPriv, yFocusPriv, xContextPriv)
    var [xAxisFocusPub, yAxisFocusPub, xAxisContextPub] = createAxes(xFocusPub, yFocusPub, xContextPub)

    var [focusPriv, contextPriv] = createGroups(groupPriv, heightHisto)
    var [focusPub, contextPub] = createGroups(groupPub, heightHisto)

    var lineFocusPriv = createLine(xFocusPriv, yFocusPriv)
    var lineContextPriv = createLine(xContextPriv, yContextPriv)

    var lineFocusPub = createLine(xFocusPub, yFocusPub)
    var lineContextPub = createLine(xContextPub, yContextPub)

    var brushPriv = d3.brushX()
        .extent([[0, 0], [widthHisto, heightHistoContext]])
        .on("brush", function () {
          brushUpdate(focusPriv, lineFocusPriv, xFocusPriv, xContextPriv, xAxisFocusPriv, "priv")
    })

    var brushPub = d3.brushX()
        .extent([[0, 0], [widthHisto, heightHistoContext]])
        .on("brush", function () {
          brushUpdate(focusPub, lineFocusPub, xFocusPub, xContextPub, xAxisFocusPub, "pub")
    })

    var colorPriv = d3.scaleOrdinal(d3.schemeCategory10)
    var colorPub = d3.scaleOrdinal(d3.schemeCategory10)

    domainColor(colorPriv, byDatePriv)
    domainColor(colorPub, byDatePub)

    // Axes focus
    
    var heightContext = heightHisto * 0.21

    setAxes(focusPriv, heightHisto, xAxisFocusPriv, yAxisFocusPriv, "priv")
    setAxes(focusPub, heightHisto, xAxisFocusPub, yAxisFocusPub, "pub")
    setAxes(contextPriv, heightContext, xAxisContextPriv, null, null)
    setAxes(contextPub, heightContext, xAxisContextPub, null, null)

    setBrush(contextPriv, brushPriv, heightContext)
    setBrush(contextPub, brushPub, heightContext)

    /***** Création du graphique contexte *****/
    createContextLineChart(contextPriv, byDatePriv, lineContextPriv, colorPriv)
    createContextLineChart(contextPub, byDatePub, lineContextPub, colorPub)


    createFocusLineChart(groupPriv, byDatePriv, lineFocusPriv, colorPriv)
    createFocusLineChart(groupPub, byDatePub, lineFocusPub, colorPub)
    
    /***** Création de la légende *****/
    legend(groupPriv, byDatePriv, colorPriv)
    legend(groupPub, byDatePub, colorPub)
}
