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
    (function() {
        var height = 600,
            width = 1000;

        var projection = d3.geo.albersUsa()
          .scale(width)
          .translate([width / 2, height / 2]);

        var path = d3.geo.path()
          .projection(projection);

        var svg = d3.select("body").append("svg")
          .attr("viewBox", "0 50 1000 550")
          .attr("preserveAspectRatio", "xMinYMin meet");

        d3.json("us.json", function(error, us) {
          if (error) { throw error };

          svg.append("path")
            .datum(topojson.feature(us, us.objects.subunits))
            .attr("d", path);

          svg.selectAll(".subunit")
            .data(topojson.feature(us, us.objects.subunits).features)
            .enter().append("path")
            .attr("class", function(d) { return "subunit " + d.id; })
            //added id in above line to use as selector: ex US-NY
            .attr("d", path)
            .style('fill','#aaa')



          /////////Gives state boundary line
          svg.insert('path','.graticule')
            .datum(topojson.feature(us, us.objects.subunits,function(a, b) { return a !== b; }))
            .attr('class','state-boundary')
            .attr("d", path)
            .attr('stroke','#FFF')
            .style('fill','none')


          ///Populating stateHeat for use in heatmap below
          var locationConcentration = {};
          var paths = d3.selectAll('path')[0];
          paths.forEach(function(path){
            //Getting state abbreviation out of DOM
            var classString = path.className.animVal;
            var state = classString.slice(classString.length-2)
            locationConcentration[state] = 0;
          })


          d3.json("states.json", function(error, data) {
            if (error) { throw error };
            var locations = data.locations;

            locations.forEach(function(location){
              var state = location.state;
              var thisState = d3.select('path[class*='+state+']');
              locationConcentration[state] += 1;
            })

            //////Added dot in the middle of the state
            /////////////Working with Bubbles

            svg.append("g")
              .attr("class", "bubble")
              .selectAll("circle")
              .data(topojson.feature(us, us.objects.subunits).features)
              .enter().append("circle")
                .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
                .attr("r", function(d) {
                  var tempArray = [];
                  for (var num in locationConcentration) {
                    tempArray.push(locationConcentration[num])
                  }

                  var radius = d3.scale.sqrt()
                    .range([d3.min(tempArray), d3.max(tempArray)]);

                  var abbrev = d.id.split('-').pop();

                  return radius(locationConcentration[abbrev]);
                });

            })
        })
    })()




  })
}
