
d3.csv('data.csv').then(d => {


    let data = [];

    for (const song of d) {
        if (song.year >= 2010 && song.year <= 2019) {
            data.push({
                year: song.year,
                popularity: song.popularity,
                valence: song.valence,
                danceability: song.danceability,
                genre: song.genre,
                name: song.song,
                artist: song.artist
            })
        }
    };

    console.log(data[1]);
    createChart(data);
});

function createChart(data) {

    // get genres
    const genres = [];
    data.forEach(song => {

        if (!genres.includes(parseInt(song.genre))) {
            genres.push(parseInt(song.genre));
        }
    });

    // get all years and active year
    const years = [];
    data.forEach(song => {

        if (!years.includes(parseInt(song.year))) {
            years.push(parseInt(song.year));
        }
    });
    years.sort((a, b) => a - b);

    let activeYear = localStorage.activeYear;
    if (localStorage.activeYear === undefined) {
        activeYear = 2015;
    }

    const dataFilteredByYear = data.filter(song => parseInt(song.year) === activeYear);


    // set variables
    const heightSvg = 500, widthSvg = 900,
        widthCanvas = .90 * widthSvg,
        heightCanvas = .90 * heightSvg,
        widthPad = (widthSvg - widthCanvas) / 2,
        heightPad = (heightSvg - heightCanvas) / 2;

    // scales

    // radius scale
    const minPopularity = d3.min(data.map(song => song.popularity));
    const maxPopularity = d3.max(data.map(song => song.popularity));
    const radiusScale = d3.scaleLinear()
        .domain([minPopularity, maxPopularity])
        .range([2, 10]);

    // x scale
    let xScale = d3.scaleLinear()
        .domain([0, d3.max(dataFilteredByYear.map((song) => song.danceability)) * 1.2])
        .range([0, widthCanvas])


    // y scale
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(dataFilteredByYear.map((song) => song.valence)) * 1.2])
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


    // axis
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .attr("transform", `translate(${widthPad}, ${heightPad})`)

    svg.append("g")
        .call(d3.axisBottom(xScale))
        .attr("transform", `translate(${widthPad}, ${heightPad + heightCanvas})`)

    let canvas = svg.append("g")
        .attr("transform", `translate(${widthPad}, ${heightPad})`)
        .selectAll("rect")
        .data(data)
        .enter()
        .append("circle")
        .attr("fill", setColor)
        .attr("opacity", 0.6)
        .attr("r", setRadius)
        .attr("cx", (d) => xScale(d.danceability))
        .attr("cy", (d) => yScale(d.valence));


    function setColor(d) {
        return "salmon"
    }


    function setRadius(song) {
        return radiusScale(song.popularity);
    }
}


