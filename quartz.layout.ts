import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// ==========================================
// SHARED COMPONENTS
// ==========================================
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.PageTitle(),
    Component.Spacer(),
    Component.Search(),
    Component.Darkmode(),
  ],
  afterBody: [],
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
    // Component.ConditionalRender({
    //   component: Component.Breadcrumbs(),
    //   condition: (page) => page.fileData.slug !== "index",
    // }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [],
  right: [],
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
  left: [],
  right: [],
}
