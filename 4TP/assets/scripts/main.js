/**
 * Fichier principal permettant de dessiner les graphiques demandés. Ce fichier utilise les autres fichiers
 * que vous devez compléter.
 *
 * /!\ Aucune modification n'est nécessaire dans ce fichier!
 */
(function (d3, localization) {
  "use strict";

  /***** Onglets *****/
  var tabs = d3.selectAll(".tabs li");
  tabs.on("click", function (d, i) {
    var self = this;
    var index = i;
    tabs.classed("active", function () {
      return self === this;
    });
    d3.selectAll(".tabs .tab")
      .classed("visible", function (d, i) {
        return index === i;
      });
  });

  /***** Configuration *****/
  var barChartMargin = {
    top: 55,
    right: 50,
    bottom: 150,
    left: 50
  };
  var barChartWidth = 980 - barChartMargin.left - barChartMargin.right;
  var barChartHeight = 550 - barChartMargin.top - barChartMargin.bottom;

  var chordDiagramWidth = 600;
  var chordDiagramHeight = 600;
  var chordDiagramOuterRadius = Math.min(chordDiagramWidth, chordDiagramHeight) / 2 - 10;
  var chordDiagramInnerRadius = chordDiagramOuterRadius - 24;

  /***** Échelles *****/
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var x = d3.scaleBand().range([0, barChartWidth]).round(0.05);
  var y = d3.scaleLinear().range([barChartHeight, 0]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y).tickFormat(localization.getFormattedNumber);

  /***** Création des éléments du diagramme à barres *****/
  var barChartSvg = d3.select("#bar-chart-svg")
    .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
    .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom);

  var barChartGroup = barChartSvg.append("g")
    .attr("transform", "translate(" + barChartMargin.left + "," + barChartMargin.top + ")");

  /***** Création des éléments du diagramme à cordes *****/
  var arc = d3.arc()
    .innerRadius(chordDiagramInnerRadius)
    .outerRadius(chordDiagramOuterRadius);

  var layout = d3.chord()
    .padAngle(.04)
    .sortSubgroups(d3.descending)
    .sortChords(d3.ascending);

  var path = d3.ribbon()
    .radius(chordDiagramInnerRadius);

  var chordDiagramGroup = d3.select("#chord-diagram-svg")
    .attr("width", chordDiagramWidth)
    .attr("height", chordDiagramHeight)
    .append("g")
    .attr("id", "circle")
    .attr("transform", "translate(" + chordDiagramWidth / 2 + "," + chordDiagramHeight / 2 + ")");

  chordDiagramGroup.append("circle")
    .attr("r", chordDiagramOuterRadius);

  /***** Chargement des données *****/
  d3.json("./data/bixi-destinations.json").then(function (data) {
    var currentData = data[0];
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0]);

    /***** Prétraitement des données *****/
    domainColor(color, data);
    domainX(x, data);
    domainY(y, currentData);

    var matrix = getMatrix(data);
    var total = getTotal(data);

    /***** Création du graphique à barres *****/
    createAxes(barChartGroup, xAxis, yAxis, barChartHeight);
    createBarChart(barChartGroup, currentData, x, y, color, tip, barChartHeight);

    /***** Création de l'infobulle *****/
    tip.html(function(d) {
      return getToolTipText.call(this, d, currentData, localization.getFormattedPercent);
    });
    barChartSvg.call(tip);

    /***** Création du diagramme à cordes *****/
    layout = layout(matrix);
    createGroups(chordDiagramGroup, data, layout, arc, color, total, localization.getFormattedPercent);
    createChords(chordDiagramGroup, data, layout, path, color, total, localization.getFormattedPercent);
    initializeGroupsHovered(chordDiagramGroup);

    // Ajout de la liste des stations pouvant être sélectionnés.
    d3.select("select")
      .on("change", function () {
        currentData = data[+d3.select(this).property("value")];
        domainY(y, currentData);
        transition(barChartGroup, currentData, y, yAxis, barChartHeight);
      })
      .selectAll("option")
      .data(data)
      .enter()
      .append("option")
      .attr("value", function(d, i) {
        return i;
      })
      .text(function (d) {
        return d.name;
      })
  });

})(d3, localization);
