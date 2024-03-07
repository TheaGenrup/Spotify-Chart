
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


    let dataFilteredByGenre = [];

    for (const song of data) {
        if (song.genre == "pop" || song.genre == "rock" || song.genre == "R&B" || song.genre == "hip hop" || song.genre == "country") {
            dataFilteredByGenre.push(song)
        }
    };


    createChart(dataFilteredByGenre);
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
        .domain([0, 1])
        .range([0, widthCanvas]);


    // y scale
    let yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([heightCanvas, 0]);


    // create SVG
    let svg = d3.select("#visualisation").append("svg")
        .attr("width", widthSvg).attr("height", heightSvg)
        .attr("id", `visualisationSvg`, true);


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
        .attr("transform", `translate(${widthPad}, ${heightPad + heightCanvas})`);
    /*         .attr("text-anchor", "end")
            .append("text")
            .text("Danceability")
            .attr("transform", `translate(${widthCanvas + widthPad}, ${-10})`)
            .attr("fill", "white"); */

    let canvas = svg.append("g")
        .attr("transform", `translate(${widthPad}, ${heightPad})`)
        .attr("id", `canvas`, true)
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

    // create the slider
    const slider = document.createElement("input");
    document.querySelector("#sliderContainer").append(slider);
    slider.type = "range";
    slider.min = "2010";
    slider.max = "2019";
    slider.value = "2010";
    slider.id = "slider";

    const sliderWidth = 673;

    let sliderSvg = d3.select("#sliderContainer").append("svg")
        .attr("height", 20).attr("width", sliderWidth)
        .attr("transform", `translate(${0}, 0)`);

    const sliderScale = d3.scaleLinear()
        .domain([2010, 2019])
        .range([0, sliderWidth]);

    const sliderAxis = d3.axisBottom(sliderScale)
        .tickFormat(d => d);
    //  .tickValues([2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019]);

    let sliderAxisGroup = sliderSvg.append("g")
        .attr("transform", `translate(${0}, ${0})`)
        .call(sliderAxis);

    //let oldSliderValue = localStorage.getItem("activeYear");
    /*     let oldSliderValue = 2010;
        if (oldSliderValue == null) {
            oldSliderValue = 2010
        }
        slider.value = oldSliderValue; */

    // update the slider value element when the slider's value changes
    /* slider.addEventListener("change", () => {
        //   localStorage.activeYear = slider.value;
        const newSliderValue = document.querySelector("#slider").value;

        const dataFilteredByNewYear = data.filter(song => parseInt(song.year) == newSliderValue);


        console.log(1);

        d3.select("#canvas")
            .selectAll("circle")
            .data(dataFilteredByNewYear)
            //  .transition()
            //.duration()
            .attr("fill", setColor)
            .attr("r", setRadius)
            .attr("cx", (d) => xScale(d.danceability))
            .attr("cy", (d) => yScale(d.valence));

    }); */

    slider.addEventListener("change", () => {
        const newSliderValue = document.querySelector("#slider").value;
        const dataFilteredByNewYear = data.filter(song => parseInt(song.year) == newSliderValue);

        console.log(dataFilteredByNewYear);


        // Update the data bound to the circles
        const circles = d3.select("#canvas").selectAll("circle").data(dataFilteredByNewYear);

        // Enter selection: add new circles for new data points
        circles.enter()
            .append("circle")
            .attr("fill", setColor)
            .merge(circles) // Merge enter and update selections
            .attr("r", setRadius)
            .attr("cx", (d) => xScale(d.danceability))
            .attr("cy", (d) => yScale(d.valence));

        // Exit selection: remove circles for removed data points
        circles.exit().remove();
    });



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

    let legendGenres = d3.legendColor()
        .scale(colorScale)
        .shape("circle")
        .shapeRadius(11);
    //.orient("horizontal")


    let svg = d3.select("#visualisationSvg")

    //felet var är att elementet jag placera g:et i inte är ett svg-elemet

    let g = svg.append("g")
        .call(legendGenres)
        .attr("id", "legend", true)
        .attr("transform", "translate(500,640)")
        .selectAll("text")
        .style("fill", "white");



    d3.select("#legend").append("text")
        .text("Genres")
        .attr("x", -11)
        .attr("y", -35)
        .style("fill", "white")
        .style("font-weight", "bold");


    d3.select(".cell:nth-child(2)").attr("transform", "translate(0,30)")
    d3.select(".cell:nth-child(3)").attr("transform", "translate(130,0)")
    d3.select(".cell:nth-child(4)").attr("transform", "translate(130,30)")
    d3.select(".cell:nth-child(5)").attr("transform", "translate(260,0)")
} 
