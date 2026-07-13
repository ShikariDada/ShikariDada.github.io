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
    baseUrl: "zerothlayer.com/blog",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts", // Turn this back on!
      cdnCaching: true,
      typography: {
        header: "Inter",
        body: "Inter",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#FFFCF0",       // Flexoki paper — warm cream background
          lightgray: "#E6E4D9",   // Flexoki 100 — borders, dividers
          gray: "#B7B5AC",        // Flexoki 300 — faint muted
          darkgray: "#282726",    // Flexoki 900 — body text
          dark: "#100F0F",        // Flexoki black — headings
          secondary: "#282726",   // link color = near-black (stephango: links blend with text)
          tertiary: "#3AA99F",    // hover = Flexoki cyan (accent only on hover)
          highlight: "rgba(0, 0, 0, 0.04)",
          textHighlight: "#fff23688",
        },
        darkMode: {
          light: "#100F0F",       // Flexoki black — dark bg
          lightgray: "#1C1B1A",   // Flexoki 950 — dark borders
          gray: "#575653",        // Flexoki 700 — dark muted
          darkgray: "#CECDC3",    // Flexoki 200 — dark body text
          dark: "#E6E4D9",        // Flexoki 100 — dark headings
          secondary: "#CECDC3",   // link color = warm cream (stephango: links same tone as text)
          tertiary: "#3AA99F",    // hover = cyan accent
          highlight: "rgba(255, 255, 255, 0.07)",
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
     // Plugin.CustomOgImages(),
    ],
  },
}

export default config
