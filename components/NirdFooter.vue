<template>
    <footer class="nird-footer p-4 text-gray-300">
        <ul class="nird-footer-list list-none">
            <li class="font-semibold rounded-3xl border-2 px-3 mr-3">
                <a href="https://archive.sigma2.no/" title="archive homepage">
                    NIRD RESEARCH DATA ARCHIVE
                </a>
            </li>
            <li class="mr-3">
                <a href="mailto:archive-test.manager@norstore.no" title="Email us for inquiries">
                    Contact
                </a>
            </li>
            <li class="mr-3">
                <a href="https://sigma2.no" title="Sigma2 homepage" target="_blank">
                    sigma2.no
                </a>
            </li>
            <li class="mr-3">
                <a href="https://www.sigma2.no/content/processing-personal-information-research-data-archive" target="_blank">
                    privacy
                </a>
            </li>
        </ul>
    </footer>
</template>

<script>
export default {
    name: "NirdFooter",
}
</script>

<style scoped>
.nird-footer {
    position: relative;
    bottom: 0px;
    background-color: #2e5060;
    width: 100%;
}

.nird-footer-list li {
    display: inline-block;
}
</style>