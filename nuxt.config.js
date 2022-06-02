import { geoIdentity } from "d3"

export default {

    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title: "NIRD archive metadata",
        htmlAttrs: {
            lang: "en",
        },
        bodyAttrs: {
            class: "bg-gray-400",
        },
        meta: [
            { charset: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            {
                hid: "description",
                name: "description",
                content: "NIRD RESEARCH DATA ARCHIVE",
            },
            { name: "format-detection", content: "telephone=no" },
        ],
        link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: ["@/assets/css/main.css"],

    // Auto import components
    components: true,

    // Stefan: for making D3js work
    build: {
        standalone: true,
    },

    

    // Modules for dev and build
    buildModules: [
        "@nuxtjs/tailwindcss",
        "nuxt-build-optimisations"
    ],


    buildOptimisations: {
        profile: 'experimental',
      /*  experimental: {
            modularizeImports: {
              '@mui/material/?(((\\w*)?/?)*)': {
                transform: '@mui/material/{{ matches.[1] }}/{{member}}'
              },
              '@mui/icons-material/?(((\\w*)?/?)*)': {
                transform: '@mui/icons-material/{{ matches.[1] }}/{{member}}'
              }
            }
          }, */
    } 



    
}