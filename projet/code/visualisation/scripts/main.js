
(function () {

  var [W, H] = [window.innerWidth, window.innerHeight]
  var [mW, mH] = [W*0.1, H*0.1]

  var margin = {
    top: mH,
    right: mW,
    bottom: mH,
    left: mW
  }

  var width = window.innerWidth - margin.left - margin.right
  var height = window.innerHeight - margin.top - margin.bottom

  var [idSankey, idBars, idProvince, idHistos] = ["sankey", "barCharts", "barProvince", "histos"]
  var idsGroups = [idSankey, idBars, idProvince, idHistos]
  var groups = {}
  idsGroups.forEach(element => {
    var div = d3.select("#" + element)
                .append("svg")
                .attr("id", "svg"+element)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
    
    var group = div.append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    groups[element] = group
  });

  var files = ["./data/lobbyingClimatiqueActeurs.csv",
               "./data/lobbyingClimatiquePrivates.csv",
               "./data/lobbyingClimatiquePublics.csv",
               "./data/lobbyingClimatiqueRapports.csv"]

  Promise.all(files.map(pathFile => d3.csv(pathFile))).then(function (data) {
      actors = preprocActors(data[0])
      privates = preprocPrivates(data[1], actors)
      publics = preprocPublics(data[2], actors)
      rapports = preprocRapports(data[3])

      dict = preprocdict(rapports, privates, publics)

      initSankey(groups[idSankey], dict)

      d3.select("#reset-sankey")
        .on("click", () => {
          zooms.reset()
          initSankey(groups[idSankey], dict)
        })


      initBars(groups[idBars], groups[idProvince], dict, privates)
      d3.select("#reset-bars")
        .on("click", () => {
          initBars(groups[idBars], groups[idProvince], dict, privates)
        })
  })
})()