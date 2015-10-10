if (Meteor.isClient) {
  Meteor.startup(function() {
    (function() {
      var width = 900
      var height = 300

      var color = d3.scale.linear()
        .domain([0, 0.5, 1])
        .range(["red", "white", "blue"]);

      var div = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

      var svg = d3.select('body').append('svg')
        .attr("width", width)
        .attr("height", height)
        .attr("class", "background")

      var centerLine = svg.append("rect")
        .attr("width", width)
        .attr("height", "2px")
        .attr("x", "0px")
        .attr("y", height / 2 + "px")
        .attr("class", "center-line")


      d3.json('acts.json', function(err, acts) {
        if (err) {throw err};
        // console.log(acts);

        var node = svg.selectAll(".node")
          .data(acts)
        .enter().append("circle")
          .attr({
            cx: function(d) {
              var sum = d.Republican + d.Democrat
              var percentD = d.Democrat / sum
              var scaled = d3.scale.linear()
                .domain([1, 0])
                .range([100, width - 100])
              return scaled(percentD) + "px"
            },
            cy: height / 2 + "px",
            r: function(d) {
              return (d.Republican + d.Democrat) / 12
            },
            class: 'node'
          })
          .style({
            fill: function(d) {
              var sum = d.Republican + d.Democrat
              var percentD = d.Democrat / sum
              return color(percentD)
            },
            "stroke-width": "1px",
            stroke: function(d) {
              var sum = d.Republican + d.Democrat
              var percentD = d.Democrat / sum
              return color(percentD)
              // return "#666"
            },
            "stroke-opacity": 1,
            "fill-opacity": 0.8
          })
          .on("mouseover", function(d) {
            div.transition()
              .duration(200)
              .style("opacity", .9);
            div.html(d.act + " " + "(" + (d.Democrat+d.Republican) + ")")
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
            })
          .on("mouseout", function(d) {
            div.transition()
              .duration(500)
              .style("opacity", 0);
          });
      })
    })()





  })
}
