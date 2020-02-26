"use strict";

/**
 * Fichier permettant de dessiner le diagramme à cordes.
 */

/**
 * Retourne le texte qui doit apparaitre lorsque la souris survolle un groupe.
 * 
 * @param d               Les données associées au groupe survollé par la souris. 
 * @param data            Les données provenant du fichier JSON.
 * @param total           Le nombre total de trajets réalisés pour le mois d'août 2015.
 * @param formatPercent   Fonction permettant de formater correctement un pourcentage.
 */
function titleGroup(d, data, total, formatPercent) {
  var name = data[d.index].name
  var totStation = d3.sum(data[d.index].destinations.map(dest => dest.count))
  var percent = formatPercent(totStation/total)
  console.log(name + ": " + percent + " des départs")
  return name + ": " + percent + " des départs"
}

/**
 * Crée les groupes du diagramme à cordes.
 *
 * @param g               Le groupe SVG dans lequel le diagramme à cordes doit être dessiné.
 * @param data            Les données provenant du fichier JSON.
 * @param layout          La disposition utilisée par le diagramme à cordes.
 * @param arc             Fonction permettant de dessiner les arcs.
 * @param color           L'échelle de couleurs qui est associée à chacun des noms des stations de BIXI.
 * @param total           Le nombre total de trajets réalisés pour le mois d'août 2015.
 * @param formatPercent   Fonction permettant de formater correctement un pourcentage.
 *
 * @see https://bl.ocks.org/mbostock/4062006
 */
function createGroups(g, data, layout, arc, color, total, formatPercent) {
  /* TODO:
     - Créer les groupes du diagramme qui sont associés aux stations de BIXI fournies.
     - Utiliser un "textPath" pour que les nom de stations suivent la forme des groupes.
     - Tronquer les noms des stations de BIXI qui sont trop longs (Pontiac et Métro Mont-Royal).
     - Afficher un élément "title" lorsqu'un groupe est survolé par la souris.
  */


  var groups = g.selectAll("g")
                .data(layout.groups)
                .enter()
                
    groups.append("path")
    .attr("id", d => "group" + d.index)
    .style("fill", d => color(data[d.index].name))
    .style("stroke", d => color(data[d.index].name))
    .attr("d", arc)
    .attr("class", "group")
    .append("svg:title")
    .attr("text", d => titleGroup(d, data, total, formatPercent)) 
    
    
    groups.append("text")
    .attr("dx", 4)
    .attr("dy", 15)
    .append("textPath")
    .attr("class", "text")
    .attr("xlink:href", d => "#group" + d.index) 
    .text(d => tronc(data[d.index].name))
    .style("fill", "white")
    .style("font-size","13px")
}

/**
 * Fonction qui tronque les noms des stations «Métro Mont-Royal (Rivard/Mont-Royal)» et «Pontiac / Gilford».
 * 
 * @param name    Le nom de la station qui doit etre tronqué si trop long.
 */
function tronc(name) {
  switch(name) {
    case "Pontiac / Gilford":
      return "Pontiac"
    case "Métro Mont-Royal (Rivard/Mont-Royal)":
      return "Métro Mont-Royal"
    default:
      return name
  }
}

/**
 * Crée les cordes du diagramme à cordes.
 *
 * @param g               Le groupe SVG dans lequel le diagramme à cordes doit être dessiné.
 * @param data            Les données provenant du fichier JSON.
 * @param layout          La disposition utilisée par le diagramme à cordes.
 * @param path            Fonction permettant de dessiner les cordes.
 * @param color           L'échelle de couleurs qui est associée à chacun des noms des stations de BIXI.
 * @param total           Le nombre total de trajets réalisés pour le mois d'août 2015.
 * @param formatPercent   Fonction permettant de formater correctement un pourcentage.
 *
 * @see https://beta.observablehq.com/@mbostock/d3-chord-dependency-diagram
 */
function createChords(g, data, layout, path, color, total, formatPercent) {
  /* TODO:
     - Créer les cordes du diagramme avec une opacité de 80%.
     - Afficher un élément "title" lorsqu'une corde est survolée par la souris.
  */
// Add the links between groups

g.selectAll("g")
.data(layout)
.enter()
.append("path")
 .attr("d", path)
 .attr("class", "chord")
 .style("fill", d => color(data[d.source.index].name))
}

/**
 * Initialise la logique qui doit être réalisée lorsqu'un groupe du diagramme est survolé par la souris.
 *
 * @param g     Le groupe SVG dans lequel le diagramme à cordes est dessiné.
 */
function initializeGroupsHovered(g) {
  /* TODO:
     - Lorsqu'un groupe est survolé par la souris, afficher les cordes entrant et sortant de ce groupe avec une
       opacité de 80%. Toutes les autres cordes doivent être affichées avec une opacité de 10%.
     - Rétablir l'affichage du diagramme par défaut lorsque la souris sort du cercle du diagramme.
  */
  
  g.selectAll(".group")
    .on("mouseenter", function(group) {
    g.selectAll(".chord").attr("class", function(chord) {
      if (group.index === chord.source.index || group.index === chord.target.index) {
        return "chord"
      } else {
        return "chord notSelectedchord" // voir style.css, ca set la fill-opacity à 0.1
      }
    })
  })

  d3.select("#circle").on("mouseleave", function(d) {
    g.selectAll(".chord").attr("class", "chord") // ca efface "notSelectedchord"
  })
}
