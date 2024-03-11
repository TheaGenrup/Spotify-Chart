
d3.csv('data.csv').then(d => {


    let data = [];

    for (const song of d) {
        if (song.year >= 2010 && song.year <= 2019) {

            let genreArray = song.genre.split(", ");


            genreArray = genreArray.map(genre => genre.toLowerCase());

            data.push({
                year: song.year,
                popularity: song.popularity,
                valence: song.valence,
                danceability: song.danceability,
                genre: genreArray,
                name: song.song,
                artist: song.artist
            })
        }
    };

    console.log(data);

    createChart(data);

});

function createChart(data) {


    const genres = [];


    data.forEach(song => {

        song.genre.forEach(genre => {

            if (!genres.includes(genre) && genre !== "set()") {
                genres.push(genre);
            }
        });

    })
    let capitalizedGenres = genres.map(str => str.charAt(0).toUpperCase() + str.slice(1));


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
    const heightSvg = 700, widthSvg = 1100,
        widthCanvas = .80 * widthSvg,
        heightCanvas = .70 * heightSvg,
        widthPad = (widthSvg - widthCanvas) / 2,
        heightPad = (heightSvg - heightCanvas) / 2;

    // scales

    // radius scale
    const minPopularity = d3.min(data.map(song => song.popularity));
    const maxPopularity = d3.max(data.map(song => song.popularity));
    const radiusScale = d3.scaleLinear()
        .domain([minPopularity, maxPopularity])
        .range([2, 15]);

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

    // axis
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .attr("transform", `translate(${widthPad}, ${heightPad})`)
        .attr("text-anchor", "end")
        .append("text")
        .text("Valence")
        .attr("transform", `translate(${27}, ${-20})`)
        .attr("fill", "#7d867d")
        .attr("font-weight", "bold");


    svg.append("g")
        .call(d3.axisBottom(xScale))
        .attr("transform", `translate(${widthPad}, ${heightPad + heightCanvas})`)
        .attr("text-anchor", "end")
        .append("text")
        .text("Danceability")
        .attr("transform", `translate(${widthCanvas + widthPad}, 5)`)
        .attr("fill", "#7d867d")
        .attr("font-weight", "bold");

    let canvas = svg.append("g")
        .attr("transform", `translate(${widthPad}, ${heightPad})`)
        .attr("id", `canvas`, true)
        .selectAll("rect")
        .data(dataFilteredByYear)
        .enter()
        .append("circle")
        .attr("opacity", 0.7)
        .attr("fill", "white")
        .attr("class", d => d.genre)
        .attr("r", setRadius)
        .attr("cx", (d) => xScale(d.danceability))
        .attr("cy", (d) => yScale(d.valence));


    // create the slider
    const slider = document.createElement("input");
    document.querySelector("#sliderContainer").append(slider);
    slider.type = "range";
    slider.min = "2010";
    slider.max = "2019";
    slider.value = "2010";
    slider.id = "slider";

    const sliderWidth = 800;

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

    slider.addEventListener("input", () => {
        const newSliderValue = document.querySelector("#slider").value;
        const dataFilteredByNewYear = data.filter(song => parseInt(song.year) == newSliderValue);


        // Update the data bound to the circles
        const circles = d3.select("#canvas").selectAll("circle")
            .data([])
            .exit()
            .remove();


        d3.select("#canvas")
            .selectAll("circle")
            .data(dataFilteredByNewYear)
            .enter()
            .append("circle")
            .attr("opacity", 0.7)
            .attr("fill", "beige")
            .attr("data-genre", d => d.genre)
            .attr("cx", (d) => xScale(d.danceability))
            .attr("cy", (d) => yScale(d.valence))
            .attr("r", 0)
            .transition()
            .duration(300)
            .attr("r", setRadius)

    });


    function setRadius(song) {
        return radiusScale(song.popularity);
    }

    createLegend(data, capitalizedGenres, widthPad, heightSvg);


}


function createLegend(data, genres, widthPad, heightSvg) {

    // const colorRange = ["#FF8080", "#FFBE98", "#FFCF96", "#A4CE95", "#CDFADB", "#B47EBE", "#AAB464", "#F4D67B", "#194D33", "##BB849A"];

    const colorRange = ["#FF8080", "#FFBE98", "#d7adbe", "#f0a967", "#C27664", "#89B9AD", "#ffd380", "#c56477", "#92ba92", "#f7bbad", "#DF7857", "#F99B7D"];

    let colorScale = d3.scaleOrdinal(genres, colorRange);

    let legendGenres = d3.legendColor()
        .scale(colorScale)
        .shape("circle")
        .shapeRadius(11)
        .on("cellover", event => {

            const hoveredGenre = event.target.parentNode.querySelector("text").textContent.toLowerCase()

            d3.selectAll("#canvas circle")
                .attr("opacity", circle => {

                    if (!circle.genre.includes(hoveredGenre)) {
                        return 0.1;
                    }
                    return 0.7;
                })
                .attr("fill", circle => {

                    const hoveredGenreColor = event.target.parentNode.querySelector(".swatch").style.fill;

                    if (circle.genre.includes(hoveredGenre)) {
                        return hoveredGenreColor;
                    }
                    return "white";
                });

        })
        .on("cellout", () => {
            d3.selectAll("#canvas circle")
                .attr("opacity", 0.7)
                .attr("fill", "white");
        });
    //.orient("horizontal")

    let legend = d3.select("#visualisationSvg").append("g").attr("id", "legend", true)
        .attr("transform", `translate(${0},${100})`)
        ;

    //felet var är att elementet jag placera g:et i inte är ett svg-elemet

    const legendHeight = 140;

    let genresContainer = legend.append("g")
        .call(legendGenres)
        .attr("id", "genresContainer")
        .attr("height", legendHeight)
        .attr("transform", `translate(${widthPad},${heightSvg})`)
        .selectAll("text")
        .style("fill", "white");

    d3.select("#genresContainer").append("text")
        .text("Genres")
        .attr("x", -11)
        .attr("y", -35)
        .style("fill", "white")
        .style("font-weight", "bold");

    // add genre data attribute to swatches and text
    d3.select('#genresContainer')
        .selectAll('.swatch')
        .data(genres)
        .attr("data-genre", genre => genre);

    d3.select('#genresContainer')
        .selectAll('text')
        .data(genres)
        .attr("data-genre", genre => genre);

    let legendCells = d3.selectAll(".cell");
    let cellGap = 80;

    for (let i = 0; i < legendCells.size() + 1; i++) {

        let cell = d3.select(`.cell:nth-child(${i})`)

        if (i % 2 === 0) {

            cell.attr("transform", `translate(${(i - 1) * cellGap - cellGap}, 55)`)
        }

    }
    for (let i = 0; i < legendCells.size(); i++) {

        let cell = d3.select(`.cell:nth-child(${i})`)

        if (i % 2 !== 0) {

            cell.attr("transform", `translate(${(i - 1) * cellGap}, 0)`)
        }


    }

    // radius scale
    const minPopularity = d3.min(data.map(song => song.popularity));
    const maxPopularity = d3.max(data.map(song => song.popularity));
    const radiusScale = d3.scaleLinear()
        .domain([minPopularity, maxPopularity])
        .range([2, 15]);

    // Skapar en array med de rätta värdena
    let highestValue = 100;
    let lowestValue = 1;
    let stepValue = (highestValue - lowestValue) / 4;

    let popularityData = [];

    for (let i = 0; i < 5; i++) {

        let newValue = lowestValue + i * stepValue;
        popularityData.push(newValue);

    }

    // Vänder array:n
    popularityData.reverse()

    legend.append("g")
        .attr("id", "popularityContainer", true)
        .selectAll("circle")
        .data(popularityData)
        .enter()
        .append("circle")
        .attr("r", (d) => setRadius(d))
        .attr("cx", (d, i) => i * 30 + i * setRadius(d)) // Justera avståndet mellan cirklarna
        .attr("cy", 0)
        .attr("opacity", 0.7)
        .attr("fill", "white");

    d3.select("#popularityContainer")
        .attr("transform", "translate(100,600)")
        .append("text")
        .text("Popularity")
        .attr("x", -11)
        .attr("y", -35)
        .style("fill", "white")
        .style("font-weight", "bold");


    function setRadius(data) {
        return radiusScale(data);
    }

    // Add title attribute with genre name
    legendGenres.title = function (d) {
        return d;
    }

}