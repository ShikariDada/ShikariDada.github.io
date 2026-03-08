import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Zeroth Layer",
    pageTitleSuffix: "",
    logo: "static/logo.png",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "zerothlayer.com",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
  typography: {
    // Steph uses ultra-clean system sans-serif fonts to keep it feeling native. 
    // Inter is the closest Google Font match to that minimalist look.
    header: "Inter",
    body: "Inter",
    code: "IBM Plex Mono",
  },
  colors: {
    lightMode: {
      light: "#FFFCF0",       // Flexoki: 'paper' (Warm, inky background)
      lightgray: "#E6E4D9",   // Flexoki: 'ui' (Subtle borders)
      gray: "#B7B5AC",        // Flexoki: 'tx-3' (Faint text for dates/meta)
      darkgray: "#100F0F",    // Flexoki: 'tx' (Primary body text - pure inky black)
      dark: "#100F0F",        // Flexoki: 'tx' (Headers - pure inky black)
      secondary: "#100F0F",   // Links and Graph Nodes (Steph keeps links black)
      tertiary: "#CECDC3",    // Flexoki: 'ui-3' (Hover states)
      highlight: "rgba(0, 0, 0, 0.05)", // Very subtle background for linked mentions
    },
    darkMode: {
      light: "#100F0F",       // Flexoki: 'bg' (Deep inky black background)
      lightgray: "#282726",   // Flexoki: 'ui' (Dark borders)
      gray: "#575653",        // Flexoki: 'tx-3' (Faint text for dates/meta)
      darkgray: "#CECDC3",    // Flexoki: 'tx' (Primary body text - warm off-white)
      dark: "#CECDC3",        // Flexoki: 'tx' (Headers - warm off-white)
      secondary: "#CECDC3",   // Links and Graph Nodes
      tertiary: "#403E3C",    // Flexoki: 'ui-3' (Hover states)
      highlight: "rgba(255, 255, 255, 0.1)", // Subtle highlight
    },
  },
},
    // theme: {
    //   fontOrigin: "googleFonts",
    //   cdnCaching: true,
    //   typography: {
    //     header: "Schibsted Grotesk",
    //     body: "Source Sans Pro",
    //     code: "IBM Plex Mono",
    //   },
    //   colors: {
    //     lightMode: {
    //       light: "#faf8f8",
    //       lightgray: "#e5e5e5",
    //       gray: "#b8b8b8",
    //       darkgray: "#4e4e4e",
    //       dark: "#2b2b2b",
    //       secondary: "#284b63",
    //       tertiary: "#84a59d",
    //       highlight: "rgba(143, 159, 169, 0.15)",
    //       textHighlight: "#fff23688",
    //     },
    //     darkMode: {
    //       light: "#161618",
    //       lightgray: "#393639",
    //       gray: "#646464",
    //       darkgray: "#d4d4d4",
    //       dark: "#ebebec",
    //       secondary: "#7b97aa",
    //       tertiary: "#84a59d",
    //       highlight: "rgba(143, 159, 169, 0.15)",
    //       textHighlight: "#b3aa0288",
    //     },
    //   },
    // },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
