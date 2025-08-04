const dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const margin = { top: 60, right: 40, bottom: 60, left: 80 };
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const chart = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");

d3.json(dataUrl).then(data => {
  data.forEach(d => {
    d.Year = new Date(d.Year, 0, 1);
    const [min, sec] = d.Time.split(":");
    d.TimeDate = new Date(1970, 0, 1, 0, +min, +sec);
  });

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.Year))
    .range([0, width]);

  const yScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.TimeDate))
    .range([0, height]);

  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.timeFormat("%Y"));

  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.timeFormat("%M:%S"));

  chart.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  chart.append("g")
    .attr("id", "y-axis")
    .call(yAxis);

  // Dots
  chart.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", d => `dot${d.Doping ? " doping" : ""}`)
    .attr("r", 6)
    .attr("cx", d => xScale(d.Year))
    .attr("cy", d => yScale(d.TimeDate))
    .attr("data-xvalue", d => d.Year.toISOString())
    .attr("data-yvalue", d => d.TimeDate.toISOString())
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 0.95)
        .style("left", (event.pageX + 12) + "px")
        .style("top", (event.pageY - 60) + "px")
        .attr("data-year", d.Year.toISOString())
        .html(`
          <strong>${d.Name}</strong> (${d.Nationality})<br/>
          <span>Year: ${d.Year.getFullYear()}, Time: ${d.Time}</span><br/>
          ${d.Doping ? `<em>${d.Doping}</em>` : `<em>No doping allegations</em>`}
        `);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // Legend
  const legendData = [
    { text: "No doping allegations", color: "steelblue" },
    { text: "Riders with doping allegations", color: "#e67e22" }
  ];

  const legend = d3.select("#legend")
    .selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("div")
    .attr("class", "legend-item");

  legend.append("div")
    .attr("class", "legend-color")
    .style("background-color", d => d.color);

  legend.append("span")
    .text(d => d.text);
});
