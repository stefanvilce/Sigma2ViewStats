<template>
    <div class="body-nird flex flex-col h-screen">
        <NirdHeader />
            <section class="container lg:w-4/5 mt-5 mb-10 rounded-md border-2 bg-gray-200 grid grid-flow-row-dense lg:grid-cols-12 p-4 shadow-md">
                <h2 class="lg:col-span-9 mb-3 text-current font-medium text-4xl">View Stats</h2>
                <span class="lg:col-span-3 mb-2 lg:mb-0"> </span>           

                <table class="shadow-lg bg-white lg:col-span-12">
                    <tr>
                        <th class="bg-blue-100 border text-left px-4 py-4">DOI</th>
                        <th class="bg-blue-100 border text-left px-4 py-4">Extent</th>
                        <th class="bg-blue-100 border text-left px-4 py-4">Subject</th>
                        <th class="bg-blue-100 border text-left px-4 py-4">Date published</th>
                    </tr>
                    <tr v-for="(art, index) in this.articles" :key="index">
                        <td class="border px-4 py-2">{{art.doi}}</td>
                        <td class="border px-4 py-2">{{art.extent}}</td>
                        <td class="border px-4 py-2">{{art.subject.domain}}<br />{{art.subject.field}}</td>
                        <td class="border px-4 py-2">{{art.datepublished}}</td>
                    </tr>
                </table>

                <div class="lg:col-span-12"> 
                    &nbsp;
                </div>            

                <div class="lg:col-span-12"> 
                    <svg id="d3_demo"></svg>
                </div>

                &nbsp;

                <!-- Create a div where the graph will take place -->
                <div id="my_dataviz"></div>

            </section>
        <NirdFooter />

    </div>
</template>
<script>
import * as d3 from "d3";

export default {
    data() {
        return {
            articles: [],
            nr: 0
        }
    },
    async fetch() {
        //await fetch("https://staging.web.archive-api.sigma2.no/api/list/dataset/doi/").then((res) => res.json().then((r) => {
        await fetch("http://irisoft.com.ro/nautica/lista_doi.json").then((res) => res.json().then((r) => { // https://staging.web.archive-api.sigma2.no/api/list/dataset/
            this.nr = r.results;
            return r.datasets;
        })).then(async (rDoilist) => {
            const arts = rDoilist;
            for(var i=0; i < arts.length; i++){                
                if(this.checkDOIstring(arts[i].doi)) {
                    await fetch("http://irisoft.com.ro/nautica/doi_" + arts[i].id + ".json").then((res) => {    // https://staging.web.archive-api.sigma2.no/api/dataset/9521DE94-38C1-4E66-B0E7-5FA89107D22A
                        if(res.ok){
                            res.json().then((r) => {
                                //Create the object which will be saved into articles array
                                var user = { 
                                    doi: r.doi, 
                                    extent: r.extent,
                                    subject: r.subject[0],  
                                    datepublished: r.datepublished.substring(0, 10)
                                    };
                                this.articles.push(user);
                            }).catch((error) => {
                                console.error('There is an error: ', error);
                            })
                        }
                    });
                }
            }
        }).then(() => { console.log("I have read the json: " + this.nr); /*this.generateBars();*/ });
        // You will be able to access articles anywhere with this.articles and loop them v-for inside your template
    },
    
    mounted() {
        this.generateBars(); //https://www.freecodecamp.org/news/d3js-tutorial-data-visualization-for-beginners/    
       // this.generateBullets();    
    },
    methods: { 
        checkDOIstring(doi) {
            // Some of the doi elements in our json array are not proper. They have wrong size and we get an error from the server i.o. json element            
            //const arrDoi = doi.split("/");
            //if(arrDoi[0].length == 8) { return true } else { return false }
            return true;  // Am facut asta pentru ca nu mai verific care este lungimea
        },


        //https://www.freecodecamp.org/news/d3js-tutorial-data-visualization-for-beginners/
        generateBars() {
            // set the dimensions and margins of the graph
            const margin = { top: 40, right: 50, bottom: 55, left: 90 },
            width = document.querySelector("body").clientWidth,
            height = 800;
            const svg = d3.select("#d3_demo").attr("viewBox", [0, 0, width, height]);

            // add title
            svg
            .append("text")
            .attr("x", width / 2)
            .attr("y", margin.top + 2)
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .style("font-size", "36px")
            .style("text-decoration", "none")
            .style("font-weight", "bold")
            .style("color", "#434376")
            .text("View Stats / Subject-Field");


                       
            // Add the text label for the y axis
            svg.append("text")
                .attr("x", 36)
                .attr("y", margin.top + 1)
                .style("text-anchor", "left")
                .style("font-size", "22px")
                .style("color", "red")
                .text("GB");
                
            // Add the text label for the x axis
            svg.append("text")
                .attr("x", width - 120)
                .attr("y", height - 2)
                .style("font-size", "22px")
                .style("color", "#B2B2CD")
                .text("The dates")
                .append("span").style("color", "orange").text("TEXT");

            const x_scale = d3
            .scaleBand()
            .range([margin.left, width - margin.right])
            .padding(0.1);

            const y_scale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
            let x_axis = d3.axisBottom(x_scale);
            let y_axis = d3.axisLeft(y_scale);
            
            var data = this.articles;

            data.sort((a, b) => { // Sortarea alfabetica dupa data de salvare a documentelor
                if (a.datepublished < b.datepublished) {
                    return -1;
                } else {
                    return 1;
                }
            });

            console.log("fara sumarizare: " + JSON.stringify(data, 0, 4));
            console.log(" ____ ");

            /*
            const nested_data = d3.nest().key(function(d) { return d.datepublished; }).rollup(function(leaves) { 
                    return {"total_extent": d3.sum(leaves, function(d) {return d.extent;})} 
                }).entries(data);*/
            var nested_data =  d3.rollups(data, v => d3.sum(v, d => d.extent) ,  d => d.datepublished).map(([k, v]) => ({ datepublished: k, extent: v }));
            
            // Deci, nu mai am nevoie de ceea ce vine aici, cu transformarea in json
            //for(var ele of nested_data.entries()){
            console.log("NESTED_DATA: " + JSON.stringify(nested_data, 0, 4));
            data = nested_data; // it means that I took the 
            console.log("Noul data: " + JSON.stringify(data, 0, 4));
            data.forEach((d) => (d.extent = +d.extent/1000000));

            // Scale the range of the data in the domains
            x_scale.domain(data.map((d) => d.datepublished));
            y_scale.domain([0, d3.max(data, (d) => d.extent)]);

/*            // append the rectangles for the bar chart
            svg
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("class", "bara")
            .attr("x", (d) => x_scale(d.datepublished))
            .attr("y", (d) => y_scale(d.extent))
            .attr("width", 0)
            .attr("height", 1)
            .transition()
                .ease(d3.easeLinear)
                .duration(100)
                .delay(2)
                .attr("height",(d) => height - margin.bottom - y_scale(d.extent))
                .attr("width", x_scale.bandwidth());
*/
            // Add the circles
            svg.selectAll("myCircles")
            .data(data)
            .enter()
            .append("circle")
                .attr("fill", "blue")
                .attr("stroke", "none")
                .attr("cx", (d) => x_scale(d.datepublished) + x_scale.bandwidth()/2)
                .attr("cy", (d) => y_scale(d.extent))
                .attr("r", x_scale.bandwidth()/8);
            

            // append x axis
            svg
            .append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(x_axis)
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "24px")
            .style("letter-spacing", "-1px")
            .attr("dx", "0.2em")
            .attr("dy", "1.80em")
            .attr("transform", "rotate(0)");

            // add y axis
            svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .style("font-size", "22px")
            .style("color", "#6576CA")
            .call(y_axis);
       },


/*
        //https://www.freecodecamp.org/news/d3js-tutorial-data-visualization-for-beginners/
        generateBars() {
            // set the dimensions and margins of the graph
            const margin = { top: 40, right: 50, bottom: 55, left: 90 },
            width = document.querySelector("body").clientWidth,
            height = 800;

            const svg = d3.select("#d3_demo").attr("viewBox", [0, 0, width, height]);

            //console.log("Sa printam: " + JSON.stringify(this.articles));

            // add title
            svg
            .append("text")
            .attr("x", width / 2)
            .attr("y", margin.top + 2)
            .attr("text-anchor", "middle")
            .style("font-size", "36px")
            .style("text-decoration", "none")
            .style("font-weight", "bold")
            .style("color", "#434376")
            .text("View Stats / Subject-Field");

            const x_scale = d3
            .scaleBand()
            .range([margin.left, width - margin.right])
            .padding(0.1);

            const y_scale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
            let x_axis = d3.axisBottom(x_scale);
            let y_axis = d3.axisLeft(y_scale);
            //d3.json("https://raw.githubusercontent.com/iamspruce/intro-d3/main/data/nigeria-states.json").then(({ data }) => {
                
            //d3.json(this.articles).then(({ data }) => {

            var data = this.articles;

            data.sort((a, b) => { // Sortarea alfabetica dupa data de salvare a documentelor
                //return a.datepublished - b.datepublished;
                if (a.datepublished < b.datepublished) {
                    return -1;
                } else {
                    return 1;
                }
            });

            data.forEach((d) => (d.extent = +d.extent/1000000));

            // Scale the range of the data in the domains
            x_scale.domain(data.map((d) => d.datepublished));
            y_scale.domain([0, d3.max(data, (d) => d.extent)]);

            // append the rectangles for the bar chart
            svg
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("class", "bara")
            .attr("x", (d) => x_scale(d.datepublished))
            .attr("y", (d) => y_scale(d.extent))
            .attr("width", 0)
            .attr("height", 1)
            .transition()
                .ease(d3.easeLinear)
                .duration(400)
                .delay(2)
                .attr("height",(d) => height - margin.bottom - y_scale(d.extent))
                .attr("width", x_scale.bandwidth());

             // Add the line
                svg.selectAll("myCircles")
                .data(data)
                .enter()
                .append("circle")
                    .attr("fill", "red")
                    .attr("stroke", "none")
                    .attr("cx", (d) => x_scale(d.datepublished))
                    .attr("cy", (d) => y_scale(d.extent))
                    .attr("r", 30);

            

            // append x axis
            svg
            .append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(x_axis)
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "20px")
            .style("letter-spacing", "-1px")
            .attr("dx", "-.1em")
            .attr("dy", ".55em")
            .attr("transform", "rotate(0)");

            // add y axis
            svg.append("g").attr("transform", `translate(${margin.left},0)`).call(y_axis);
       }, */
       
       /*
       generateBullets(){
           // set the dimensions and margins of the graph
            var margin = {top: 10, right: 30, bottom: 30, left: 50},
                width = 460 - margin.left - margin.right,
                height = 400 - margin.top - margin.bottom;

            // append the svg object to the body of the page
            var svg = d3.select("#my_dataviz")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            //Read the data
            d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/3_TwoNumOrdered_comma.csv",

            // When reading the csv, I must format variables:
            function(d){
                return { date : d3.timeParse("%Y-%m-%d")(d.date), value : d.value }
            },

            // Now I can use this dataset:
            function(data) {

                // Keep only the 90 first rows
                data = data.filter(function(d,i){ return i<90})

                // Add X axis --> it is a date format
                var x = d3.scaleTime()
                .domain(d3.extent(data, function(d) { return d.date; }))
                .range([ 0, width ]);
                svg.append("g")
                .attr("transform", "translate(0," + (height+5) + ")")
                .call(d3.axisBottom(x).ticks(5).tickSizeOuter(0));

                // Add Y axis
                var y = d3.scaleLinear()
                .domain( d3.extent(data, function(d) { return +d.value; }) )
                .range([ height, 0 ]);
                svg.append("g")
                .attr("transform", "translate(-5,0)")
                .call(d3.axisLeft(y).tickSizeOuter(0));

                // Add the area
                svg.append("path")
                .datum(data)
                .attr("fill", "#69b3a2")
                .attr("fill-opacity", .3)
                .attr("stroke", "none")
                .attr("d", d3.area()
                    .x(function(d) { return x(d.date) })
                    .y0( height )
                    .y1(function(d) { return y(d.value) })
                    )

                // Add the line
                svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 4)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.date) })
                    .y(function(d) { return y(d.value) })
                    )

                // Add the line
                svg.selectAll("myCircles")
                .data(data)
                .enter()
                .append("circle")
                    .attr("fill", "red")
                    .attr("stroke", "none")
                    .attr("cx", function(d) { return x(d.date) })
                    .attr("cy", function(d) { return y(d.value) })
                    .attr("r", 3)

            })
       } */        
    }
}
</script>


<style>
    .bara {
        fill: #5678B2; border: 2px solid #232354;
    }
    .title { color: orange; font-size: 41px; margin-top: -10px; }
</style>

<style scoped>
.container {
    margin-left: auto;
    margin-right: auto;
}

.container > span {
    font-size: 0.6rem;
    border-bottom: 1px solid #ccc;
    /* text-transform: uppercase; */
}

.container > div {
    font-size: 0.6rem;
    border-bottom: 1px solid #ccc;
}

.container > p {
    font-size: 0.6rem;
    border-bottom: 1px solid #ccc;
}

@media (min-width: 1024px) {
    .container > span {
        border-bottom: 0;
        font-size: 1rem;
    }

    .container > div {
        border-bottom: 0;
        font-size: 1rem;
    }

    .container > * {
        margin-bottom: 1em;
        text-decoration: none;
    }
}

.heading {
    border-bottom: 2px solid #000;
}

.highlight {
            fill: orange;
        }



</style>


