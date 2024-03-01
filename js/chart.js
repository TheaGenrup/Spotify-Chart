
d3.csv('data.csv').then(d => {


    let data = [];

    for (const song of d) {
        if (song.year >= 2010 && song.year <= 2019) {
            data.push({
                year: song.year,
                popularity: song.popularity,
                valence: song.valence,
                danceability: song.danceability,
                genre: song.genre
            })
        }
    };

    console.log(data[1]);
    createChart(data);
});

function createChart(data) {


    // get years
    const years = [];
    data.forEach(song => {

        if (!years.includes(parseInt(song.year))) {
            years.push(parseInt(song.year));
        }
    });
    years.sort((a, b) => a - b);



}



// detta är en annan chart gjord på samma data
function chart(data) {

    // get years
    const years = [];
    data.forEach(song => {

        if (!years.includes(parseInt(song.year))) {
            years.push(parseInt(song.year));
        }
    });
    years.sort((a, b) => a - b);


    // calculate average valence for each year
    const averageValence = [];
    years.forEach(year => {

        const songsInYear = data.filter(song => song.year == year);

        const totalValence = songsInYear.reduce((sum, song) => sum + parseFloat(song.valence), 0);
        // averageValence[year] = totalValence / songsInYear.length;
        averageValence.push({ year: year, averageValence: totalValence / songsInYear.length })
    });


    // set variables
    const heightSvg = 500, widthSvg = 900,
        widthCanvas = .90 * widthSvg,
        heightCanvas = .90 * heightSvg,
        widthPad = (widthSvg - widthCanvas) / 2,
        heightPad = (heightSvg - heightCanvas) / 2,
        valenceValues = d3.map(averageValence, song => song.averageValence);

    // scales

    // x scale
    let xScale = d3.scaleBand()
        .domain(years)
        .range([0, widthCanvas])
        .paddingInner(1)
        .paddingOuter(.3);


    // y scale
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(valenceValues) * 1.2])
        .range([heightCanvas, 0]);


    // create SVG
    let svg = d3.select("body").append("svg")
        .attr("width", widthSvg).attr("height", heightSvg)

    // create canvas background
    svg.append("rect")
        .attr("width", widthCanvas)
        .attr("height", heightCanvas)
        .attr("x", widthPad)
        .attr("y", heightPad)
        .attr("fill", "white");


    // create canvas
    let canvas = svg.append("g")
        .attr("transform", `translate(${widthPad}, ${heightPad})`);

    // axis
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .attr("transform", `translate(${widthPad}, ${heightPad})`)

    svg.append("g")
        .call(d3.axisBottom(xScale))
        .attr("transform", `translate(${widthPad}, ${heightPad + heightCanvas})`)

    //grid lines
    svg.append("g")
        .attr("class", "grid-lines")
        .selectAll("line")
        .data(yScale.ticks(10))
        .enter().append("line")
        .attr("x1", 0)
        .attr("x2", widthCanvas)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("transform", `translate(${widthPad}, ${heightPad})`)
        .attr("stroke", "lightgrey")
        .attr("stroke-opacity", 0.5)
        .attr("shape-rendering", "auto");

    // Create a line generator
    const lineGenerator = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.averageValence));

    // Create a line
    canvas.append("path")
        .datum(averageValence)
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", 1.5)
        .attr("d", lineGenerator);


}
