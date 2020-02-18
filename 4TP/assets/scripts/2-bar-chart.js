"use strict";

/**
 * Fichier permettant de dessiner le graphique à bandes.
 */


/**
 * Crée les axes du graphique à bandes.
 *
 * @param g       Le groupe SVG dans lequel le graphique à bandes doit être dessiné.
 * @param xAxis   L'axe X.
 * @param yAxis   L'axe Y.
 * @param height  La hauteur du graphique.
 */
function createAxes(g, xAxis, yAxis, height) {
  // TODO: Dessiner les axes X et Y du graphique. Assurez-vous d'indiquer un titre pour l'axe Y.
  // Axe horizontal
  g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", 150)
      .attr("dy", 100)
      .attr("transform", d => "rotate(20)" )

  // Axe vertical
  g.append("g")
    .attr("class", "y axis")
    .call(yAxis)
}

/**
 * Crée le graphique à bandes.
 *
 * @param g             Le groupe SVG dans lequel le graphique à bandes doit être dessiné.
 * @param currentData   Les données à utiliser.
 * @param x             L'échelle pour l'axe X.
 * @param y             L'échelle pour l'axe Y.
 * @param color         L'échelle de couleurs qui est associée à chacun des noms des stations de BIXI.
 * @param tip           L'infobulle à afficher lorsqu'une barre est survolée.
 * @param height        La hauteur du graphique.
 */
function createBarChart(g, currentData, x, y, color, tip, height) {
  // TODO: Dessiner les cercles à bandes en utilisant les échelles spécifiées.
  //       Assurez-vous d'afficher l'infobulle spécifiée lorsqu'une barre est survolée.
  g.selectAll("bar")
   .data(currentData.destinations)
   .enter()
   .append("rect")
   .attr("class", "bar")
   .attr("x", d => x(d.name))
   .attr("y", d => y(d.count))
   .style("fill", d => color(d.name))
   .attr("height", d => height - y(d.count))
   .attr("width", 50)
   .on("mouseover", tip.show)
   .on("mouseout", tip.hide)
}

/**
 * Réalise une transition entre les données actuellement utilisées et les nouvelles qui doivent être utilisées.
 *
 * @param g         Le groupe SVG dans lequel le graphique à bandes est dessiné.
 * @param newData   Les nouvelles données à utiliser.
 * @param y         L'échelle pour l'axe Y.
 * @param yAxis     L'axe Y.
 * @param height    La hauteur du graphique.
 */
function transition(g, newData, y, yAxis, height) {
  /* TODO:
   - Réaliser une transition pour mettre à jour l'axe des Y et la hauteur des barres à partir des nouvelles données.
   - La transition doit se faire en 1 seconde.
   */

  var duration = 1000

  console.log(newData)
  var bars = g.selectAll("bar")
  console.log("coucou les bars")
  console.log(bars)
  console.log("wesh")
  console.log(newData.destinations)
   bars.data(newData.destinations)
   .transition()
   .duration(duration)
   .attr("height", function(d) {var res = height - y(d.count); console.log(res); return res})
   .attr("y", function(d) {var res = y(d.count); console.log(res); return res})
   .attr("width", 50)

  g.select(".y.axis")
   .transition()
   .duration(duration)
   .call(yAxis);
 
}

/**
 * Obtient le texte associé à l'infobulle.
 *
 * @param d               Les données associées à la barre survollée par la souris.
 * @param currentData     Les données qui sont actuellement utilisées.
 * @param formatPercent   Fonction permettant de formater correctement un pourcentage.
 * @return {string}       Le texte à afficher dans l'infobulle.
 */
function getToolTipText(d, currentData, formatPercent) {
  // TODO: Retourner le texte à afficher dans l'infobulle selon le format demandé.
  //       Assurez-vous d'utiliser la fonction "formatPercent" pour formater le pourcentage correctement.

  var percent = d.count / d3.sum(currentData.destinations.map(d => d.count))
  return d.count + " (" + formatPercent(percent) + ")";
}
