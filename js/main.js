(function(){
    window.onload = setMap();
    function setMap(){
        //map frame dimensions
        var width = window.innerWidth*0.5,
            height = 473;
        //create new svg container 
        var map = d3.select("#container")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);
        //create Albers equal area conic projection 
        var projection = d3.geoAlbers()
            .center([9.09, 28.15])
            .rotate([108.27, -10.00, 0])
            .parallels([29.32, 75.37])
            .scale(705.05)
            .translate([width / 2, height / 2]);
        var path = d3.geoPath()
            .projection(projection);
        //use Promise.all to parallelize asynchronous data loading
        var promises = [];    
        promises.push(d3.csv("data/attributeData.csv")); //load attributes from csv    
        promises.push(d3.json("data/States.topojson")); //load background spatial data    
        Promise.all(promises).then(callback); 

        function callback(data){
            attributeData = data[0];    
            state = data[1];       
            var states = topojson.feature(state, state.objects.ne_110m_admin_1_states_provinces).features;
            //loop through csv to assign each set of csv attribute values to geojson region
            states = joinData(states, attributeData); 
            var colorScale = makeColorScale(attributeData);
            setEnumerationUnits(states, map, path, colorScale);
            setChart(attributeData,colorScale);
            createDropdown();
            //changeAttribute(this.value, attributeData)
        };        
    };
})();
