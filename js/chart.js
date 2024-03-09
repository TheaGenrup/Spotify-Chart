
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
        .attr("transform", `translate(${23}, ${-20})`)
        .attr("fill", "#87645d");


    svg.append("g")
        .call(d3.axisBottom(xScale))
        .attr("transform", `translate(${widthPad}, ${heightPad + heightCanvas})`)
        .attr("text-anchor", "end")
        .append("text")
        .text("Danceability")
        .attr("transform", `translate(${widthCanvas + widthPad}, 5)`)
        .attr("fill", "#87645d");

    let canvas = svg.append("g")
        .attr("transform", `translate(${widthPad}, ${heightPad})`)
        .attr("id", `canvas`, true)
        .selectAll("rect")
        .data(dataFilteredByYear)
        .enter()
        .append("circle")
        .attr("opacity", 0.7)
        .attr("fill", "beige")
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

    const sliderWidth = 700;

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

    createLegend(data, capitalizedGenres);


}


function createLegend(data, genres) {

    //const genreDomain = ["Pop", "Hip Hop", "R&B", "Country", "Rock"];
    const colorRange = ["#FF8080", "#FFBE98", "#FFCF96", "#A4CE95", "#CDFADB"];

    let colorScale = d3.scaleOrdinal(genres, colorRange);

    let legendGenres = d3.legendColor()
        .scale(colorScale)
        .shape("circle")
        .shapeRadius(11)
        .on("cellover", event => {
            const hoveredGenre = event.target.parentNode.querySelector("text").textContent.toLowerCase();

            d3.selectAll("#canvas circle")
                .attr("opacity", circle => {

                    if (!circle.genre.includes(hoveredGenre)) {
                        return 0.1;
                    }
                    return 0.7;
                });

        })
        .on("cellout", () => {
            d3.selectAll("#canvas circle").attr("opacity", 0.7)
        });
    //.orient("horizontal")


    let svg = d3.select("#visualisationSvg")

    //felet var är att elementet jag placera g:et i inte är ett svg-elemet

    const legendHeight = 140;

    let g = svg.append("g")
        .call(legendGenres)
        .attr("height", legendHeight)
        .attr("id", "legend", true)
        .attr("transform", "translate(100,640)")
        .selectAll("text")
        .style("fill", "white");

    let legend = d3.select("#legend");

    legend.append("text")
        .text("Genres")
        .attr("x", -11)
        .attr("y", -35)
        .style("fill", "white")
        .style("font-weight", "bold");

    // add genre data attribute to swatches and text
    d3.select('#legend')
        .selectAll('.swatch')
        .data(genres)
        .attr("data-genre", genre => genre);

    d3.select('#legend')
        .selectAll('text')
        .data(genres)
        .attr("data-genre", genre => genre);


    d3.select(".cell:nth-child(2)").attr("transform", "translate(0,75)")
    d3.select(".cell:nth-child(3)").attr("transform", "translate(130,0)")
    d3.select(".cell:nth-child(4)").attr("transform", "translate(130,75)")
    d3.select(".cell:nth-child(5)").attr("transform", "translate(260,0)")
    d3.select(".cell:nth-child(6)").attr("transform", "translate(260,75)")
    d3.select(".cell:nth-child(7)").attr("transform", "translate(390,0)")
    d3.select(".cell:nth-child(8)").attr("transform", "translate(390,75)")
    d3.select(".cell:nth-child(9)").attr("transform", "translate(520,0)")
    d3.select(".cell:nth-child(10)").attr("transform", "translate(520,75)")
    d3.select(".cell:nth-child(11)").attr("transform", "translate(650,0)")
    d3.select(".cell:nth-child(12)").attr("transform", "translate(650,75)")

    // radius scale
    const minPopularity = d3.min(data.map(song => song.popularity));
    const maxPopularity = d3.max(data.map(song => song.popularity));
    const radiusScale = d3.scaleLinear()
        .domain([minPopularity, maxPopularity])
        .range([6, 12]);

    const xScale = d3.scaleBand()
        .domain([minPopularity, maxPopularity])
        .range([4, 12]);

    legend.append("g")
        .selectAll("circle")
        .data(["", "", "", "", ""])
        .enter()
        .append("circle")
        .attr("r", (d) => setRadius(d))
        .attr("cx", (d, i) => i * 20)
        .attr("cy", 0) // Justera avståndet mellan cirklarna
        .style("fill", "grey");


    function setRadius(data) {
        return radiusScale(data);
    }

    // Add title attribute with genre name
    legendGenres.title = function (d) {
        return d;
    }


    function highlightGenre(genre) {
        let x = d3.selectAll("circle")
        console.log(x);

        document.querySelectorAll(".cell").forEach(cell => cell.addEventListener("mouseover", event => {

            const genre = event.originalTarget.getAttribute('data-genre');
            console.log("Klickad cirkel har genren:", genre);
        }));




    }



}