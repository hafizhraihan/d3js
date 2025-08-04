const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';

fetch(url)
  .then(res => res.json())
  .then(data => {
    const dataset = data.data;
    const w = 1000;
    const h = 500;
    const padding = 60;

    const svg = d3.select('#chart')
      .attr('width', w)
      .attr('height', h);

    const xScale = d3.scaleTime()
      .domain([new Date(d3.min(dataset, d => d[0])), new Date(d3.max(dataset, d => d[0]))])
      .range([padding, w - padding]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(dataset, d => d[1])])
      .range([h - padding, padding]);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
      .attr('id', 'x-axis')
      .attr('transform', `translate(0, ${h - padding})`)
      .call(xAxis);

    svg.append('g')
      .attr('id', 'y-axis')
      .attr('transform', `translate(${padding}, 0)`)
      .call(yAxis);

    const barWidth = (w - 2 * padding) / dataset.length;

    svg.selectAll('rect')
      .data(dataset)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(new Date(d[0])))
      .attr('y', d => yScale(d[1]))
      .attr('width', barWidth)
      .attr('height', d => h - padding - yScale(d[1]))
      .attr('data-date', d => d[0])
      .attr('data-gdp', d => d[1])
      .on('mouseover', function (event, d) {
      const tooltip = document.getElementById('tooltip');
      tooltip.innerHTML = `<strong>${d[0]}</strong><br>GDP: $${d[1].toLocaleString()} Billion`;
      tooltip.setAttribute('data-date', d[0]);

      const tooltipWidth = tooltip.offsetWidth;
      const tooltipHeight = tooltip.offsetHeight;

      tooltip.style.left = (event.pageX - tooltipWidth / 2) + 'px';
      tooltip.style.top = (event.pageY - tooltipHeight - 10) + 'px'; // 10px above the cursor
      tooltip.style.opacity = 1;
    })

      .on('mouseout', function () {
        document.getElementById('tooltip').style.opacity = 0;
      });
  });
