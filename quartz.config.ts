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
      fontOrigin: "local", // Stops Quartz from downloading Google Fonts
      cdnCaching: true,
      typography: {
        // Replaced "Inter" with Steph Ango's exact system font stack
        header: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#FFFCF0",       
          lightgray: "#E6E4D9",   
          gray: "#B7B5AC",        
          darkgray: "#100F0F",    
          dark: "#100F0F",        
          secondary: "#100F0F",   
          tertiary: "#CECDC3",    
          highlight: "rgba(0, 0, 0, 0.05)", 
          textHighlight: "#fff23688", 
        },
        darkMode: {
          light: "#100F0F",       
          lightgray: "#282726",   
          gray: "#575653",        
          darkgray: "#CECDC3",    
          dark: "#CECDC3",        
          secondary: "#CECDC3",   
          tertiary: "#403E3C",    
          highlight: "rgba(255, 255, 255, 0.1)", 
          textHighlight: "#b3aa0288", 
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
