"use strict";

/**
 * Fichier permettant de définir le texte à afficher dans l'infobulle.
 */

 
/**
 * Obtient le texte associé à l'infobulle.
 *
 * @param d               Les données associées au cercle survollé par la souris.
 * @param formatNumber    Fonction permettant de formater correctement des nombres.
 * @return {string}       Le texte à afficher dans l'infobulle.
 */
function getToolTipText(d, formatNumber) {
  // TODO: Retourner le texte à afficher dans l'infobulle selon le format demandé.
  //       Assurez-vous d'utiliser la fonction "formatNumber" pour formater les nombres correctement.
  return "Pays: <b>" + d.name + "</b><br>"
      +  "Espérance de vie: <b>" + formatNumber(d.lifeExpectancy) + "</b> ans<br>"
      +  "Revenu: <b>" + formatNumber(d.income) + "</b> USD<br>"
      +  "Population: <b>" + formatNumber(d.population) + "</b> habitants<br>"
      +  "Zone du monde: <b>" + d.zone + "</b><br>"
}
