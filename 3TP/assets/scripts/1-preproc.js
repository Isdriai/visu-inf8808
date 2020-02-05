"use strict";

/**
 * Fichier permettant de traiter les données provenant des fichiers CSV.
 */


/**
 * Initialise les données provenant des fichiers CSV en convertissant
 * les nombres au format "string" au format "number".
 *
 * @param data    Données provenant d'un fichier CSV.
 */
function initializeData(data) {
  // TODO: Convertir les propriétés "income", "lifeExpectancy" et "population" au format "number" pour chacune des entrées.

}

/**
 * Précise le domaine de l'échelle utilisée pour l'axe X du nuage de points.
 *
 * @param x     Échelle X à utiliser.
 */
function domainX(x) {
  // TODO: Préciser le domaine pour la variable "x" en prenant comme minimum et maximum les valeurs suivantes: 35 ans et 90 ans.

}

/**
 * Précise le domaine de l'échelle utilisée pour l'axe Y du nuage de points.
 *
 * @param y     Échelle Y à utiliser.
 */
function domainY(y) {
  // TODO: Préciser le domaine pour la variable "y" en prenant comme minimum et maximum les valeurs suivantes: 0 USD et 140000 USD.

}

/**
 * Précise le domaine de l'échelle de couleurs qui est utilisée pour distinguer chacune des régions du monde.
 *
 * @param color   Échelle de couleurs.
 * @param data    Données provenant d'un fichier CSV.
 */
function domainColor(color, data) {
  // TODO: Préciser le domaine de l'échelle de couleurs. Assurez-vous d'associer une zone du monde distincte pour chaque couleur.

}

/**
 * Précise le domaine de l'échelle du rayon des cercles qui est utilisée pour représenter la population des pays.
 *
 * @param r       Échelle du rayon des cercles (échelle racine carrée).
 * @param data    Données provenant d'un fichier CSV.
 */
function domainRadius(r, data) {
  // TODO: Préciser le domaine de l'échelle de la variable "r" em spécifiant comme valeurs extrêmes le minimum et le
  //       maximum des populations des pays.

}
