// Canvas setup
var canvas = new fabric.Canvas('canvas');
canvas.isDrawingMode = true;
canvas.freeDrawingBrush.width = 35;
canvas.freeDrawingBrush.color = "#000000";
canvas.backgroundColor = "#ffffff";
canvas.renderAll();


// Clear button callback
$("#clear-canvas").click(function(){ 
  canvas.clear(); 
  canvas.backgroundColor = "#ffffff";
  canvas.renderAll();
  updateChart(zeros);
  $("#status").removeClass();
});


// Predict button callback
$("#predict").click(function(){  

  // Change status indicator
  $("#status").removeClass().toggleClass("fa fa-spinner fa-spin");

  // Get canvas contents as url
  var fac = (1.) / 13.; 
  var url = canvas.toDataURLWithMultiplier('png', fac);

  // updateChart([0,0.1,0,0,0,0,0.3,0.2,0.1,0.9]);
  // Post url to python script
  /* */
  var jq = $.post('./', {data:url})
    .done(function (json) {
      if (json.result) {
        $("#status").removeClass().toggleClass("fa fa-check");
        $('#svg-chart').show();
        updateChart(json.data);
      } else {
         $("#status").removeClass().toggleClass("fa fa-exclamation-triangle");
         console.log('Script Error: ' + json.error)
      }
    })
    .fail(function (xhr, textStatus, error) {
      $("#status").removeClass().toggleClass("fa fa-exclamation-triangle");
      console.log("POST Error: " + xhr.responseText + ", " + textStatus + ", " + error);
    }
  );
  

});

// Iniitialize d3 bar chart

$('#svg-chart').show();
var labels = ['0','1','2','3','4','5','6','7','8','9'];
var zeros = [0,0,0,0,0,0,0,0,0,0];

var margin = {top: 0, right: 0, bottom: 20, left: 0},
    width = 360 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

var svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1)
    .domain(labels);
    
var y = d3.scale.linear()
          .range([height, 0])
          .domain([0,1]);  

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(0);

svg.selectAll(".bar")
    .data(zeros)
  .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d, i) { return x(i); })
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d); })
    .attr("height", function(d) { return height - y(d); });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .style("font-size", "10px")
    .call(xAxis).style("font-size", "15px");

function argmax(data){
  var index = 0;
  for(i=1; i<data.length; i++){
    if(data[i]>data[index]){
      index = i;
    }
  }
  return index; 
}
// Update chart data
function updateChart(data) {
  var default_color = 'blue';
  var default_font_size = '15px';
  var colors = Array();
  var text_colors = Array();
  var font_weight = Array();
  var font_sizes = Array();
  var sum = 0;
  for(i=0; i<data.length; i++){
    colors.push(default_color);
    text_colors.push("#000000")
    font_sizes.push(default_font_size);
    font_weight.push("");
    sum += data[i];
  }
  
  if(sum!=0){
    console.log("sum!=0");
    index = argmax(data);
    colors[index] = 'green';
    text_colors[index] = 'red';
    font_sizes[index] = "25px";
    font_weight[index] = 'bold';
  }
  
  d3.selectAll("rect")
    .data(data)
    .transition()
    .duration(500)
    .attr("y", function(d) { return y(d); })
    .attr("height", function(d) { return height - y(d); })
    .attr("fill", function(d, i){return colors[i]});

    svg.selectAll(".tick")
    .style("font-size", function(d, i){return font_sizes[i]})
    .style("font-weight", function(d, i){return font_weight[i]})
    .attr("fill", function(d, i){return text_colors[i]});
}
      