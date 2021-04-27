/* Map of GeoJSON data from MegaCities.geojson */
//declare map var in global scope
var map = (map = L.map("mapid", {
  center: [43.0731, -89.4012],
  zoom: 11,
}));
var minValue;

map.on("click", function (e) {
  alert(e.latlng);
});

var measure = "tot_pop_10";
var measureYear = "19";
var attributeYear = "19";
var neighborhoods = [];

// "#FFEDA0"

var getColor = chroma.scale(["white", "#800026"]).domain([0, 20000]);
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var measures = [
  "tot_pop_10",
  "pc_wht_10",
  "avg_huval",
  "yrblt_mdn",
  "trst_trps",
];

var chartWidth = window.innerWidth * 0.5,
  chartWidth = 1200,
  chartHeight = 230,
  leftPadding = 40,
  rightPadding = 2,
  topBottomPadding = 5,
  chartInnerWidth = chartWidth - leftPadding - rightPadding,
  chartInnerHeight = chartHeight - topBottomPadding * 2,
  // translate = "translate(" + leftPadding + "," + 0 + ")";
  translate = "translate(" + leftPadding + "," + topBottomPadding / 2 + ")";

function onEachFeature(feature, layer) {
  var popupContent = measure + "_" + attributeYear;
  if (feature.properties) {
    layer.bindPopup(
      "<p>" +
        "Neighborhood: " +
        feature.properties["NEIGHB_NAME"] +
        "<br>" +
        popupContent +
        ": " +
        feature.properties[popupContent] +
        "</p>"
    );
  }
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: changeColor,
  });
}

function highlightFeature(e) {
  var layer = e.target;
  var neighborName = layer.feature.properties["NEIGHB_NAME"];
  var GEOID;

  for (var i = 0; i < attributes_19.length; i++) {
    if (attributes_19[i]["name"] === neighborName) {
      GEOID = attributes_19[i]["geo_key"];
    }
  }
  highlightNeighBar(GEOID);

  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7,
  });
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function resetHighlight(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 2,
    opacity: 1,
    color: "grey",
    dashArray: "3",
    fillOpacity: 0.7,
  });

  var neighborName = layer.feature.properties["NEIGHB_NAME"];
  var GEOID;

  for (var i = 0; i < attributes_19.length; i++) {
    if (attributes_19[i]["name"] === neighborName) {
      GEOID = attributes_19[i]["geo_key"];
    }
  }
  dehighlightNeighBar(GEOID);

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }
}

function changeColor(e) {
  var layer = e.target;
  var neighborName = layer.feature.properties["NEIGHB_NAME"];
  // console.log(neighborName);

  if (layer.options.fillColor !== colorScale(neighborName)) {
    neighborhoods.push(neighborName);
    layer.setStyle({
      weight: 2,
      opacity: 1,
      color: "grey",
      dashArray: "3",
      fillOpacity: 0.7,
      fillColor: colorScale(neighborName),
    });
    addLine(colorScale);
    updateBarChartColor(colorScale);
  } else {
    const index = neighborhoods.indexOf(neighborName);
    if (index > -1) {
      neighborhoods.splice(index, 1);
    }
    var combinedAttributes = measure + "_" + attributeYear;
    layer.setStyle({
      fillColor: getColor(layer.feature.properties[combinedAttributes]),
    });
    reupdateBarChartColor(layer.feature);

    console.log(layer.feature);
    removeLine(layer.feature);
  }
}

function style(feature) {
  return styleAdd(feature);
}

function styleAdd(feature) {
  $(".form-select").on("change", function () {
    attributeYear = $(this).find(":selected").text();
  });

  var combinedAttributes = measure + "_" + attributeYear;

  return {
    fillColor: getColor(feature.properties[combinedAttributes]),
    weight: 2,
    opacity: 1,
    color: "grey",
    dashArray: "3",
    fillOpacity: 0.7,
    className: feature.properties["NEIGHB_NAME"],
  };
}

//function to instantiate the Leaflet map
function createMap() {
  //add OSM base tilelayer
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }
  ).addTo(map);

  //call getData function
  getData();
}

function getData() {
  var promises = [
    d3.csv("data/nip_neighbassoc_19.csv"),
    d3.csv("data/nip_neighbassoc_18.csv"),
    d3.csv("data/nip_neighbassoc_17.csv"),
    d3.csv("data/nip_neighbassoc_16.csv"),
    d3.csv("data/nip_neighbassoc_15.csv"),
    d3.csv("data/nip_neighbassoc_14.csv"),
    d3.csv("data/nip_neighbassoc_13.csv"),
    d3.csv("data/nip_neighbassoc_12.csv"),
    d3.csv("data/nip_neighbassoc_total.csv"),
    // d3.json("data/EuropeCountries.topojson"),
    (us = d3.json(
      "https://opendata.arcgis.com/datasets/66e4a6a80ae64865a81bc8d4464a6417_12.geojson"
    )),
  ];

  Promise.all(promises).then(callback);
}

function callback(data) {
  attributes_19 = data[0];
  attributes_18 = data[1];
  attributes_17 = data[2];
  attributes_16 = data[3];
  attributes_15 = data[4];
  attributes_14 = data[5];
  attributes_13 = data[6];
  attributes_12 = data[7];
  attributes_all = data[8];
  madisonMap = data[data.length - 1];

  attributes_list = [
    attributes_19,
    attributes_18,
    attributes_17,
    attributes_16,
    attributes_15,
    attributes_14,
    attributes_13,
    attributes_12,
  ];

  // console.log(madisonMap);
  var all_neighborhoods = madisonMap.features.map(
    (d) => d.properties.NEIGHB_NAME
  );

  // console.log(all_neighborhoods);

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  colorScale.domain(all_neighborhoods);

  for (var i = 0; i < attributes_list.length; i++) {
    attributes_list[i] = attributes_list[i].filter((d) => {
      return parseFloat(d[measure]) > 0 && parseFloat(d[measure]) < 200000;
    });
  }

  attributes_19 = attributes_19.filter((d) => {
    return (
      parseFloat(d["tot_pop_10"]) > 0 && parseFloat(d["tot_pop_10"]) < 200000
    );
  });

  madisonMap.features = madisonMap.features.filter((neigh) => {
    return neigh.properties["NEIGHB_NAME"] !== "City of Madison";
  });

  attributes_all_new = attributes_all.map(function (d) {
    // d[measure] = +d[measure];
    d.year = new Date(d.year);

    measures.forEach(function (m) {
      if (m !== "year") {
        d[m] = +d[m];
      }
    });
    return d;
  });
  console.log(attributes_all_new);

  // $(".form-select").on("change", function () {
  //   // console.log("a");

  //   attributeYear = $(this).find(":selected").text();
  //   console.log(attributeYear);
  // });
  // var year = $(".form-select").val();
  // console.log(year);

  for (var i = 0; i < attributes_list.length; i++) {
    joinData(madisonMap, attributes_list[i], measureYear);
    measureYear--;
  }

  console.log(madisonMap);

  var year = 2019;
  var attributeWithYear = L.geoJson(madisonMap, {
    style: style,
    onEachFeature: onEachFeature,
  }).addTo(map);

  createBarChart();
  createLineChart(attributes_all_new);
}

function joinData(madisonMap, attribute, measureYear) {
  for (var i = 0; i < madisonMap.features.length; i++) {
    var neighborsName = madisonMap.features[i]["properties"]["NEIGHB_NAME"];

    for (var j = 0; j < attribute.length; j++) {
      if (attribute[j]["name"] == neighborsName) {
        measures.forEach((measure) => {
          madisonMap.features[i]["properties"][
            measure + "_" + measureYear
          ] = parseFloat(attribute[j][measure]);
        });
        madisonMap.features[i]["properties"]["geo_key"] =
          attribute[j]["geo_key"];

        // console.log(stateName + attributes_19[j]["income"]);
      }
    }
  }
}

function createBarChart() {
  // var expressed = "tot_pop_10";

  var maxValue = d3.max(attributes_19, (d) => {
    return parseFloat(d[measure]);
  });
  var yScale = d3.scaleLinear().range([chartHeight, 0]).domain([0, maxValue]);

  n = attributes_19.length;
  var chart = d3.select("#barChart").append("svg").attr("class", "barchart");
  var bars = chart
    .selectAll(".rect")
    .data(attributes_19)
    .enter()
    .append("rect")
    .sort(function (a, b) {
      return b[measure] - a[measure];
    })
    .attr("id", (d) => {
      return "_" + d.geo_key;
    })
    .attr("class", (d) => {
      return d.name;
    })
    .attr("x", function (d, i) {
      // return i * (chartInnerWidth / n) + leftPadding;
      return i * (chartInnerWidth / n - 1) + leftPadding;
    })
    .attr("width", chartInnerWidth / attributes_19.length - 1.5)
    //size/resize bars
    .attr("height", function (d, i) {
      return 460 - yScale(parseFloat(d[measure]));
    })
    .attr("y", function (d, i) {
      return yScale(parseFloat(d[measure])) + topBottomPadding;
    })
    .style("fill", (d) => getColor(d[measure]))
    .style("color", "blue")
    .style("className", (d) => {
      d.name;
    })
    .on("mouseover", (event, d) => {
      highlightNeighBar(d.geo_key);
      highlightMap(d);
    })
    .on("mouseout", (event, d) => {
      dehighlightNeighBar(d.geo_key);
      dehighlightMap(d);
    })
    .on("click", (event, d) => {
      var neighborName = d.name;
      neighborhoods.push(neighborName);
      changeBarColor(d);
      changeMapColor(d);
      addLine(colorScale);
    });
}

function updateBarChartColor(colorScale) {
  var bar = d3.select("#barChart").select("#barchart");
  neighborhoods.forEach((neigh) => {
    var selectedBar = document.getElementsByClassName(neigh);

    selectedBar[1].style["fill"] = colorScale(neigh);
    // selectedBar[1].style["color"] = colorScale(neigh);
    selectedBar[1].style["stroke-width"] = 1;
  });
}

// Convert back to the original color after clicking on the neighborhoods again
function reupdateBarChartColor(d) {
  var neighborName = d.properties["NEIGHB_NAME"];
  var selectedBar = document.getElementsByClassName(neighborName);
  var variableName = measure + "_" + attributeYear;
  selectedBar[1].style["fill"] = getColor(d.properties[variableName]);
}

function createLineChart(data) {
  var height = 400;
  var width = 700;
  var margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xValue = (d) => d.year;
  const xAxisLabel = "Time";

  const yValue = (d) => d[measure];
  const yAxisLabel = measure;

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth])
    .nice();

  var nested = d3.group(data, (d) => d.name);

  // var neighborhoods = [
  //   "Midvale Heights Community Association",
  //   // "Capitol View Neighborhood Association",
  //   // "Bluff Acres Neighborhood Association",
  //   // "Lake View Hill Neighborhood Association",
  //   // "Allied Dunn's Marsh Neighborhood Association",
  // ];

  // const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  // colorScale.domain(neighborhoods);

  // Filter the data within selected neighborhoods
  var data = data.filter(function (d) {
    return neighborhoods.includes(d.name);
  });

  // Find the max value of selected neighborhoods
  var maxValue = d3.max(data, (d) => {
    return d[measure];
  });

  const title = measure + " by neighborhood from year 2012 - 2019 ";

  // const margin = { top: 20, right: 40, bottom: 88, left: 105 };

  const yScale = d3
    .scaleLinear()
    .domain([0, 5000])
    .range([innerHeight, 0])
    .nice();

  var svg = d3
    .select("#lineChart")
    .append("svg")
    .attr("class", "linePlot")
    .attr("height", "500px")
    .attr("width", "960px");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left + 50},${margin.top + 20})`);

  const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight).tickPadding(15);

  const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth);

  const yAxisG = g.append("g").attr("class", "grid").call(yAxis);
  yAxisG.selectAll(".domain").remove();

  yAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", -40)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .attr("transform", `rotate(-90)`)
    .attr("text-anchor", "middle")
    .text(yAxisLabel);

  const xAxisG = g
    .append("g")
    .attr("class", "grid")
    .call(xAxis)
    .attr("transform", `translate(0,${innerHeight})`);

  // xAxisG.select(".domain").remove();

  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 40)
    .attr("x", innerWidth / 2)
    .attr("fill", "black")
    .text(xAxisLabel);

  // To-do
  // console.log(nested.get(neighborhoods[0]));
  // neighborhoods.forEach(function (neigh) {
  //   var temp = nested.get(neigh).sort((a, b) => a.year - b.year);
  //   console.log(temp);
  //   g.append("path")
  //     .datum(temp)
  //     .attr("fill", "none")
  //     .attr("class", "line-path")
  //     .attr("stroke", colorScale(neigh))
  //     .attr("stroke-width", 2)
  //     .attr(
  //       "d",
  //       d3
  //         .line()
  //         .x(function (d) {
  //           return xScale(d.year);
  //         })
  //         .y(function (d) {
  //           return yScale(d[measure]);
  //         })
  //       // .curve(d3.curveBasis)
  //     );
  //   // ...
  // });

  g.append("text").attr("class", "title").attr("y", -10).text(title);
  // var lineChart = d3
  //   .select("#lineChart")
  //   .append("svg")
  //   .attr("class", "linePlot");

  // const g = lineChart
  //   .append("g")
  //   .attr("transform", `translate(${margin.left},${margin.top})`);

  // g.append("path")
  //   .attr("class", "line-path")
  //   .attr("d", lineGenerator(attributes_all_filtered));
  // g.append("path")
  //   .datum(attributes_all_filtered)
  //   .attr("fill", "none")
  //   .attr("stroke", "steelblue")
  //   .attr("stroke-width", 1.5)
  //   .attr("stroke-linejoin", "round")
  //   .attr("stroke-linecap", "round")
  //   .attr("d", function (d) {
  //     return d3
  //       .line()
  //       .x(function (d) {
  //         return x(d.year);
  //       })
  //       .y(function (d) {
  //         return y(d.measure);
  //       });
  //   });
}

function addLine(colorScale) {
  console.log(attributes_all_new);

  var data = attributes_all_new;
  // Filter the data within selected neighborhoods
  var data = data.filter(function (d) {
    return neighborhoods.includes(d.name);
  });

  // Find the max value of selected neighborhoods
  var maxValue = d3.max(data, (d) => {
    return d[measure];
  });

  var nested = d3.group(data, (d) => d.name);

  var height = 400;
  var width = 700;
  var margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xValue = (d) => d.year;
  const xAxisLabel = "Time";
  const yValue = (d) => d[measure];
  const yAxisLabel = measure;

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain([0, maxValue])
    .range([innerHeight, 0])
    .nice();

  var g = d3.select("#lineChart").select("svg").select("g");

  // var neighborhoods = [
  //   "Richmond Hill Homeowners Association",
  // ];

  const xAxis = d3.axisBottom(xScale).tickSize(-innerHeight).tickPadding(15);
  const yAxis = d3.axisLeft(yScale).tickSize(-innerWidth).tickPadding(10);

  const yAxisG = g.append("g").attr("class", "grid").call(yAxis);
  yAxisG.selectAll(".domain").remove();

  yAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", -60)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .attr("transform", `rotate(-90)`)
    .attr("text-anchor", "middle")
    .text(yAxisLabel);

  const xAxisG = g
    .append("g")
    .attr("class", "grid")
    .call(xAxis)
    .attr("transform", `translate(0,${innerHeight})`);

  xAxisG.select(".domain").remove();

  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 80)
    .attr("x", innerWidth / 2)
    .attr("fill", "black")
    .text(xAxisLabel);

  neighborhoods.forEach(function (neigh) {
    // Arrange the year in ascending order;
    var temp = nested.get(neigh).sort((a, b) => a.year - b.year);
    console.log(temp);
    var geo_key = temp[0].geo_key;
    g.append("path")
      .datum(temp)
      // g.selectAll("path.line")
      //   .append("g")
      //   .data(temp)
      //   .enter()
      //   .append("path")
      .attr("fill", "none")
      .attr("class", "line-path")
      .attr("id", "_" + geo_key)
      .attr("stroke", colorScale(neigh))
      .attr("stroke-width", 2)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return xScale(d.year);
          })
          .y(function (d) {
            return yScale(d[measure]);
          })
        // .curve(d3.curveBasis)
      );
    // ...
  });
}

function removeLine(d) {
  var geo_key_id = "_" + d.properties.geo_key;
  d3.select(".linePlot")
    .select("#" + geo_key_id)
    .remove();
}

function highlightNeighBar(geo_key) {
  var barChart = d3.select("#barChart").select("." + "barchart");
  var bar = barChart.select("#_" + geo_key);

  bar.style("stroke", "red").style("stroke-width", "3");
}

function highlightMap(d) {
  var selected_elements = document.getElementsByClassName(d.name);
  var selected_element = selected_elements[0];
  console.log(selected_element);
  // selected_elements.style["weight"] = "red";
  selected_element.style["stroke"] = "red";
  selected_element.style["stroke-width"] = "4";
}

function dehighlightNeighBar(geo_key) {
  var barChart = d3.select("#barChart").select("." + "barchart");
  var bar = barChart.select("#_" + geo_key);

  bar.style("stroke", "white").style("stroke-width", "0.1");
}

function dehighlightMap(d) {
  var selected_elements = document.getElementsByClassName(d.name);
  var selected_element = selected_elements[0];
  console.log(selected_element);
  // selected_elements.style["weight"] = "red";
  selected_element.style["stroke"] = "grey";
  selected_element.style["stroke-width"] = "2";
}

function changeBarColor(d) {
  var barChart = d3.select("#barChart").select("." + "barchart");
  var bar = barChart.select("#_" + d.geo_key);

  bar.style("fill", colorScale(d.name));
}

function changeMapColor(d) {
  var selected_elements = document.getElementsByClassName(d.name);
  var selected_element = selected_elements[0];
  console.log(selected_element);
  // selected_elements.style["weight"] = "red";
  selected_element.style["fill"] = colorScale(d.name);
  // selected_element.style["stroke-width"] = "4";
}

$(document).ready(createMap);
