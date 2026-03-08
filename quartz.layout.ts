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
      Instagram: "https://www.instagram.com/zerothlayer?igsh=OGF2ZnowdG1hbWhq",
      "Discord Community": "https://discord.gg/Uzs63XGuS",
    },
  }),
}

/* --- DEFAULT SHARED COMPONENTS (Commented out for future reference) ---
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
---------------------------------------------------------------------- */


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
  // Left and Right sidebars
