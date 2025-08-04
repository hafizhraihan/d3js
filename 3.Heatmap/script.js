const width = 1400;
const height = 700;
const padding = 100;

const svg = d3.select("#chart")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("#tooltip");

const colors = d3.schemeRdYlBu[11].reverse();

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
  .then(data => {
    const baseTemp = data.baseTemperature;
    const monthlyData = data.monthlyVariance;

    monthlyData.forEach(d => {
      d.month -= 1; // convert to 0-indexed
    });

    const xScale = d3.scaleBand()
      .domain(monthlyData.map(d => d.year))
      .range([padding, width - padding]);

    const yScale = d3.scaleBand()
      .domain(d3.range(12))
      .range([padding, height - padding]);

    const varianceExtent = d3.extent(monthlyData, d => baseTemp + d.variance);
    const colorScale = d3.scaleQuantile()
      .domain(varianceExtent)
      .range(colors);

    // X Axis
    const xAxis = d3.axisBottom(xScale)
      .tickValues(xScale.domain().filter(year => year % 10 === 0))
      .tickFormat(d3.format("d"));

    svg.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height - padding})`)
      .call(xAxis);

    // Y Axis
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(month => d3.timeFormat("%B")(new Date(0, month)));

    svg.append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`)
      .call(yAxis);

    // Cells
    svg.selectAll(".cell")
      .data(monthlyData)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", d => d.month)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => baseTemp + d.variance)
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(d.month))
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(baseTemp + d.variance))
      .on("mouseover", function (event, d) {
        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.year} - ${d3.timeFormat("%B")(new Date(0, d.month))}</strong><br/>
            Temp: ${(baseTemp + d.variance).toFixed(2)}℃<br/>
            Variance: ${d.variance.toFixed(2)}℃
          `)
          .attr("data-year", d.year);
      })
      .on("mousemove", function(event) {
        const tooltipNode = tooltip.node();
        const tooltipWidth = tooltipNode.offsetWidth;
        const tooltipHeight = tooltipNode.offsetHeight;
        let left = event.pageX + 10;
        let top = event.pageY - 40;
        if (left + tooltipWidth > window.innerWidth) {
          left = window.innerWidth - tooltipWidth - 10;
        }
        if (top + tooltipHeight > window.innerHeight) {
          top = window.innerHeight - tooltipHeight - 10;
        }
        tooltip.style("left", left + "px").style("top", top + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // Legend
    const legendWidth = 400;
    const legendHeight = 30;
    const legendX = d3.scaleLinear()
      .domain(varianceExtent)
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendX)
      .tickValues(colorScale.quantiles())
      .tickFormat(d3.format(".1f"));

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${(width - legendWidth) / 2}, ${height - padding / 2})`);

    legend.selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (legendWidth / colors.length))
      .attr("y", 0)
      .attr("width", legendWidth / colors.length)
      .attr("height", legendHeight)
      .attr("fill", d => d);

    legend.append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(legendAxis);
  });
