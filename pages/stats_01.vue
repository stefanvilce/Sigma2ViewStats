<template>
    <div class="body-nird flex flex-col h-screen">
        <NirdHeader />
            <section class="container lg:w-4/5 mt-5 mb-10 rounded-md border-2 bg-gray-200 grid grid-flow-row-dense lg:grid-cols-12 p-4 shadow-md">
                <h2 class="lg:col-span-9 mb-3 text-current font-medium text-4xl">View Stats</h2>
                <span class="lg:col-span-3 mb-2 lg:mb-0"> </span>           

                <table class="shadow-lg bg-white lg:col-span-12">
                    <tr>
                        <th class="bg-blue-100 border text-left px-8 py-4">DOI</th>
                        <th class="bg-blue-100 border text-left px-8 py-4">Extent</th>
                        <th class="bg-blue-100 border text-left px-8 py-4">Subject</th>
                        <th class="bg-blue-100 border text-left px-8 py-4">Date published</th>
                    </tr>
                    <tr v-for="(art, index) in this.articles" :key="index">
                        <td class="border px-8 py-4">{{art.doi}}</td>
                        <td class="border px-8 py-4">{{art.extent}}</td>
                        <!--td class="border px-8 py-4">{{art.subject[0].domain}}<br />{{art.subject[0].field}}</td -->
                        <td class="border px-8 py-4">{{art.subject.domain}}<br />{{art.subject.field}}</td>
                        <td class="border px-8 py-4">{{art.datepublished}}</td>
                    </tr>
                </table>

                <div class="lg:col-span-12"> 
                    &nbsp;
                </div>            

                <div class="lg:col-span-12"> 
                    <svg id="d3_demo"></svg>
                </div>
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
        }).then(() => { console.log("Am citit acel json: " + this.nr); /*this.generateBars();*/ });
        // You will be able to access articles anywhere with this.articles and loop them v-for inside your template
    },
    
    mounted() {
        this.generateBars(); //https://www.freecodecamp.org/news/d3js-tutorial-data-visualization-for-beginners/
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
            height = 700;

            const svg = d3.select("#d3_demo").attr("viewBox", [0, 0, width, height]);

            console.log("Sa printam: " + JSON.stringify(this.articles));

            // add title
            svg
            .append("text")
            .attr("x", width / 2)
            .attr("y", margin.top + 2)
            .attr("text-anchor", "middle")
            .style("font-size", "36px")
            .style("text-decoration", "none")
            .style("font-weight", "bold")
            .style("color", "#65A2C3")
            .text("The chart *** ");

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

            data.forEach((d) => (d.extent = +d.extent/1000000));

            // Scale the range of the data in the domains
            x_scale.domain(data.map((d) => d.doi));
            y_scale.domain([0, d3.max(data, (d) => d.extent)]);

            // append the rectangles for the bar chart
            svg
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("class", "bara")
            .attr("x", (d) => x_scale(d.doi))
            .attr("y", (d) => y_scale(d.extent))
            .attr("width", 0)
            .attr("height", 1)
            .transition()
                .ease(d3.easeLinear)
                .duration(1000)
                .delay(2000)
                .attr("height",(d) => height - margin.bottom - y_scale(d.extent))
                .attr("width", x_scale.bandwidth());

            // append x axis
            svg
            .append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(x_axis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .attr("dx", "-.8em")
            .attr("dy", ".25em")
            .attr("transform", "rotate(-25)");

            // add y axis
            svg.append("g").attr("transform", `translate(${margin.left},0)`).call(y_axis);
       }
        
    }
}
</script>


<style>
    .bara {
        fill: #5678B2; border: 2px solid #232354;
    }
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
</style>


