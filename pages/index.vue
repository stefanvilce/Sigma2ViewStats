<template>
    <div class="body-nird flex flex-col h-screen">
        <NirdHeader />
            <section class="container lg:w-4/5 mt-5 mb-10 rounded-md border-2 bg-gray-200 grid grid-flow-row-dense lg:grid-cols-12 p-4 shadow-md">
                <h2 class="lg:col-span-9 mb-3 text-current font-medium text-4xl">The list of the statistics</h2>
                <span class="lg:col-span-3 mb-2 lg:mb-0"> </span>           

                <table class="shadow-lg bg-white lg:col-span-12">
                    <tr>
                        <th class="bg-blue-100 border text-left px-8 py-2">The old statistics</th>
                    </tr>
                    <tr>
                        <td class="border px-8 py-2"><NuxtLink to="/stats_01">Statistics one</NuxtLink></td>
                    </tr>
                     <tr>
                        <td class="border px-8 py-2"><NuxtLink to="/stats_02">Statistics 2: over Subject/Domain</NuxtLink></td>                        
                    </tr>
                    <tr>
                        <td class="border px-8 py-2"><NuxtLink to="/stats_03">Statistics 3: Field</NuxtLink></td>
                    </tr>
                    <tr>
                        <td class="border px-8 py-2"><NuxtLink to="/stats_04">Statistics 4: Showing the data on the </NuxtLink></td>
                    </tr>
                    <tr>
                        <td class="border px-8 py-2"><NuxtLink to="/stats_05">Statistics 5: Showing the increasing size of total data</NuxtLink></td>
                    </tr>
                </table>

                <table class="shadow-lg bg-white lg:col-span-12">
                    <tr>
                        <th class="bg-blue-100 border text-left px-8 py-2">The new statistics</th>
                    </tr>
                    <tr>
                        <td class="border px-8 py-2"><NuxtLink to="/stats_10">0. Number of datasets / Published date</NuxtLink></td>
                    </tr>
                    <tr>
                        <td class="border px-8 py-2"><NuxtLink to="/stats_10_01">0.01 Number of datasets / Month</NuxtLink></td>
                    </tr>
                    <tr>
                        <td class="border px-8 py-2"><NuxtLink to="/stats_10_11">0.11 Number of datasets / Year</NuxtLink></td>
                    </tr>
                    <tr>
                        <td class="border px-8 py-2"><NuxtLink to="/stats_10_02">0.02 Total datasets / Month</NuxtLink></td>
                    </tr>
                    <tr>
                        <td class="border px-8 py-2"><NuxtLink to="/stats_10_12">0.12 Total datasets / Year</NuxtLink></td>
                    </tr>
                    <tr>
                        <td class="border px-8 py-2" title="Total size Extent (cumulative) / Published month"><NuxtLink to="/stats_11">1. Total size (extent) / Month</NuxtLink></td>
                    </tr>
                    <tr>
                        <td class="border px-8 py-2" title="Total size Extent (cumulative) / Published Year"><NuxtLink to="/stats_11_01">1.01 Total size (extent) / Year</NuxtLink></td>
                    </tr>
                    <tr>
                        <td class="border px-8 py-2"><NuxtLink to="/stats_12">2. The size (extent) of each dataset / Published date</NuxtLink></td>
                    </tr>
                    <tr>
                        <td class="border px-8 py-2"><NuxtLink to="/stats_13">3. The size (extent) of each dataset / Subject</NuxtLink></td>
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
import service from "~/data/service"
export default {
    data() {
        return {
            service2: service
        }
    }
}
</script>

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
