<template>
    <div class="body-nird flex flex-col h-screen">
        <NirdHeader />
        <section class="container lg:w-4/5 mt-5 mb-10 rounded-md border-2 bg-gray-200 grid grid-flow-row-dense lg:grid-cols-12 p-4 shadow-md">
            <span class="lg:col-span-3 mb-2 lg:mb-0">Title</span>
            <h2 class="lg:col-span-9 mb-3 text-current font-medium text-4xl">{{service2.titles[0].title}}</h2>
            <span class="lg:col-span-3 mb-2 lg:mb-0">Subtitle</span>
            <h3 class="lg:col-span-9 text-current">{{service2.titles[0].subtitle}}</h3>
            <span class="lg:col-span-3 mb-2 lg:mb-0">Status</span>
            <span class="lg:col-span-9 mb-3 text-current">{{service2.dates[0].status}} ({{service2.dates[0].date}})</span>
            <span class="lg:col-span-3 mb-2 lg:mb-0">Description</span>
            <span class="lg:col-span-9 text-current">{{service2.descriptions[0].abstract}}</span>
            <span class="lg:col-span-3 mb-2 lg:mb-0">Rights</span>
            <span class="lg:col-span-9 text-current">
                <a :href="service2.rights[0].rightsURI">{{service2.rights[0].name}}</a>
            </span>
            <span class="lg:col-span-3 mb-2 lg:mb-0">Publisher</span>
            <span class="lg:col-span-9 text-current">{{service2.publisher}}</span>
            
            <span class="lg:col-span-3 mb-2 lg:mb-0 bg-red-500">Funding</span>
            <div class="lg:col-span-9 bg-yellow-500">
                <span  v-for="(funding, index) in service2.fundingReferences" :key="index" class="bg-purple-400 mb-2 lg:mb-0 text-current">
                    <a :href="funding.fundingReference.awardURI">{{funding.fundingReference.awardTitle}}</a>
                    ({{funding.fundingReference.name}})
                </span>
            </div>
            
            <!--
            <span  v-for="(funding, index) in service.fundingReferences" :key="index" class="lg:col-start-4 lg:col-span-11 mb-1 lg:mb-0 bg-yellow-400">
                <a :href="funding.fundingReference.awardURI">{{funding.fundingReference.awardTitle}}</a>
                ({{funding.fundingReference.name}})
            </span>
            -->
            <span class="lg:col-span-3 mb-2 lg:mb-0 bg-red-500">Funding</span>
            <span class="lg:col-span-9 text-current bg-green-500">test</span>

            
            <span class="lg:col-span-3 mb-2 lg:mb-0">Statistics</span>
            <span class="lg:col-span-9 text-current">Go to: <a href="/stats" title="See the Stats">View Statistics</a></span>
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
