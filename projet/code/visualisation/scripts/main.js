
(function () {
    
    /***** Configuration *****/
  var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 80
  }

  var width = 1000 - margin.left - margin.right
  var height = 600 - margin.top - margin.bottom

  var sankey = d3.sankey()

  var svgSankey = d3.select("#sankey-sect")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)

  var sankeyGroup = svgSankey.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var files = ["./data/lobbyingClimatiqueActeurs.csv",
               "./data/lobbyingClimatiquePrivates.csv",
               "./data/lobbyingClimatiquePublics.csv",
               "./data/lobbyingClimatiqueRapports.csv"]

  Promise.all(files.map(pathFile => d3.csv(pathFile))).then(function (data) {
      actors = preprocActors(data[0])
      privates = preprocPrivates(data[1])
      publics = preprocPublics(data[2])
      rapports = preprocRapports(data[3])
      dictSankey = sankeyPreproc(rapports, privates, publics)
      var setSankey = () => initSankey(sankeyGroup, dictSankey)
      
      setSankey()
      d3.select("#reset-sankey")
        .on("click", setSankey)
  })

})()