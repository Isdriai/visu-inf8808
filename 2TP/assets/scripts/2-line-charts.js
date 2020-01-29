"use strict";

/**
 * Fichier permettant de dessiner les graphiques "focus" et "contexte".
 */


/**
 * Crée une ligne SVG en utilisant les domaines X et Y spécifiés.
 * Cette fonction est utilisée par les graphiques "focus" et "contexte".
 *
 * @param x               Le domaine X.
 * @param y               Le domaine Y.
 * @return d3.svg.line    Une ligne SVG.
 *
 * @see https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89      (voir line generator)
 */
function createLine(x, y) {
  // TODO: Retourner une ligne SVG (voir "d3.line"). Pour l'option curve, utiliser un curveBasisOpen.
  return d3.line()
           .x(function(d) { return x(d.date)})
           .y(function(d) { return y(d.count)})
           .curve(d3.curveBasisOpen)
}

/**
 * Crée une ligne qui sera ajouté à un graphique
 * 
 * @param g         Le groupe SVG dans lequel le graphique doit être dessiné.
 * @param id        L'identifiant donné à la LineChart.
 * @param datum     Données liées à cette LineChart.
 * @param line      La fonction permettant de dessiner les lignes du graphique.
 * @param color     L'échelle de couleurs ayant une couleur associée à un nom de rue.
 * @param name      Nom à donner à la LineChart.
 */
function createLineChart(g, id, datum, line, color, name) {
  return g.append("path")
    .datum(datum)
    .attr("id", id)
    .attr("class", "line")
    .attr("d", line)
    .style("stroke", name ===  "Moyenne" ? "#000000": color(name))
    .style("stroke-width", name ===  "Moyenne" ? 3 : 1)
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
  for(var p in sources) {
    var place = sources[p]
    createLineChart(g, place.name, place.values, line, color, place.name).attr("clip-path", "url(#clip)")
  }
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
  for(var p in sources) {
    var place = sources[p]
    createLineChart(g, place.name + "Context", place.values, line, color, place.name)
  }
}
