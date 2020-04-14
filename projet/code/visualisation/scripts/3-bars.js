"use strict";





function createAxes() {



    //return [xAxis, yAxis]
}



function createBarChart(barsGroup, currentData, [xAxis, yAxis]) {

    barsGroup.selectAll("rect")
     .data(currentData.destinations)
     .enter()
     .append("rect")
     .attr("class", "rect")
     .attr("x", d => x(d.name))
     .attr("y", d => y(d.count))
     .style("fill", d => color(d.name))
     .attr("height", d => height - y(d.count))
     .attr("width", x.bandwidth())
     .on("mouseover", tip.show)
     .on("mouseout", tip.hide)
  }

function countBySect(dict) {
    return Object.keys(dict).map(sect => ({
        name: sect,
        count: d3.sum(Object.keys(dict[sect]).map(priv => 
            d3.sum(Object.keys(dict[sect][priv]).map(typePub => 
                 d3.sum(Object.keys(dict[sect][priv][typePub]).map(actor => dict[sect][priv][typePub][actor]))
            ))
        ))
    }))
}

function initBars(barsGroup, dict, privates) {
    
    var dataBySect = countBySect(dict)

    var x = d3.scaleBand().range([0, 1000]).round(0.05);
  var y = d3.scaleLinear().range([800, 0]);

    x.domain(dataBySect.map(s => s.name))
    y.domain(dataBySect.map(s => s.count))

    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y)


    barsGroup.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + 800 + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)" );
  
    barsGroup.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Value ($)");
  
    barsGroup.selectAll("bar")
        .data(dataBySect)
      .enter().append("rect")
        .style("fill", "steelblue")
        .attr("x", function(d) { return x(d.name); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return 800 - y(d.count); });
  
  
}
