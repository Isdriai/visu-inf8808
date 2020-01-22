"use strict";

/**
 * Fichier permettant de traiter les données provenant du fichier CSV.
 */


/**
 * Précise le domaine en associant un nom de rue à une couleur précise.
 *
 * @param color   Échelle de 10 couleurs.
 * @param data    Données provenant du fichier CSV.
 */
function domainColor(color, data) {
  // TODO: Définir le domaine de la variable "color" en associant un nom de rue à une couleur.
  var places = Object.keys(data[0]).filter(place => place != "Date") // On prend comme noms de lieux toutes les colonnes sauf "Date"
  color.domain(places)
}

/**
 * Convertit les dates se trouvant dans le fichier CSV en objet de type Date.
 *
 * @param data    Données provenant du fichier CSV.
 * @see https://www.w3schools.com/jsref/jsref_obj_date.asp
 */
function parseDate(data) {
  // TODO: Convertir les dates du fichier CSV en objet de type Date.
  data.forEach(element => {
    // JS a besoin du format MM/JJ/YYYY et pas du JJ/MM/YYYY présent dans le csv
    var sep = "/"
    var dateSplit = element.Date.split(sep)
    var dateFormated = dateSplit[1] + sep + dateSplit[0] + sep + dateSplit[2] 
    element.Date = new Date(dateFormated)
  });
}

/**
 * Trie les données par nom de rue puis par date.
 *
 * @param color     Échelle de 10 couleurs (son domaine contient les noms de rues).
 * @param data      Données provenant du fichier CSV.
 *
 * @return Array    Les données triées qui seront utilisées pour générer les graphiques.
 *                  L'élément retourné doit être un tableau d'objets comptant 10 entrées, une pour chaque rue
 *                  et une pour la moyenne. L'objet retourné doit être de la forme suivante:
 *
 *                  [
 *                    {
 *                      name: string      // Le nom de la rue,
 *                      values: [         // Le tableau compte 365 entrées, pour les 365 jours de l'année.
 *                        date: Date,     // La date du jour.
 *                        count: number   // Le nombre de vélos compté ce jour là (effectuer une conversion avec parseInt)
 *                      ]
 *                    },
 *                     ...
 *                  ]
 */
function createSources(color, data) {
  var sortedData = []

  var domain = color.domain()
  domain.forEach(place => {
    sortedData.push({name: place, values: []})
  })

  data.forEach(jour => {
    for(var place in jour) {
      if(place !== "Date") {
        var placeValues = sortedData.find(objPlace => objPlace.name == place)
        placeValues.values.push({date: jour["Date"], count: parseInt(jour[place], 10)})
      }
    }
  })
  return sortedData  
}

/**
 * Précise le domaine des échelles utilisées par les graphiques "focus" et "contexte" pour l'axe X.
 *
 * @param xFocus      Échelle en X utilisée avec le graphique "focus".
 * @param xContext    Échelle en X utilisée avec le graphique "contexte".
 * @param data        Données provenant du fichier CSV.
 */
function domainX(xFocus, xContext, data) {
  // TODO: Préciser les domaines pour les variables "xFocus" et "xContext" pour l'axe X.
  var nbrJours = data.length // 366 car 2016 est bissextile
  xFocus.domain([0, nbrJours])
  xContext.domain([0, nbrJours])
}

/**
 * Précise le domaine des échelles utilisées par les graphiques "focus" et "contexte" pour l'axe Y.
 *
 * @param yFocus      Échelle en Y utilisée avec le graphique "focus".
 * @param yContext    Échelle en Y utilisée avec le graphique "contexte".
 * @param sources     Données triées par nom de rue et par date (voir fonction "createSources").
 */
function domainY(yFocus, yContext, sources) {
  // TODO: Préciser les domaines pour les variables "yFocus" et "yContext" pour l'axe Y.
  var max = 0
  for(var p in sources) {
    var maxPlace = Math.max.apply(Math, sources[p].values.map(function(value) { return value.count; }))
    if (maxPlace > max) {
      max = maxPlace
    }
  }
  yFocus.domain([0, max])
  yContext.domain([0, max])
}
