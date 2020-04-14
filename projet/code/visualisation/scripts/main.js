
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


  var svgSankey = d3.select("#sankey-sect")
              .append("svg")
              .attr("id", "svgSankey")
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
      privates = preprocPrivates(data[1], actors)
      publics = preprocPublics(data[2], actors)
      rapports = preprocRapports(data[3])

      dictSankey = sankeyPreproc(rapports, privates, publics)

      initSankey(sankeyGroup, dictSankey)

      d3.select("#reset-sankey")
        .on("click", () => resetSankey(sankeyGroup, dictSankey))
  })

})()