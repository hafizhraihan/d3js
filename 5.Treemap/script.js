const width = 1200;
const height = 1000;

const svg = d3.select("#treemap");
const tooltip = d3.select("#tooltip");

d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json")
  .then(data => {
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    d3.treemap()
      .size([width, height])
      .padding(2)
      .round(true)(root);

    const categories = Array.from(new Set(root.leaves().map(d => d.data.category)));
    const color = d3.scaleOrdinal()
      .domain(categories)
      .range(d3.schemeTableau10);

    const nodes = svg.selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

    // Draw rectangles
    nodes.append("rect")
      .attr("class", "tile")
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category)
      .attr("data-value", d => d.data.value)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => color(d.data.category))
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`)
          .attr("data-value", d.data.value);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // Draw text
    nodes.append("text")
      .attr("pointer-events", "none")
      .attr("x", 4)
      .attr("y", 12)
      .attr("fill", "white")
      .attr("font-size", "10px")
      .each(function(d) {
        const name = d.data.name;
        const words = name.split(/\s|-/g);
        const boxWidth = d.x1 - d.x0 - 8; // 4px padding on each side
        const boxHeight = d.y1 - d.y0;
        const lineHeight = 12;
        const maxLines = Math.floor((boxHeight - 4) / lineHeight); // 4px top padding
        if (maxLines < 1 || boxWidth < 10) return; // Don't render if box is too small
        const textElem = d3.select(this);
        let lines = [];
        let currentLine = '';
        let tspan = textElem.append("tspan").attr("x", 4).attr("y", 12);
        // Build lines
        for (let i = 0; i < words.length; i++) {
          let testLine = (currentLine ? currentLine + ' ' : '') + words[i];
          tspan.text(testLine);
          if (tspan.node().getComputedTextLength() > boxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = words[i];
            if (lines.length === maxLines - 1) {
              // Last line, need to truncate
              let truncated = '';
              tspan.text('');
              for (let c = 0; c < currentLine.length; c++) {
                tspan.text(truncated + currentLine[c] + '...');
                if (tspan.node().getComputedTextLength() > boxWidth) {
                  tspan.text(truncated + '...');
                  break;
                }
                truncated += currentLine[c];
              }
              lines.push(tspan.text());
              currentLine = null;
              break;
            }
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine && lines.length < maxLines) {
          lines.push(currentLine);
        }
        // Render lines
        textElem.selectAll("tspan").remove();
        lines.forEach((line, i) => {
          textElem.append("tspan")
            .attr("x", 4)
            .attr("y", 12 + i * lineHeight)
            .text(line);
        });
      });

    // Draw legend
    const legendWidth = 700;
    const legendHeight = Math.ceil(categories.length / 5) * 30;

    const legendSvg = d3.select("#legend")
      .append("svg")
      .attr("width", legendWidth)
      .attr("height", legendHeight);

    const legendItem = legendSvg.selectAll(".legend-item")
      .data(categories)
      .enter()
      .append("g")
      .attr("transform", (d, i) => {
        const x = (i % 5) * 140;
        const y = Math.floor(i / 5) * 30;
        return `translate(${x}, ${y})`;
      });

    legendItem.append("rect")
      .attr("class", "legend-item")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", d => color(d));

    legendItem.append("text")
      .attr("x", 26)
      .attr("y", 15)
      .text(d => d)
      .attr("fill", "#fff")
      .style("font-size", "13px");
  });
