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
                        <td class="border px-8 py-4">{{art.subject[0].domain}}<br />{{art.subject[0].field}}</td>
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
//import service from "~/data/service"
import * as d3 from "d3";

export default {
    data() {
        return {
            articles: [],
            nr: 0
        }
    },
    async fetch() {
        await fetch("https://staging.web.archive-api.sigma2.no/api/list/dataset/doi/").then((res) => res.json().then((r) => {
            this.nr = r.results;
            return r.doi_list;
        })).then(async (rDoilist) => {
            const arts = rDoilist;
            for(var i=0; i < arts.length; i++){                
                if(this.checkDOIstring(arts[i].doi)) {
                    await fetch(arts[i].url).then((res) => {
                        if(res.ok){
                            res.json().then((r) => {
                                //Create the object which will be saved into articles array
                                var user = { 
                                    doi: r.doi, 
                                    extent: r.extent,
                                    subject: r.subject,  
                                    datepublished: r.datepublished
                                    };
                                this.articles.push(user);
                            }).catch((error) => {
                                console.error('There is an error: ', error);
                            })
                        }
                    });
                }
            }
        }).then(() => { console.log("Si tabloul: "/* + JSON.stringify(this.articles, 0, 4)*/); /*this.generateBars();*/ });
        // You will be able to access articles anywhere with this.articles and loop them v-for inside your template
    },
    
    mounted() {
        //this.generateArc();  //https://alligator.io/vuejs/visualization-vue-d3/
        this.generateBars(); //https://www.freecodecamp.org/news/d3js-tutorial-data-visualization-for-beginners/
    },
    methods: { 
        checkDOIstring(doi) {
            // Some of the doi elements in our json array are not proper. They have wrong size and we get an error from the server i.o. json element            
            const arrDoi = doi.split("/");
            if(arrDoi[0].length == 8) { return true } else { return false }
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
            .text("The 2nd chart: The Date Chart");

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
            data.sort(function (a,b) {return d3.ascending(a.datepublished, b.datepublished);});
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
                .ease(d3.easeSinOut)
                .duration(1500)
                .delay(500)
                .attr("height",(d) => height - margin.bottom - y_scale(d.extent))
                .attr("width", x_scale.bandwidth());

            // append x axis
            svg
            .append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(x_axis)
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "17px")
            .attr("dx", "-.8em")
            .attr("dy", ".55em")
            .attr("transform", "rotate(0)");

            // add y axis
            svg.append("g").attr("transform", `translate(${margin.left},0)`).call(y_axis).style("font-size", "15px");
       }
        
    }
}
</script>


<style>
    .bara {
        fill: #C28698; border: 2px solid #232354 !important;
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


