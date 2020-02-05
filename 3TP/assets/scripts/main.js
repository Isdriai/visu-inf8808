/**
 * Fichier principal permettant de dessiner le graphique demandé. Ce fichier utilise les autres fichiers
 * que vous devez compléter.
 *
 * /!\ Aucune modification n'est nécessaire dans ce fichier!
 */
(function (d3, localization) {
  "use strict";

  /***** Configuration *****/
  var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 80
  };
  var width = 1000 - margin.left - margin.right;
  var height = 600 - margin.top - margin.bottom;

  /***** Échelles *****/
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  var r = d3.scaleSqrt().range([5, 20]);

  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y).tickFormat(localization.getFormattedNumber);

  /***** Création des éléments *****/
  var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  var bubbleChartGroup = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var files = ["./data/2000.csv", "./data/2014.csv"]

  /***** Chargement des données *****/
  Promise.all(files.map(url => d3.csv(url))).then(function (results) {
      var currentYear = "2000";
      var currentData = results[0];
      var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0]);

      /***** Prétraitement des données *****/
      results.forEach(function (data) {
        initializeData(data);
        data.sort(function(a, b) {
          return d3.ascending(a.name, b.name);
        })
      });
      domainX(x);
      domainY(y);
      domainColor(color, currentData);
      domainRadius(r, currentData);

      /***** Création du graphique à bulles *****/
      createAxes(bubbleChartGroup, xAxis, yAxis, height, width);
      createBubbleChart(bubbleChartGroup, currentData, x, y, r, color, tip);

      /***** Transition entre les données des années 2000 et 2014 *****/
      var toggleButtons = d3.selectAll(".toggle-buttons > button");
      toggleButtons.on("click", function(d, i) {
          currentYear = d3.select(this).text();
          currentData = results[i];
          toggleButtons.classed("active", function() {
            return currentYear === d3.select(this).text();
          });

          domainRadius(r, currentData);
          transition(bubbleChartGroup, currentData, x, y, r);
        });

      /***** Gestion de la barre de recherche *****/

      // Initialisation de l'auto-complétion
      new autoComplete({
        selector: "#search-bar input",
        minChars: 1,
        source: function(term, suggest) {
          term = term.toLowerCase();
          var matches = [];
          currentData.forEach(function(d) {
            if (~d.name.toLowerCase().indexOf(term)) {
              matches.push(d);
            }
          });
          suggest(matches);
        },
        renderItem: function(item, search) {
          search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
          return "<div class='autocomplete-suggestion' data-val='"
            + item.name + "'>" + item.name.replace(re, "<b>$1</b>") + "</div>";
        },
        onSelect: function(e, term, item) {
          search(item.getAttribute("data-val"), bubbleChartGroup);
        }
      });

      // Ajout d'évènements sur la barre de recherche et le bouton.
      var searchBarInput = d3.select("#search-bar input");
      searchBarInput.on("keydown", function () {
        if (d3.event.key === "Enter") {
          validateInput();
        } else {
          reset(bubbleChartGroup);
          searchBarInput.classed("error", false);
        }
      });
      d3.select("#search-bar button")
        .on("click", validateInput);

      /**
       * Valide la valeur entrée dans la barre et réalise une recherche.
       */
      function validateInput() {
        function normalize(str) {
          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        var value = searchBarInput.node().value.toLowerCase();
        if (!value) {
          return;
        }
        var currentValue = normalize(value);
        const countryFound = currentData.find(function(zone) {
          return normalize(zone.name.toLowerCase()) === currentValue;
        });
        if (countryFound) {
          search(countryFound.name, bubbleChartGroup);
        } else {
          reset(bubbleChartGroup);
          searchBarInput.classed("error", true);
        }
      }

      /***** Création de l'infobulle *****/
      tip.html(function(d) {
        return getToolTipText.call(this, d, localization.getFormattedNumber)
      });
      bubbleChartGroup.call(tip);
    });

})(d3, localization);
