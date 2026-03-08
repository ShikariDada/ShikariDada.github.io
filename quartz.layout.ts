import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// ==========================================
// SHARED COMPONENTS
// ==========================================
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  // Site title, search, and dark mode moved to the top header for the single-column look
  header: [
    Component.PageTitle(),
    Component.Spacer(),
    Component.Search(),
    Component.Darkmode(),
  ],
  afterBody: [],
  // Your custom social/community links
  footer: Component.Footer({
    links: {
      "Instagram": "https://www.instagram.com/zerothlayer?igsh=OGF2ZnowdG1hbWhq",
      "Discord Community": "https://discord.gg/Uzs63XGuS",
    },
  }),
}

// ==========================================
// SINGLE NOTE LAYOUT
// ==========================================
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  // Left and Right sidebars are completely empty for the distraction-free look
  left: [],
  right: [],
  // Obsidian elements (Graph and Backlinks) are moved below the reading content
  afterBody: [
    Component.Graph({
      localGraph: { depth: 1, linkDistance: 30 },
      globalGraph: { depth: 2 },
    }),
    Component.Backlinks(),
  ],
}

// ==========================================
// LIST/FOLDER PAGE LAYOUT
// ==========================================
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  // Left and Right sidebars are completely empty
  left: [],
  right: [],
}


/* ==========================================
   DEFAULT QUARTZ CODE (COMMENTED OUT FOR REFERENCE)
   ==========================================
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [],
  footer: Component.Footer({
    links: {
      Instagram: "https://www.instagram.com/zerothlayer?igsh=OGF2ZnowdG1hbWhq",
      "Discord Community": "https://discord.gg/Uzs63XGuS",
    },
  }),
}

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ArticleTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [
    Component.Graph(),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
========================================== */
