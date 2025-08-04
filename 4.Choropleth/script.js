(async function () {
  const eduDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
  const countyDataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

  const education = await fetch(eduDataUrl).then(res => res.json());
  const counties = await fetch(countyDataUrl).then(res => res.json());

  const width = 960;
  const height = 600;

  const svg = d3.select("#choropleth")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select("#tooltip");

  const path = d3.geoPath();

  const eduRates = education.map(d => d.bachelorsOrHigher);
  const minEdu = d3.min(eduRates);
  const maxEdu = d3.max(eduRates);

  const colorScale = d3.scaleThreshold()
    .domain(d3.range(minEdu, maxEdu, (maxEdu - minEdu) / 8))
    .range(d3.schemeBlues[9]);

  function getEducation(fips) {
    const result = education.find(item => item.fips === fips);
    return result ? result.bachelorsOrHigher : 0;
  }

  svg.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(counties, counties.objects.counties).features)
    .join("path")
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr("data-education", d => getEducation(d.id))
    .attr("fill", d => colorScale(getEducation(d.id)))
    .attr("d", path)
    .on("mouseover", (event, d) => {
      const edu = getEducation(d.id);
      const countyData = education.find(e => e.fips === d.id);

      tooltip.style("opacity", 0.95)
        .attr("data-education", edu)
        .html(`
          <strong>${countyData.area_name}, ${countyData.state}</strong><br/>
          Bachelor's or Higher: ${edu.toFixed(1)}%
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 60) + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));

  // Legend
  const legendWidth = 400;
  const legendHeight = 50;

  const legendSvg = d3.select("#legend")
    .append("svg")
    .attr("width", legendWidth)
    .attr("height", legendHeight);

  const legendData = colorScale.range().map(color => {
    const d = colorScale.invertExtent(color);
    return { color: color, extent: d };
  });

  const xLegendScale = d3.scaleLinear()
    .domain([minEdu, maxEdu])
    .range([0, legendWidth - 50]);

  const xAxisLegend = d3.axisBottom(xLegendScale)
    .tickSize(10)
    .tickValues(legendData.map(d => d.extent[0]))
    .tickFormat(d3.format(".1f"));

  legendSvg.selectAll("rect")
    .data(legendData)
    .join("rect")
    .attr("class", "legend-rect")
    .attr("x", d => xLegendScale(d.extent[0]))
    .attr("y", 0)
    .attr("width", d => {
      if (d.extent[1] === undefined) return 0;
      return xLegendScale(d.extent[1]) - xLegendScale(d.extent[0]);
    })
    .attr("height", 20)
    .attr("fill", d => d.color);

  legendSvg.append("g")
    .attr("id", "legend-axis")
    .attr("transform", `translate(0, 20)`)
    .call(xAxisLegend);
})();
