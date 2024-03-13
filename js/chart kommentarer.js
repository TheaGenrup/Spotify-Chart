
d3.csv('data.csv').then(d => {


    let data = [];

    for (const song of d) {
        if (song.year >= 2010 && song.year <= 2019) {

            // Delar upp strängen med genrer till en array med genrer som element
            let genreArray = song.genre.split(", ").map(genre => genre.toLowerCase());

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

    const dataFilteredByYear = data.filter(song => parseInt(song.year) === 2010);

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
        .attr("transform", `translate(0, -20)`)
        .attr("id", `visualisationSvg`, true);

    // axis
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .attr("transform", `translate(${widthPad}, ${heightPad})`)
        .attr("text-anchor", "end")
        .append("text")
        .text("Valence")
        .attr("transform", `translate(27, -20)`)
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
        .attr("cy", (d) => yScale(d.valence))
        .on("mouseover", circleHover)
        .on("mouseout", event => {
            d3.select(".songInfoContainer").remove();
        })

    // create the slider
    const slider = document.createElement("input");
    document.querySelector("#sliderContainer").append(slider);
    slider.type = "range"; //skapar linje och prick som man drar
    slider.min = "2010";
    slider.max = "2019";

    const sliderWidth = 800;

    let sliderSvg = d3.select("#sliderContainer").append("svg")
        .attr("height", 20).attr("width", sliderWidth)

    const sliderScale = d3.scaleLinear()
        .domain([2010, 2019])
        .range([0, sliderWidth]);

    //Tickformat -> Tar bort kommat som skapas automatiskt

    sliderSvg.append("g")
        .call(d3.axisBottom(sliderScale)
            .tickFormat(d => d))
        .style("stroke-width", "0.5");

    d3.select("input")
        .on("input", event => {
            const newSliderValue = document.querySelector("input").value;
            const dataFilteredByNewYear = data.filter(song => parseInt(song.year) == newSliderValue);

            //Delete previous circles
            const circles = d3.select("#canvas").selectAll("circle")
                .data([])
                .exit()
                .remove();


            // make new circles
            d3.select("#canvas")
                .selectAll("circle")
                .data(dataFilteredByNewYear)
                .enter()
                .append("circle")
                .attr("opacity", 0.7)
                .attr("fill", "white")
                .attr("cx", (d) => xScale(d.danceability))
                .attr("cy", (d) => yScale(d.valence))
                .on("mouseover", circleHover)
                .on("mouseout", event => {
                    d3.select(".songInfoContainer").remove();
                })
                .transition()
                .duration(300)
                .attr("r", setRadius);
        })

    function setRadius(song) {
        return radiusScale(song.popularity);
    }

    createLegend(data, capitalizedGenres, heightSvg);

}

function createLegend(data, genres, heightSvg) {

    const colorRange = ["#FF8080", "#61a587", "#b79dbf", "#f0a967", "#C27664", "#89B9AD", "#ffd380", "#c56477", "#92ba92", "#f7bbad", "#DF7857", "#adc5cf"];

    //skapar skalan
    let colorScale = d3.scaleOrdinal(genres, colorRange);

    //skapar legenden av skalan
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
                    return 0.85;
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
                .attr("opacity", 0.8)
                .attr("fill", "white");
        });

    let legend = d3.select("#visualisationSvg").append("g").attr("id", "legend", true)
        .attr("transform", `translate(0,100)`);

    const legendHeight = 140;

    let genresContainer = legend.append("g")
        .call(legendGenres)
        .attr("id", "genresContainer")
        .attr("height", legendHeight)
        .attr("transform", `translate(80,${heightSvg - 100})`)
        .selectAll("text")
        .style("fill", "white");

    d3.select("#genresContainer").append("text")
        .text("Genres")
        .attr("x", -11)
        .attr("y", -35)
        .style("fill", "white")
        .style("font-weight", "bold");

    let legendCells = d3.selectAll(".cell");
    let cellGap = 88;

    for (let i = 0; i < legendCells.size() + 1; i++) {

        let cell = d3.select(`.cell:nth-child(${i})`)

        if (i % 2 === 0) {
            cell.attr("transform", `translate(${(i - 2) * cellGap}, 50)`)
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
    let gapValue = (highestValue - lowestValue) / 4;

    let popularityData = [];

    for (let i = 0; i < 5; i++) {

        let newValue = lowestValue + i * gapValue;
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
        //    .attr("transform", "translate(100, 580)")
        .attr("transform", `translate(1100, 50)`)
        .append("text")
        .text("Popularity")
        .attr("x", -16)
        .attr("y", -35)
        .style("fill", "white")
        .style("font-weight", "bold");


    function setRadius(data) {
        return radiusScale(data);
    }



    d3.select("#popularityContainer").append("g")
        .call(d3.axisBottom(d3.scaleLinear([1, 0], [0, 150]))
            .tickValues([0, 1])
            .tickFormat(d => d))
        .attr("transform", `translate(-17, 25)`)

}


function circleHover(e) {

    const dataObject = d3.select(this).datum(); // Get data associated with circle

    d3.select(".songInfoContainer").remove();
    d3.select("#visualisationSvg")
        .append("g")
        .classed("songInfoContainer", true)
        .attr("transform", `translate(160, 120)`)
        .attr("fill", "white")
        .append("text")
        .text(`${dataObject.name}`)
        .style("font-size", "20px")
        .style("font-weight", "bold")

    d3.select(".songInfoContainer").append("text")
        .text(`${dataObject.artist}`)
        .attr("transform", `translate(0, 25)`)

}
