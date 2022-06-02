<template>
    <div class="body-nird flex flex-col h-screen">
        <NirdHeader />
            <section class="container lg:w-4/5 mt-5 mb-10 rounded-md border-2 bg-gray-200 grid grid-flow-row-dense lg:grid-cols-12 p-4 shadow-md">
                <h2 class="lg:col-span-9 mb-3 text-current font-medium text-4xl">View Stats</h2>
                <span class="lg:col-span-3 mb-2 lg:mb-0"> </span>           

                <!-- table class="shadow-lg bg-white lg:col-span-12">
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
                </table -->

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
        await fetch("https://search-api.web.sigma2.no/norstore-archive/metadata/api/basic-search?query=*").then((res) => res.json().then((r) => {
            this.nr = r.Total_Documents;
            return r;
        })).then(async (pagina) => {
            const articles = pagina;

            console.log(JSON.stringify(articles.Documents));
            console.log(" No. of Documents on this Page " + articles.Documents.length);            
            for(var i=0; i < articles.Documents.length; i++){
                var r = articles.Documents[i]; console.log(" **** RRR " + JSON.stringify(r, 4, 0));
                var getArticle = { 
                    doi: r.Identifier, 
                    extent: r.Extent,
                    subject: r.Subject[0],  
                    datepublished: r.Published.substring(0, 10)
                    };
                this.articles.push(getArticle);
                //if(articles.Next_Page != "NULL") this.Next_Page = articles.Next_Page;
                
            }
        }).then(() => { console.log("We got this number of documents: " + this.nr); /*this.generateBars();*/ }).then(this.getLink());
        // You will be able to access articles anywhere with this.articles and loop them v-for inside your template
    },
    
    mounted() {
        this.generateBars(); //https://www.freecodecamp.org/news/d3js-tutorial-data-visualization-for-beginners/    
    },
    methods: { 
        checkDOIstring(doi) {
            // Some of the doi elements in our json array are not proper. They have wrong size and we get an error from the server i.o. json element            
            
            return true;  // Am facut asta pentru ca nu mai verific care este lungimea textului din acel raspuns. Asa ca nu mai am nevoie de aceasta verificare, dar voi avea nevoie de alta
        },

        async getLink(){
            console.log("Tooop!");
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
            .text("The size (extent) of each dataset / Published date");
                       
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

            data.sort((a, b) => { // Sorting the datepublished 
                if (a.datepublished < b.datepublished) {
                    return -1;
                } else {
                    return 1;
                }
            });
            /*
            //Summing the data from the same day.
            var nested_data =  d3.rollups(data, v => d3.sum(v, d => d.extent) ,  d => d.datepublished).map(([k, v]) => ({ DateP: k, Sumextent: v }));
            
            //The new array of objects which will build the array which shall contain the SUMS of EXTENTS until the index DATE. 
            //It means that it is summing 
            var dateNew = [];
            var previousExtent = 0;
            for(let i=0; i<nested_data.length; i++){
                previousExtent = previousExtent + nested_data[i].Sumextent;
                let rec = { datepublished: nested_data[i].DateP, extent: previousExtent }
                dateNew.push(rec);
            }*/

           
            data.forEach((d) => (d.extent = +d.extent/1000000000));
            // Scale the range of the data in the domains
            x_scale.domain(data.map((d) => d.datepublished));
            y_scale.domain([0, d3.max(data, (d) => d.extent)]);

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


