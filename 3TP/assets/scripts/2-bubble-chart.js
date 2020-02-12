"use strict";

/**
 * Fichier permettant de dessiner le graphique à bulles.
 */


/**
 * Crée les axes du graphique à bulles.
 *
 * @param g       Le groupe SVG dans lequel le graphique à bulles doit être dessiné.
 * @param xAxis   L'axe X.
 * @param yAxis   L'axe Y.
 * @param height  La hauteur du graphique.
 * @param width   La largeur du graphique.
 */
function createAxes(g, xAxis, yAxis, height, width) {
  // TODO: Dessiner les axes X et Y du graphique.
  // Axe horizontal
  g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)

  // Axe vertical
    g.append("g")
    .attr("class", "y axis")
    .attr("id", "yaxis")
    .call(yAxis)

  // label axe x
    g.append("text")
        .attr("y", height * 0.99)
        .attr("x", width * 0.9)
        .style("text-anchor", "middle")
        .text("Espérance de vie (années)")

  // label axe y
    g.append("text")
        .attr("transform", "rotate(-90)") // attention, ca change aussi les orientations 
        .attr("y", width * 0.02)
        .attr("x", - height * 0.1)
        .style("text-anchor", "middle")
        .text("Revenu (USD)")
}

/**
 * Renseigne la position et le rayon de chaque cercle.
 * 
 * @param circles Les cercles.
 * @param x       L'échelle pour l'axe X.
 * @param y       L'échelle pour l'axe Y.
 * @param r       L'échelle pour le rayon des cercles.
 */
function placeCircles(circles, x, y, r) {
  return circles.attr("cx", d => x(d.lifeExpectancy))
   .attr("cy", d => y(d.income))
   .attr("r", d => r(d.population))
}

/**
 * Crée le graphique à bulles.
 *
 * @param g       Le groupe SVG dans lequel le graphique à bulles doit être dessiné.
 * @param data    Les données à utiliser.
 * @param x       L'échelle pour l'axe X.
 * @param y       L'échelle pour l'axe Y.
 * @param r       L'échelle pour le rayon des cercles.
 * @param color   L'échelle pour la couleur des cercles.
 * @param tip     L'infobulle à afficher lorsqu'un cercle est survolé.
 */
function createBubbleChart(g, data, x, y, r, color, tip) {
  // TODO: Dessiner les cercles du graphique en utilisant les échelles spécifiées.
  //       Assurez-vous d'afficher l'infobulle spécifiée lorsqu'un cercle est survolé.
  placeCircles(g.selectAll("dot")
   .data(data)
   .enter()
   .append("circle")
   .attr("id", d => d.name)
   .attr("class", "circle"), x, y, r)
   .attr("fill", d => color(d.zone))
   .on('mouseover', tip.show)
   .on('mouseout', tip.hide)
}
