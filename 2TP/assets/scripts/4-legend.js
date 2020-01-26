"use strict";

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

  var shitfY = 50

  console.log(sources)

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

/**
 * Permet d'afficher ou non la ligne correspondant au carré qui a été cliqué.
 *
 * En cliquant sur un carré, on fait disparaitre/réapparaitre la ligne correspondant et l'intérieur du carré
 * devient blanc/redevient de la couleur d'origine.
 *
 * @param element   Le carré qui a été cliqué.
 * @param color     Échelle de 10 couleurs.
 */
function displayLine(element, color) {
  // TODO: Compléter le code pour faire afficher ou disparaître une ligne en fonction de l'élément cliqué.
  console.log("coucou")
}
