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
import Util from '~/assets/js/util.js';

const fs = require("fs");

export default {
    data() {
        return {
            articles: [],
            nr: 0, 
            linkNext_Page: ""
        }
    },


    async fetch() {
        if(!this.checkCacheSync()){
            await fetch(Util.linkAPI()).then((res) => res.json().then((r) => {
                this.nr = r.Total_Documents;
                this.linkNext_Page = r.Next_Page;
                return r;
            })).then(async (pagina) => {
                const articles = pagina;
                for(var i=0; i < articles.Documents.length; i++){
                    var r = articles.Documents[i];
                    var getArticle = { 
                        doi: r.Identifier, 
                        extent: r.Extent,
                        subject: r.Subject[0].Domain + " - " + r.Subject[0].Subfield,  
                        datepublished: r.Published.substring(0, 10)
                        };
                    this.articles.push(getArticle);               
                }
            }).then(() => { console.log("We got this number of documents: " + this.nr); }).then(this.getLink).then(this.saveInCache);
        }
    },

    mounted() {
        this.generateBars(); //https://www.freecodecamp.org/news/d3js-tutorial-data-visualization-for-beginners/    
    },
    methods: { 
        async getLink(){
            var linkNext_Page = this.linkNext_Page;
            if(linkNext_Page.length > 5){ // it has be not null or not Equal with "NULL"
                await fetch(linkNext_Page).then((res) => res.json().then((r) => {
                    this.linkNext_Page = r.Next_Page;
                    return r;
                })).then(async (pagina) => {
                    const articles = pagina;
                    for(var i=0; i < articles.Documents.length; i++){
                        var r = articles.Documents[i];
                        var getArticle = { 
                            doi: r.Identifier, 
                            extent: r.Extent,
                            subject: r.Subject[0].Domain + " - " + r.Subject[0].Subfield,  
                            datepublished: r.Published.substring(0, 10)
                            };
                        this.articles.push(getArticle);                    
                    }
                    console.log("We read the page no: " + articles.Page);
                }).then(this.getLink);
            } else {
                console.log("I have read all the pages in the source. " + linkNext_Page);
            }
        },


        saveInCache(){
            var today = new Date();        
            let cacheResponse = { 
                createdAtDateTime: today,
                description: 'This json file keeps the data we took from REST APIs and it is used as a CACHE on the server side.',
                data: this.articles
            };            
            let data = JSON.stringify(cacheResponse, null, 2);
            fs.writeFile('data/cacheResponse.json', data, (err) => {
                if (err) throw err;
                console.log('Data written to file, in CACHE file.');
            });
        },


        checkCacheSync(){
            // this function check if the CACHE file exists and if the age of the file is still good to keep the data
            // and read the data from cache file
            // the maxAge should be 24 hours == 1440 minutes
            var json = fs.readFileSync('data/cacheResponse.json','utf8');
            let readCacheFile = JSON.parse(json);
            if(Util.diffTime(readCacheFile.createdAtDateTime)){ 
                console.log("We get the data from cache file.");
                this.articles = readCacheFile.data;
                return true;
            } else {
                console.log("The cache file is too old. We get the data from the primary source and save them to CACHE file.");
                return false;
            }
        },


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
            .text("Total size (extent) / Subject");
                       
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
                .text("Subject");

            const x_scale = d3
            .scaleBand()
            .range([margin.left, width - margin.right])
            .padding(0.1);

            const y_scale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
            let x_axis = d3.axisBottom(x_scale);
            let y_axis = d3.axisLeft(y_scale);
            
            var data = this.articles;

            data.sort((a, b) => { // Sorting the SUBJECT 
                if (a.subject < b.subject) {
                    return -1;
                } else {
                    return 1;
                }
            });
            //Summing the data from the same subject.
            var nested_data =  d3.rollups(data, v => d3.sum(v, d => d.extent) ,  d => d.subject.split(' - ')[0]).map(([k, v]) => ({ DateP: k, Sumextent: v }));
            
            //The new array of objects which will build the array which shall contain the SUMS of EXTENTS until the index DATE. 
            //It means that it is summing 
          
            var dateNew = [];
            for(let i=0; i<nested_data.length; i++){
                var extentSum = nested_data[i].Sumextent;
                let rec = { subject: nested_data[i].DateP, extent: extentSum }
                dateNew.push(rec);
            }

            dateNew.forEach((d) => (d.extent = +d.extent/1000000000));
            // Scale the range of the data in the domains
            x_scale.domain(dateNew.map((d) => d.subject.split(' - ')[0]));
            y_scale.domain([0, d3.max(dateNew, (d) => d.extent) * 1.45]);
            
            // Add the line chart
            svg.append("path")
            .datum(dateNew)
            .attr("fill", "none")
            .attr("stroke", "#87A3C3")
            .attr("stroke-width", 2.2)
            .attr("d", d3.line()
                .x(function(d) { return x_scale(d.subject.split(' - ')[0]) + x_scale.bandwidth()/2 })
                .y(function(d) { return y_scale(d.extent) })
            );
            
            // create a tooltip
            var tooltip = svg.append("line")
                .style("stroke", "#98A3C3")
                .style("stroke-width", 1)
                .style("opacity", 0)
                .attr("y1", height - 60);

            var tooltip2 =  svg.append('line')
                .style("stroke", "#98A3C3")
                .style("stroke-width", 1)
                .style("opacity", 0)
                .attr("x1", 90);


            // Add the circles
            svg.selectAll("myCircles")
            .data(dateNew)
            .enter()
            .append("circle")
                .attr("fill", "blue")
                .attr("stroke", "none")
                .attr("cx", (d) => x_scale(d.subject.split(' - ')[0]) + x_scale.bandwidth()/2)
                .attr("cy", (d) => y_scale(d.extent))
                .attr("r", 8)
                .on("mouseover", function(d) {                    
                    tooltip2.transition()		
                        .duration(200)		
                        .style("opacity", 0.8)
                        .attr("y1", d3.select(this).attr("cy"))
                        .attr("x2", d3.select(this).attr("cx"))
                        .attr("y2", d3.select(this).attr("cy"));
                    tooltip.transition()		
                        .duration(200)		
                        .style("opacity", 0.8)
                        .attr("y2", d3.select(this).attr("cy"))
                        .attr("x1", d3.select(this).attr("cx"))
                        .attr("x2", d3.select(this).attr("cx"));
                    })					
                .on("mouseout", function(d) {
                    tooltip.transition()		
                        .duration(1000)		
                        .style("opacity", 0);
                    tooltip2.transition()		
                        .duration(1500)		
                        .style("opacity", 0);	
                });
            

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


