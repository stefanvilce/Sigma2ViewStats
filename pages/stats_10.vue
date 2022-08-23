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

                <!-- Create a div where the graph will take place -->
                <div class="lg:col-span-12"> 
                    <svg id="d3_demo"></svg>
                </div>

                &nbsp;

                <div id="my_dataviz" class="lg:col-span-12 flex space-x-2 justify-center">
                    <button type="button" id='saveButton' class="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-20 py-5 text-center mr-2 mb-2">
                        Export to PNG
                    </button>
                </div>

            </section>
        <NirdFooter />

    </div>
</template>
<script>
import * as d3 from "d3";
import util from '~/assets/js/util.js';
//import * as fileSaver from '~/assets/js/FileSaver.min.js';

const fs = require("fs");

export default {
    head() {
      return {
        script: [
          {
                src: 'https://cdn.rawgit.com/eligrey/canvas-toBlob.js/f1a01896135ab378aa5c0118eadd81da55e698d8/canvas-toBlob.js'
          },
          {
                src: 'https://cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js'
          },
          {
                src: '/export2png.js'
          }
        ],
      }
    },


    data() {
        return {
            articles: [],
            nr: 0, 
            linkNext_Page: ""
        }
    },
    
    
    async fetch() {
        if(!this.checkCacheSync()){
            //await fetch("https://staging.web.archive-api.sigma2.no/api/list/dataset/doi/").then((res) => res.json().then((r) => {
            await fetch("https://search-api.web.sigma2.no/norstore-archive/metadata/api/basic-search?query=*").then((res) => res.json().then((r) => {
                this.nr = r.Total_Documents;
                this.linkNext_Page = r.Next_Page;
                return r;
            })).then(async (pagina) => {
                const articles = pagina;
                //console.log(JSON.stringify(articles.Documents));
                for(var i=0; i < articles.Documents.length; i++){
                    var r = articles.Documents[i]; console.log(" **** RRR " + JSON.stringify(r, 4, 0));
                    var getArticle = { 
                        doi: r.Identifier, 
                        extent: r.Extent,
                        subject: r.Subject[0].Domain + " - " + r.Subject[0].Subfield,  
                        datepublished: r.Published.substring(0, 10)
                        };
                    this.articles.push(getArticle);               
                }
            }).then(() => { console.log("We got this number of documents: " + this.nr); }).then(this.getLink).then(this.saveInCache); // I have to remember to write this.getLink or () => this.getLink(), but no this.getLink(); because it will not wait for asyncron  
            // You will be able to access articles anywhere with this.articles and loop them v-for inside your template
        }
    },
    
    mounted() {
        this.generateBars(); //https://www.freecodecamp.org/news/d3js-tutorial-data-visualization-for-beginners/
    },
    methods: { 
       
        async getLink(){
            var linkNext_Page = this.linkNext_Page;
            if(linkNext_Page.length > 5){ // it has be not null or not Equal with "NULL"
                console.log("Linkul este mai mare decat 5");
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
            var jsonul = fs.readFileSync('data/cacheResponse.json','utf8');
            let readCacheFile = JSON.parse(jsonul);
            if(util.diffTime(readCacheFile.createdAtDateTime)){ // f.eks: "2022-06-08T09:06:03.075Z"
                console.log("We get the data from cache file.");
                this.articles = readCacheFile.data;
                return true;
            } else {
                console.log("The cache file is too old. We get the data from the primary source and save them to CACHE file.");
                return false;
            }
        },


        //https://www.freecodecamp.org/news/d3js-tutorial-data-visualization-for-beginners/
        generateBars() {
            // set the dimensions and margins of the graph
            const margin = { top: 40, right: 50, bottom: 55, left: 90 },
            width = document.querySelector("body").clientWidth,
            height = 800;
            
            // Set-up the export button
            d3.select('#saveButton').on('click', function(){
                var svgString = getSVGString(svg.node());
                svgString2Image( svgString, 2*width, 2*height, 'png', save ); // passes Blob and filesize String to the callback

                function save( dataBlob, filesize ){
                    saveAs( dataBlob, 'D3 vis exported to PNG.png' ); // FileSaver.js function
                }
            });
            
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
            .style("text-shadow", "0 1px 5px #FFFFFF")
            .attr("fill", "#FFB500")
            .text("No. of Datasets / Published date");
                       
            // Add the text label for the y axis
            svg.append("text")
                .attr("x", 102)
                .attr("y", margin.top + 12)
                .style("text-anchor", "left")
                .style("font-size", "20px")
                .style("font-weight", "bold")
                .style("color", "#87A3C3")
                .style("text-shadow", "0 1px 5px #FFFFFF")
                .attr("fill", "#87A3C3")
                .text("No. of Datasets");
                
            // Add the text label for the x axis
            svg.append("text")
                .attr("x", width - 160)
                .attr("y", height - 80)
                .style("font-size", "20px")
                .style("color", "#87A3C3")
                .style("font-weight", "bold")
                .attr("fill", "#87A3C3")
                .style("text-shadow", "0 1px 5px #FFFFFF")
                .text("Published Date");

            const x_scale = d3
            .scaleBand()
            .range([margin.left, width - margin.right])
            .padding(0.1);

            const y_scale = d3.scaleLinear().range([height - margin.bottom, margin.top]); 
            let x_axis = d3.axisBottom(x_scale);
            let y_axis = d3.axisLeft(y_scale); 
            y_axis.tickPadding(4);
            x_axis.tickFormat(d3.timeFormat("%b"));
            
            var data = this.articles;

            data.sort((a, b) => { // Sorting the datepublished 
                if (a.datepublished < b.datepublished) {
                    return -1;
                } else {
                    return 1;
                }
            });
           
            // Counting the occurences
            var nested_data = d3.rollups(data, v => v.length, d => d.datepublished).map(([k, v]) => ({ DateP: k, Sumextent: v }));
            //console.log(d3.rollups(data, v => v.length, d => d.datepublished));
            var dateNew = [];
            for(let i = 0; i < nested_data.length; i++){
                var noOfOccurences = nested_data[i].Sumextent;
                let rec = { datepublished: nested_data[i].DateP, occurences: noOfOccurences }
                dateNew.push(rec);
            }

            dateNew.forEach((d) => (d.occurences = +d.occurences));
            // Scale the range of the data in the domains
            x_scale.domain(dateNew.map((d) => d.datepublished));
            y_scale.domain([0, d3.max(dateNew, (d) => d.occurences) * 1.65 ]); // I have multiplied wiht 1.65 becouse we need a higher Oy axis to keep the title of the chart visible and clean


            // create a tooltip
            var tooltip = svg.append("line")
                .style("stroke", "#98A3C3")
                .style("stroke-width", 1)
                .style("opacity", 0)
                .attr("y1", height - 55);

            var tooltip2 =  svg.append('line')
                .style("stroke", "#98A3C3")
                .style("stroke-width", 1)
                .style("opacity", 0)
                .attr("x1", 90);

            var tooltip3bkgr = svg.append("ellipse")
                .attr("cx", 250)
                .attr("cy", 50)
                .attr("rx", 10)
                .attr("ry", 8)
                .attr("fill", "green")
                .style("opacity", 0);

            var tooltip3 = svg.append("text")
                .attr("x", 36)
                .attr("y", margin.top + 66)
                .style("text-anchor", "center")
                .style("opacity", 0)
                .text("More information here");


            // Add the circles
            svg.selectAll("myCircles")
            .data(dateNew)
            .enter()
            .append("circle")
                .attr("fill", "#87A3C3")
                .attr("stroke", "none")
                .attr("cx", (d) => x_scale(d.datepublished) + x_scale.bandwidth()/2)
                .attr("cy", (d) => y_scale(d.occurences))
                .attr("r", 8)
                .attr("lbl_d_datepublished", (d)=>d.datepublished)
                .attr("lbl_d_occurences", (d)=>d.occurences)
                .on("mouseover", function(d) {
                    tooltip.transition()		
                        .duration(200)
                        .style("opacity", 0.8)
                        .attr("y2", parseInt(d3.select(this).attr("cy"))+15)
                        .attr("x1", d3.select(this).attr("cx"))
                        .attr("x2", parseInt(d3.select(this).attr("cx")));
                    tooltip2.transition()		
                        .duration(200)		
                        .style("opacity", 0.8)
                        .attr("y1", parseInt(d3.select(this).attr("cy")))
                        .attr("x2", parseInt(d3.select(this).attr("cx"))-15)
                        .attr("y2", parseInt(d3.select(this).attr("cy")));                    
                    tooltip3bkgr.transition()
                        .duration(80)
                        .attr("cx", d3.select(this).attr("cx"))
                        .attr("cy", parseInt(d3.select(this).attr("cy"))-57)
                        .attr("rx", 170)
                        .attr("ry", 40)
                        .attr("fill", "white")
                        .style("box-shadow", "2px 1px 1px #454512")
                        .style("opacity", 0.5);
                    tooltip3.transition(d)
                        .duration(100)
                        .style("opacity", 0.8)
                        .attr("y", parseInt(d3.select(this).attr("cy"))-45)
                        .attr("x", parseInt(d3.select(this).attr("cx"))-147)
                        .attr("font-family", "Saira")
                        .attr("font-weight", "bold")
                        .style("font-size", "31px")
                        .style("fill", "#454512")                      
                        .text(Math.ceil(d3.select(this).attr("lbl_d_occurences")) + " datasets / " + d3.select(this).attr("lbl_d_datepublished"));
                    })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(1000)
                        .style("opacity", 0);
                    tooltip2.transition()
                        .duration(1500)
                        .style("opacity", 0);                    
                    tooltip3bkgr.transition()
                        .duration(2400)
                        .style("opacity", 0);
                    tooltip3.transition()
                        .duration(2800)
                        .style("opacity", 0);
                });
            
/*
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
*/
            // append x axis
            svg
            .append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(x_axis.tickValues(x_scale.domain().filter(function(d,i){ return !(i%20)})))  /// this is to show only few data labels on x axis
            .selectAll("text")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .attr("dx", "-1.6em")
            .attr("dy", "1.10em")
            .attr("transform", "rotate(-25)");


            // add y axis
            svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .style("font-size", "20px")
            .style("color", "#87A3C3")
            .call(y_axis);


            // Add the line chart
            svg.append("path")
            .datum(dateNew)
            .attr("fill", "none")
            .attr("stroke", "#87A3C3")
            .attr("stroke-width", 3.2)
            .attr("d", d3.line()
                .x(function(d) { return x_scale(d.datepublished) + x_scale.bandwidth()/2 })
                .y(function(d) { return y_scale(d.occurences) })
                )
       }

    }
}
</script>


<style>
    .bara {
        fill: #5678B2; border: 2px solid #232354;
    }
    .title { color: orange; font-size: 46px; margin-top: -15px; }
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


