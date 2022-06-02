<template>
    <header class="nird-header p-4">
        <a href="/">
            <span class="nird-logo-text1">NIRD</span>
            <span class="nird-logo-text2">RESEARCH DATA ARCHIVE</span>
        </a>
    </header>
</template>
<script>
export default {
    name: "NirdHeader",
};
</script>

<style scoped>
.nird-header {
    position: relative;
    top: 0px;
    background-color: #2e5060;
    color: #ffffff;
    width: 100%;
}

.nird-logo-text1 {
    font-size: 24px;
    font-weight: bold;
}

.nird-logo-text2 {
    position: static;
    font-weight: lighter;
    font-size: 16px;
}
</style>
