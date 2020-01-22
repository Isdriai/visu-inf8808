/**
 * Fichier principal permettant de dessiner les deux graphiques demandés. Ce fichier utilise les autres fichiers
 * que vous devez compléter.
 *
 * /!\ Aucune modification n'est nécessaire dans ce fichier!
 */
(function(d3, localization) {
  "use strict";

  /***** Configuration *****/

  // Graphique principal (focus)
  var marginFocus = {
    top: 10,
    right: 10,
    bottom: 100,
    left: 60
  };
  var widthFocus = 1200 - marginFocus.left - marginFocus.right;
  var heightFocus = 500 - marginFocus.top - marginFocus.bottom;

  // Graphique secondaire qui permet de choisir l'échelle de la visualisation (contexte)
  var marginContext = {
    top: 430,
    right: 10,
    bottom: 30,
    left: 60
  };
  var widthContext = widthFocus;
  var heightContext = 500 - marginContext.top - marginContext.bottom;

  /***** Échelles *****/
  var xFocus = d3.scaleTime().range([0, widthFocus]);
  var yFocus = d3.scaleLinear().range([heightFocus, 0]);

  var xContext = d3.scaleTime().range([0, widthContext]);
  var yContext = d3.scaleLinear().range([heightContext, 0]);

  var xAxisFocus = d3.axisBottom(xFocus).tickFormat(localization.getFormattedDate);
  var yAxisFocus = d3.axisLeft(yFocus);

  var xAxisContext = d3.axisBottom(xContext).tickFormat(localization.getFormattedDate);

  /***** Création des éléments *****/
  var svg = d3.select("body")
    .append("svg")
    .attr("width", widthFocus + marginFocus.left + marginFocus.right)
    .attr("height", heightFocus + marginFocus.top + marginFocus.bottom);

  // Groupe affichant le graphique principal (focus).
  var focus = svg.append("g")
    .attr("transform", "translate(" + marginFocus.left + "," + marginFocus.top + ")");

  // Groupe affichant le graphique secondaire (contexte).
  var context = svg.append("g")
    .attr("transform", "translate(" + marginContext.left + "," + marginContext.top + ")");

  // Ajout d'un plan de découpage.
  svg.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", widthFocus)
    .attr("height", heightFocus);

  // Fonctions pour dessiner les lignes
  var lineFocus = createLine(xFocus, yFocus);
  var lineContext = createLine(xContext, yContext);

  // Permet de redessiner le graphique principal lorsque le zoom/brush est modifié.
  var brush = d3.brushX()
    .extent([[0, 0], [widthContext, heightContext]])
    .on("brush", function () {
      brushUpdate(brush, focus, lineFocus, xFocus, xContext, xAxisFocus, yAxisFocus);
    });

  /***** Chargement des données *****/
  d3.csv("./data/2016.csv").then(function(data) {
    /***** Prétraitement des données *****/
    // Échelle permettant d'associer 10 valeurs à 10 couleurs différentes
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    domainColor(color, data);
    parseDate(data);

    var sources = createSources(color, data);
    domainX(xFocus, xContext, data);
    domainY(yFocus, yContext, sources);

    /***** Création du graphique focus *****/
    createFocusLineChart(focus, sources, lineFocus, color);

    // Axes focus
    focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + heightFocus + ")")
      .call(xAxisFocus);

    focus.append("g")
      .attr("class", "y axis")
      .call(yAxisFocus);

    /***** Création du graphique contexte *****/
    createContextLineChart(context, sources, lineContext, color);

    // Axes contexte
    context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + heightContext + ")")
      .call(xAxisContext);

    context.append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", -6)
      .attr("height", heightContext + 7);

    /***** Création de la légende *****/
    legend(svg, sources, color);
  });
})(d3, localization);
