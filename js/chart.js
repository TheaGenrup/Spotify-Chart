
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
    createLegend();
});

function createChart(data) {

    // get genres
    const genres = [];
    data.forEach(song => {

        if (!genres.includes(song.genre)) {
            genres.push(song.genre);
        }
    });

    console.log(genres);


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
        activeYear = 2010;
    }

    const dataFilteredByYear = data.filter(song => parseInt(song.year) === activeYear);
    // console.log(data.filter(song => song.genre == "hip hop, pop"));

    // set variables
    const heightSvg = 600, widthSvg = 900,
        widthCanvas = .80 * widthSvg,
        heightCanvas = .80 * heightSvg,
        widthPad = (widthSvg - widthCanvas) / 2,
        heightPad = (heightSvg - heightCanvas) / 2;

    // scales

    // radius scale
    const minPopularity = d3.min(data.map(song => song.popularity));
    const maxPopularity = d3.max(data.map(song => song.popularity));
    const radiusScale = d3.scaleLinear()
        .domain([minPopularity, maxPopularity])
        .range([4, 12]);

    // x scale
    let xScale = d3.scaleLinear()
        .domain([0, d3.max(dataFilteredByYear.map((song) => song.danceability)) * 1.2])
        .range([0, widthCanvas])


    // y scale
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(dataFilteredByYear.map((song) => song.valence)) * 1.2])
        .range([heightCanvas, 0]);


    // create SVG
    let svg = d3.select("#visualisation").append("svg")
        .attr("width", widthSvg).attr("height", heightSvg)
        .attr("transform", `translate(${widthPad}, 0)`)


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
        .attr("text-anchor", "end")
        .append("text")
        .text("Valence")
        .attr("transform", `translate(${widthPad / 2}, ${-10})`)
        .attr("fill", "white");


    svg.append("g")
        .call(d3.axisBottom(xScale))
        .attr("transform", `translate(${widthPad}, ${heightPad + heightCanvas})`)
    /*         .attr("text-anchor", "end")
            .append("text")
            .text("Danceability")
            .attr("transform", `translate(${widthCanvas + widthPad}, ${-10})`)
            .attr("fill", "white"); */

    let canvas = svg.append("g")
        .attr("transform", `translate(${widthPad}, ${heightPad})`)
        .selectAll("rect")
        .data(data)
        .enter()
        .append("circle")
        .attr("fill", setColor)
        .attr("opacity", 0.7)
        .attr("r", setRadius)
        .attr("cx", (d) => xScale(d.danceability))
        .attr("cy", (d) => yScale(d.valence));

    /* 
        const newGenres = [
            { genre: "Pop", color: "#FF8080" },
            { genre: "Rock", color: "#CDFADB" },
            { genre: "R&B", color: "#FFCF96" },
        ]; */

    function setColor(song) {

        switch (song.genre) {
            case "pop":
                return "#FF8080";
                break;
            case "rock":
                return "#CDFADB";
                break;
            case "R&B":
                return "#FFCF96";
                break;
            case "hip hop":
                return "#FFBE98";
                break;
            case "country":
                return "#A4CE95";
                break;
            default:
                return "none";

                break;
        }
    }


    function setRadius(song) {
        return radiusScale(song.popularity);
    }
}

function createLegend() {

    const genreDomain = ["Pop", "Hip Hop", "R&B", "Country", "Rock"];
    const colorRange = ["#FF8080", "#FFBE98", "#FFCF96", "#A4CE95", "#CDFADB"];

    let colorScale = d3.scaleOrdinal(genreDomain, colorRange);

    console.log(genreDomain);
    console.log(colorRange);

    let legendGenres = d3.legendColor()
        .scale(colorScale)
        .shape("circle")
        .shapeRadius(11)
    //.orient("horizontal")


    let svg = d3.select("svg")

    //felet var är att elementet jag placera g:et i inte är ett svg-elemet

    let g = svg.append("g")
        .call(legendGenres)
        .attr("transform", "translate(600,600)")
        .selectAll("text")
        .style("fill", "white")


} 
