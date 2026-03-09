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
    Component.AboutLink(),
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
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) => page.fileData.slug !== "index", /* Hides date/read time on homepage */
    }),
    Component.ConditionalRender({
      component: Component.TagList(),
      condition: (page) => page.fileData.slug !== "index", /* Hides default tags on homepage */
    }),
  ],
  left: [],
  right: [],
  afterBody: [
    Component.ConditionalRender({
      component: Component.Graph({
        localGraph: { depth: 1, linkDistance: 30 },
        globalGraph: { depth: 2 },
      }),
      condition: (page) => page.fileData.slug !== "index", /* Hides the graph on homepage */
    }),
    Component.ConditionalRender({
      component: Component.Backlinks(),
      condition: (page) => page.fileData.slug !== "index", /* Hides backlinks on homepage */
    }),
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
