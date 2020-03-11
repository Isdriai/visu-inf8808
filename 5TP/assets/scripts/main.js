/**
 * Fichier principal permettant de gérer la carte. Ce fichier utilise les autres fichiers
 * que vous devez compléter.
 *
 * /!\ Aucune modification n'est nécessaire dans ce fichier!
 */
(function (L, d3, topojson, searchBar, localization) {
  "use strict";

  /***** Configuration *****/
  var parties = [
    {name: "Bloc Québécois", color: "#6ba7d9", abbreviation: "BQ"},
    {name: "Conservateur", color: "#194f99", abbreviation: "PCC"},
    {name: "Libéral", color: "#e9332f", abbreviation: "PLC"},
    {name: "Indépendant", color: "grey", abbreviation: "Ind."},
    {name: "Parti Vert", color: "#7bbd51", abbreviation: "PV"},
    {name: "NPD-Nouveau Parti Démocratique", color: "#f28135", abbreviation: "NPD"}
  ];

  var panel = d3.select("#panel");
  var map = L.map('map', {
    'worldCopyJump': true
  });

  var barChartMargin = {
    top: 0,
    right: 40,
    bottom: 0,
    left: 40
  };
  var barChartWidth = 300 - barChartMargin.left - barChartMargin.right;
  var barChartHeight = 150 - barChartMargin.top - barChartMargin.bottom;

  /***** Échelles utilisées *****/
  var color = d3.scaleOrdinal();
  var x = d3.scaleLinear().range([0, barChartWidth]);
  var y = d3.scaleBand().range([0, barChartHeight]).padding(0.1);

  var yAxis = d3.axisLeft(y);

  /***** Création des éléments du diagramme à barres *****/
  var barChartSvg = panel.select("svg")
    .attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
    .attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom);

  var barChartGroup = barChartSvg.append("g")
    .attr("transform", "translate(" + barChartMargin.left + "," + barChartMargin.top + ")");

  var barChartBarsGroup = barChartGroup.append("g");
  var barChartAxisGroup = barChartGroup.append("g")
    .attr("class", "axis y");

  /***** Chargement des données *****/
  var promises = [];
  promises.push(d3.json("./data/canada.json"));
  promises.push(d3.csv("./data/data.csv"));

  Promise.all(promises)
    .then(function (results) {
      var canadaTopoJson = results[0];
      var canada = topojson.feature(canadaTopoJson, canadaTopoJson.objects.Canada);
      var data = results[1];

      /***** Prétraitement des données *****/
      data.forEach(function (d) {
        d.percent = d.percent.replace(".", ",");
      });
      colorScale(color, parties);
      convertNumbers(data);
      var sources = createSources(data);

      /***** Initialisation de la carte *****/
      initTileLayer(L, map);
      var mapSvg = initSvgLayer(map);
	  var g = undefined;
	  if (mapSvg) {
		g = mapSvg.select("g");
	  }
      var path = createPath();

      createDistricts(g, path, canada, sources, color, showPanel);
      map.on("viewreset", function () {
        updateMap(mapSvg, g, path, canada);
      });
      updateMap(mapSvg, g, path, canada);

      /***** Recherche d'une circonscription *****/
      var autoCompleteSources = d3.nest()
        .key(function (d) {
          return d.id;
        })
        .entries(data)
        .map(function (d) {
          return {
            id: +d.values[0].id,
            name: d.values[0].name
          };
        })
        .sort(function (a, b) {
          return d3.ascending(a.name, b.name);
        });

      var searchBarElement = searchBar(autoCompleteSources);
      searchBarElement.search = function (id) {
        var feature = canada.features.find(function (d) {
          return d.properties["NUMCF"] === id;
        });
        var bound = d3.geoBounds(feature);
        search(map, g, id, [
          [bound[0][1], bound[0][0]],
          [bound[1][1], bound[1][0]]
        ], showPanel);
      };

      /***** Gestion du panneau d'informations *****/
      panel.select("button")
        .on("click", function () {
          reset(g);
          panel.style("display", "none");
        });

      /**
       * Affichage du panneau d'informations pour une certain circonscription.
       *
       * @param districtId    Le numéro de circonscription à utiliser pour afficher les bonnes informations.
       */
      function showPanel(districtId) {
        var districtSource = sources.find(function (e) {
          return districtId === e.id;
        });

        panel.style("display", "block");
        updateDomains(districtSource, x, y);
        updatePanelInfo(panel, districtSource, localization.getFormattedNumber);
        updatePanelBarChart(barChartBarsGroup, barChartAxisGroup, districtSource, x, y, yAxis, color, parties)
      }
    });

  /**
   * Projete un point dans le repère de la carte.
   *
   * @param x   Le point X à projeter.
   * @param y   Le point Y à projeter.
   */
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }

  /**
   * Trace un ensemble de coordonnées dans le repère de la carte.
   *
   * @return {*}  La transformation à utiliser.
   */
  function createPath() {
    var transform = d3.geoTransform({point: projectPoint});
    return d3.geoPath().projection(transform);
  }

})(L, d3, topojson, searchBar, localization);
