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
      .on("click", function(d) {
        displayLine(this, color) // function qui gere le click pour afficher ou désactiver la légende d'une case
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
  var cell = element.childNodes[0]
  var text = element.childNodes[1].childNodes[0].data
  var whiteRGBString = "rgb(255, 255, 255)"
  var lineStyleFocus = d3.select("#" + text).node().style  // style de la ligne dans le graphique focus
  var lineStyleContext = d3.select("#" + text + "Context").node().style  // style de la ligne dans le graphique context
  if (cell.style.fill == whiteRGBString) {
    cell.style.fill = (text === "Moyenne" ? "#000000" : color(text))
    lineStyleFocus.opacity = 1
    lineStyleContext.opacity = 1
  } else {
    cell.style.fill = whiteRGBString
    lineStyleFocus.opacity = 0
    lineStyleContext.opacity = 0
  }
}
