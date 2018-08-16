// D3 Interactive Scatter Plot

// Create the scatter plot dimensions with D3.js.
var aspect_ratio = 0.52
var svgWidth = parseInt(d3.select('.chart').style('width'), 10) * 0.9;
var svgHeight = svgWidth * aspect_ratio;

var margin = {
  top: 0.04 * svgHeight,
  right: 0.042 * svgWidth,
  bottom: 0.12 * svgHeight,
  left: 0.125 * svgWidth
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, 0)`);

// Initial Paramamters for the chart
var chosenXAxis = "povlessHs";
var chosenYAxis = "lessHs";

// function used for updating x-scale var upon click on axis label
function xScale(povData, chosenXAxis) {
  // Conditional loop to create scales
  if (chosenXAxis === "povCollege") {
    var xLinearScale = d3.scaleLinear()
      .domain([0, 25])
      .range([0, width]);
  } else {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(povData, d => d[chosenXAxis]) * 0.8,
      d3.max(povData, d => d[chosenXAxis]) * 1.2])
      .range([0, width]);
  }
    
  return xLinearScale;

}

// function used for updating y-scale var upon click on axis label
function yScale(povData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(povData, d => d[chosenYAxis] * 1.2)])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group (allCircles) with a transition to
// new circles
function renderCircles(allCircles, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  allCircles.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return allCircles;
}

// function used for updating circles text group (allTexts) with a transition to
// new circles
function renderText(allText, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  allText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]-0.4));

  return allText;
}

// Import Data (run local hose)
d3.csv("data/data.csv", function(err, povData) {
    if (err) throw err; 

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    povData.forEach(function(data) {
        data[chosenXAxis] = +data[chosenXAxis];
        data[chosenYAxis] = +data[chosenYAxis];
      });

    // xLinearScale function above csv import
    var xLinearScale = xScale(povData, chosenXAxis);

    // yLinearScale function above csv import
    var yLinearScale = yScale(povData, chosenYAxis);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    var yAxis = chartGroup.append("g")
    .call(leftAxis);
    
    // Append a group to the chart to hold the cirles and the cirlces text
    chartGroup.append("g")
    .classed("circles", true);

    // Step 5: Create Circles and Circles Text
    // ==============================
    var circlesGroup = d3.select(".circles");

    var allCircles = circlesGroup.selectAll("circles")
    .data(povData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "15")
    .attr("fill", "lightblue")
    .attr("stroke", "black");

    var allText = circlesGroup.selectAll("text")
    .data(povData)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]-0.4))
    .attr("text-anchor", "middle")
    .attr("fill", "black")
    .attr("stroke-width", "3")
    .text(d => d.abbr);

    // Step 6: Initialize tool tip with current x and y axis values
    // ==============================
    var toolTip = d3.tip()
    .attr("class", "tooltip")
    .attr("position", "absolute")
    .attr("color", "blue")
    .html(d => `${d.state}<br>Poverty: ${d[chosenYAxis]}%<br>Population: ${d[chosenXAxis]}%`);

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    allText.on("click", function(data) {
    toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

    // Create group for  3 x- axis labels
    var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 0.03 * svgHeight})`);

    var povlessHsLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 0.05 * svgHeight)
    .attr("class", "axisText")
    .attr("value", "povlessHs") // value to grab for event listener
    .classed("active", true)
    .text("Poverty % - less than HS Eductation");

    var povHsLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 0.09 * svgHeight)
    .attr("class", "axisText")
    .attr("value", "povHsGed") // value to grab for event listener
    .classed("inactive", true)
    .text("Poverty % - HS Eductation");

    var povCollegeLabel = labelsGroupX.append("text")
    .attr("x", 0)
    .attr("y", 0.13 * svgHeight)
    .attr("class", "axisText")
    .attr("value", "povCollege") // value to grab for event listener
    .classed("inactive", true)
    .text("Poverty % - College Eductation");

    // Create group for  3 y- axis labels
    var labelsGroupY = chartGroup.append("g")
    .attr("transform", `translate(${0 - (height / 2)}, ${0 - margin.left + (0.042 * svgWidth)})`);

    var lessHsLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0.17 * svgWidth)
    .attr("x", -0.56 * svgHeight)
    .attr("dy", "1em")
    .attr("class", "axisText")
    .attr("value", "lessHs") // value to grab for event listener
    .classed("active", true)
    .text("Pop % - less than HS Education");

    var hsLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0.15 * svgWidth)
    .attr("x", -0.56 * svgHeight)
    .attr("dy", "1em")
    .attr("class", "axisText")
    .attr("value", "hsGed") // value to grab for event listener
    .classed("inactive", true)
    .text("Pop % - HS Education");

    var collegeLabel = labelsGroupY.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0.13 * svgWidth)
    .attr("x", -0.56 * svgHeight)
    .attr("dy", "1em")
    .attr("class", "axisText")
    .attr("value", "college") // value to grab for event listener
    .classed("inactive", true)
    .text("Pop % - College Education");

    // x axis labels event listener
    labelsGroupX.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(povData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values (and currnt y values)
        allCircles = renderCircles(allCircles, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates circles with new x values (and current y values)
        allText = renderText(allText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // changes classes to change bold text for chosen x axis
        if (chosenXAxis === "povlessHs") {
          povlessHsLabel
            .classed("active", true)
            .classed("inactive", false);
          povHsLabel
            .classed("active", false)
            .classed("inactive", true);
          povCollegeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "povHsGed") {
          povlessHsLabel
            .classed("active", false)
            .classed("inactive", true);
          povHsLabel
            .classed("active", true)
            .classed("inactive", false);
          povCollegeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povlessHsLabel
            .classed("active", false)
            .classed("inactive", true);
          povHsLabel
            .classed("active", false)
            .classed("inactive", true);
          povCollegeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

    // y axis labels event listener
    labelsGroupY.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;

        console.log(chosenYAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(povData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values (and current x values)
        allCircles = renderCircles(allCircles, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // updates circles with new x values (and current x values)
        allText = renderText(allText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        // changes classes to change bold text for chosen y axis
        if (chosenYAxis === "lessHs") {
          lessHsLabel
            .classed("active", true)
            .classed("inactive", false);
          hsLabel
            .classed("active", false)
            .classed("inactive", true);
          collegeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "hsGed") {
          lessHsLabel
            .classed("active", false)
            .classed("inactive", true);
          hsLabel
            .classed("active", true)
            .classed("inactive", false);
          collegeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          lessHsLabel
            .classed("active", false)
            .classed("inactive", true);
          hsLabel
            .classed("active", false)
            .classed("inactive", true);
          collegeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});