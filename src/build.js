#!/usr/bin/env node
/**
 * Zeroth Layer — Static Site Builder
 *
 * Reads Markdown from content/, generates HTML.
 * Blog lives at /blog/, root landing page at /.
 *
 * Output structure:
 *   public/
 *     index.html          → zerothlayer.com/   (root landing page)
 *     404.html            → redirects /blog/... to /blog/...
 *     CNAME / .nojekyll / sitemap.xml
 *     styles.css / theme.js / icon.png   ← shared, served from root
 *     blog/
 *       index.html        → zerothlayer.com/blog/
 *       feed.xml
 *       [slug]/index.html
 *       about/index.html
 *       tags/[tag]/index.html
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

// ─────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────
const CONTENT_DIR = path.join(__dirname, "..", "content");
const OUTPUT_DIR  = path.join(__dirname, "..", "public");       // root output
const BLOG_DIR    = path.join(OUTPUT_DIR, "blog");              // /blog/ output
const STATIC_DIR  = path.join(__dirname, "..", "static");

const B = "/blog"; // blog base prefix for all internal blog URLs

const SITE = {
  title:       "Zeroth Layer",
  url:         "https://zerothlayer.com",
  blogUrl:     "https://zerothlayer.com/blog",
  description: "Ideas, essays, and explorations about life and the systems that shape it.",
  author:      "Zeroth Layer",
  instagram:   "https://www.instagram.com/zerothlayer?igsh=OGF2ZnowdG1hbWhq",
  discord:     "https://discord.gg/kqW9Ea5pMP",
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  const mins  = Math.ceil(words / 200);
  return `${mins} minute read`;
}

function formatDateLong(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()} · ${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function excerpt(text, maxLen = 160) {
  const plain = text
    .replace(/^---[\s\S]*?---/, "")
    .replace(/#+\s/g, "")
    .replace(/\*\*|__/g, "")
    .replace(/\*|_/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\n+/g, " ")
    .trim();
  if (plain.length <= maxLen) return plain;
  return plain.substring(0, maxLen).replace(/\s+\S*$/, "") + "...";
}

// ─────────────────────────────────────────────
// Shared HTML Fragments
// ─────────────────────────────────────────────
const THEME_SCRIPT = `<script>
      // In <head> first — prevents ANY flash of wrong theme
      (function(){
        try {
          if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('theme-dark');
          }
        } catch(e){}
      })();
    </script>`;

const THEME_TOGGLE = `<span id="theme-toggle" title="Toggle dark mode" aria-label="Toggle dark mode" role="switch">
        <div class="theme-toggle-slide"></div>
        <div class="theme-toggle-switch"></div>
      </span>`;

// ─────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────

/**
 * Blog page base template.
 * "Zeroth Layer" in nav links back to the ROOT landing page (/).
 */
function blogPageTemplate({ title, description, content, slug = "" }) {
  const pageTitle    = slug ? `${title} — ${SITE.title}` : SITE.title;
  const pageDesc     = description || SITE.description;
  const canonicalUrl = slug ? `${SITE.blogUrl}/${slug}` : `${SITE.blogUrl}/`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    ${THEME_SCRIPT}
    <meta charset="UTF-8">
    <title>${pageTitle}</title>

    <meta name="viewport"           content="width=device-width, initial-scale=1.0">
    <meta name="description"        content="${pageDesc}">
    <meta name="author"             content="${SITE.author}">

    <link rel="canonical"           href="${canonicalUrl}">
    <link rel="icon"                href="/icon.png" type="image/png">
    <link rel="stylesheet"          href="/styles.css" type="text/css">
    <link rel="alternate"           href="${B}/feed.xml" type="application/atom+xml" title="${SITE.title}">

    <meta property="og:site_name"   content="${SITE.title}">
    <meta property="og:url"         content="${canonicalUrl}">
    <meta property="og:title"       content="${title}">
    <meta property="og:description" content="${pageDesc}">
    <meta property="og:type"        content="article">
  </head>

  <body>
    <nav class="flex align-center">
      <span class="flex-grow">
        <a class="plain" href="/">${SITE.title}</a>
      </span>
      <span class="flex-shrink nav-links">
        <a href="${B}/about" class="muted plain">About</a>
      </span>
      ${THEME_TOGGLE}
    </nav>

    <main>
      ${content}
    </main>

    <footer>
      <div class="wrap">
        <hr>
        <div class="footer-bottom">
          <nav class="social-nav">
            <a href="${SITE.instagram}">Instagram</a>
            <a href="${SITE.discord}">Discord</a>
            <a href="${B}/feed.xml">RSS</a>
          </nav>
          <a href="${B}/about" class="footer-logo" title="About ${SITE.title}">
            <img src="/icon.png" alt="${SITE.title}">
          </a>
        </div>
      </div>
    </footer>

    <script src="/theme.js"></script>
  </body>
</html>`;
}

/**
 * Root landing page template (zerothlayer.com/).
 * Nav has "Blog" + "About" links.
 */
function rootPageTemplate() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    ${THEME_SCRIPT}
    <meta charset="UTF-8">
    <title>${SITE.title}</title>

    <meta name="viewport"           content="width=device-width, initial-scale=1.0">
    <meta name="description"        content="${SITE.description}">
    <meta name="author"             content="${SITE.author}">

    <link rel="canonical"           href="${SITE.url}/">
    <link rel="icon"                href="/icon.png" type="image/png">
    <link rel="stylesheet"          href="/styles.css" type="text/css">

    <meta property="og:site_name"   content="${SITE.title}">
    <meta property="og:url"         content="${SITE.url}/">
    <meta property="og:title"       content="${SITE.title}">
    <meta property="og:description" content="${SITE.description}">
    <meta property="og:type"        content="website">
  </head>

  <body>
    <nav class="flex align-center">
      <span class="flex-grow">
        <a class="plain" href="/">${SITE.title}</a>
      </span>
      <span class="flex-shrink nav-links">
        <a href="${B}/" class="muted plain">Writing</a>
        <a href="${B}/about" class="muted plain">About</a>
      </span>
      ${THEME_TOGGLE}
    </nav>

    <main>
      <div class="wrap root-content">

        <p class="root-tagline">The layer before everything.</p>

        <p>A space for exploring the patterns beneath reality — consciousness, karma, physics, and the systems shaping existence. Ideas that connect what seems unrelated, frameworks that make the invisible visible.</p>

        <p>If these explorations help someone think more clearly, see differently, or find guidance along their path, then this space has served its purpose.</p>

        <p><a href="${B}/">Read the writing →</a></p>

        <hr>

        <nav class="social-nav">
          <a href="${SITE.instagram}">Instagram</a>
          <a href="${SITE.discord}">Discord</a>
          <a href="${B}/about">About</a>
        </nav>

      </div>
    </main>

    <script src="/theme.js"></script>
  </body>
</html>`;
}

/**
 * Blog homepage — auto-generated from posts list.
 * "Latest" label is a link to the latest post (like stephango).
 * Section labels are full 1em size (NOT .small).
 */
function homepageContent(posts, allTags) {
  const latest = posts[0];
  if (!latest) return `<div class="wrap"><p>No posts yet.</p></div>`;

  const latestHtml = `
      <p><a href="${B}/${latest.slug}" class="muted plain-underline">Latest</a></p>

      <div>
        <a href="${B}/${latest.slug}" class="plain">
          <h2>${latest.title}</h2>
          <div class="metadata muted small pb">
            <time datetime="${latest.date}">${formatDateLong(latest.date)}</time> · <span>${readingTime(latest.rawContent)}</span>
          </div>
          <div class="small muted">
            ${latest.description || excerpt(latest.rawContent)} Keep reading →
          </div>
        </a>
      </div>`;

  const topicsHtml = allTags
    .sort()
    .map((t) => `<a href="${B}/tags/${slugify(t)}">${t}</a>`)
    .join(`<span class="muted">, </span>\n          `);

  const writingHtml = posts
    .map((p) =>
      `<li><span class="list-date muted">${formatDateShort(p.date)}</span> <a href="${B}/${p.slug}">${p.title}</a></li>`
    )
    .join("\n          ");

  return `
      <div class="wrap">
        ${latestHtml}

        <hr>

        <p><span class="muted">Topics</span></p>

        <div class="line-height-loose">
          ${topicsHtml}
        </div>

        <hr>

        <p><span class="muted">Writing</span></p>

        <ul class="clean-list">
          ${writingHtml}
        </ul>
      </div>`;
}

function postContent(post) {
  return `
      <div class="wrap">
        <heading>
          <h1>${post.title}</h1>
          <div class="metadata muted small">
            <time datetime="${post.date}">${formatDateLong(post.date)}</time> · <span>${readingTime(post.rawContent)}</span>
          </div>
        </heading>

        <article>
          ${post.html}
        </article>
      </div>`;
}

function pageContent(page) {
  return `
      <div class="wrap">
        <heading>
          <h1>${page.title}</h1>
        </heading>

        <article>
          ${page.html}
        </article>
      </div>`;
}

function tagContent(tag, posts) {
  const listHtml = posts
    .map((p) =>
      `<li><span class="list-date muted">${formatDateShort(p.date)}</span> <a href="${B}/${p.slug}">${p.title}</a></li>`
    )
    .join("\n          ");

  return `
      <div class="wrap">
        <heading>
          <h1>${tag}</h1>
          <div class="metadata muted small">${posts.length} ${posts.length === 1 ? "post" : "posts"}</div>
        </heading>

        <ul class="clean-list">
          ${listHtml}
        </ul>
      </div>`;
}

// ─────────────────────────────────────────────
// RSS Feed
// ─────────────────────────────────────────────
function generateRSS(posts) {
  const items = posts
    .slice(0, 20)
    .map((p) => `
    <entry>
      <title>${p.title}</title>
      <link href="${SITE.blogUrl}/${p.slug}"/>
      <id>${SITE.blogUrl}/${p.slug}</id>
      <updated>${new Date(p.date).toISOString()}</updated>
      <summary>${p.description || excerpt(p.rawContent)}</summary>
      <content type="html"><![CDATA[${p.html}]]></content>
    </entry>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${SITE.title}</title>
  <link href="${SITE.blogUrl}/"/>
  <link href="${SITE.blogUrl}/feed.xml" rel="self"/>
  <id>${SITE.blogUrl}/</id>
  <updated>${new Date().toISOString()}</updated>
  <author><name>${SITE.author}</name></author>
  ${items}
</feed>`;
}

// ─────────────────────────────────────────────
// Sitemap
// ─────────────────────────────────────────────
function generateSitemap(posts, tags) {
  const urls = [
    `<url><loc>${SITE.url}/</loc></url>`,
    `<url><loc>${SITE.blogUrl}/</loc></url>`,
    `<url><loc>${SITE.blogUrl}/about</loc></url>`,
    ...posts.map((p) => `<url><loc>${SITE.blogUrl}/${p.slug}</loc></url>`),
    ...tags.map((t) => `<url><loc>${SITE.blogUrl}/tags/${slugify(t)}</loc></url>`),
  ].join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
}

// ─────────────────────────────────────────────
// 404 Page
// ─────────────────────────────────────────────
function generate404() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <script>
      (function(){
        try {
          if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('theme-dark');
          }
          // Redirect old Quartz /blog/blog/... double-path URLs
          var p = window.location.pathname;
          if (p.startsWith('/blog/blog/')) {
            window.location.replace(p.replace('/blog/blog/', '/blog/'));
          }
        } catch(e){}
      })();
    </script>
    <meta charset="UTF-8">
    <title>Not found — ${SITE.title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/styles.css">
    <link rel="icon" href="/icon.png" type="image/png">
  </head>
  <body>
    <nav class="flex align-center">
      <span class="flex-grow"><a class="plain" href="/">${SITE.title}</a></span>
      <span class="flex-shrink nav-links"><a href="${B}/about" class="muted plain">About</a></span>
      ${THEME_TOGGLE}
    </nav>
    <main>
      <div class="wrap">
        <heading><h1>404</h1></heading>
        <article>
          <p class="muted">This page does not exist. <a href="${B}/">Go to writing →</a></p>
        </article>
      </div>
    </main>
    <script src="/theme.js"></script>
  </body>
</html>`;
}

// ─────────────────────────────────────────────
// Main Build
// ─────────────────────────────────────────────
function build() {
  console.log("Building Zeroth Layer...\n");
  const t0 = Date.now();

  // Clean & create output dirs
  if (fs.existsSync(OUTPUT_DIR)) fs.rmSync(OUTPUT_DIR, { recursive: true });
  ensureDir(OUTPUT_DIR);
  ensureDir(BLOG_DIR);

  // ── Read & parse Markdown files ──
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md") && f !== ".gitkeep" && f !== "index.md");

  const posts = [];
  const pages = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data: fm, content: mdContent } = matter(raw);
    const slug = path.basename(file, ".md");
    const html = marked.parse(mdContent);

    const item = {
      slug,
      title:       fm.title || slug,
      date:        fm.date ? new Date(fm.date).toISOString().split("T")[0] : "2026-01-01",
      tags:        fm.tags || [],
      description: fm.description || "",
      layout:      fm.layout || "post",
      rawContent:  mdContent,
      html,
    };

    item.layout === "page" ? pages.push(item) : posts.push(item);
  }

  // Sort posts newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Collect all unique tags
  const allTags = [...new Set(posts.flatMap((p) => p.tags))];

  // ── Root landing page ──
  fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), rootPageTemplate());
  console.log("  ✓ index.html  (root landing page)");

  // ── Blog homepage ──
  const blogHome = blogPageTemplate({
    title:       SITE.title,
    description: SITE.description,
    content:     homepageContent(posts, allTags),
  });
  fs.writeFileSync(path.join(BLOG_DIR, "index.html"), blogHome);
  console.log("  ✓ blog/index.html");

  // ── Post pages ──
  for (const post of posts) {
    const dir = path.join(BLOG_DIR, post.slug);
    ensureDir(dir);
    const html = blogPageTemplate({
      title:       post.title,
      description: post.description,
      content:     postContent(post),
      slug:        post.slug,
    });
    fs.writeFileSync(path.join(dir, "index.html"), html);
    console.log(`  ✓ blog/${post.slug}/index.html`);
  }

  // ── Static pages (about, etc.) ──
  for (const page of pages) {
    const dir = path.join(BLOG_DIR, page.slug);
    ensureDir(dir);
    const html = blogPageTemplate({
      title:       page.title,
      description: page.description,
      content:     pageContent(page),
      slug:        page.slug,
    });
    fs.writeFileSync(path.join(dir, "index.html"), html);
    console.log(`  ✓ blog/${page.slug}/index.html`);
  }

  // ── Tag pages ──
  for (const tag of allTags) {
    const tagSlug = slugify(tag);
    const dir = path.join(BLOG_DIR, "tags", tagSlug);
    ensureDir(dir);
    const tagPosts = posts.filter((p) => p.tags.map(slugify).includes(tagSlug));
    const html = blogPageTemplate({
      title:       `${tag} — ${SITE.title}`,
      description: `Posts tagged "${tag}"`,
      content:     tagContent(tag, tagPosts),
      slug:        `tags/${tagSlug}`,
    });
    fs.writeFileSync(path.join(dir, "index.html"), html);
    console.log(`  ✓ blog/tags/${tagSlug}/index.html`);
  }

  // ── RSS feed ──
  fs.writeFileSync(path.join(BLOG_DIR, "feed.xml"), generateRSS(posts));
  console.log("  ✓ blog/feed.xml");

  // ── Sitemap ──
  fs.writeFileSync(path.join(OUTPUT_DIR, "sitemap.xml"), generateSitemap(posts, allTags));
  console.log("  ✓ sitemap.xml");

  // ── CNAME & .nojekyll ──
  fs.writeFileSync(path.join(OUTPUT_DIR, "CNAME"), "zerothlayer.com");
  fs.writeFileSync(path.join(OUTPUT_DIR, ".nojekyll"), "");
  console.log("  ✓ CNAME / .nojekyll");

  // ── 404 ──
  fs.writeFileSync(path.join(OUTPUT_DIR, "404.html"), generate404());
  console.log("  ✓ 404.html");

  // ── Static assets → root (shared by both / and /blog/) ──
  const statics = fs.readdirSync(STATIC_DIR);
  for (const file of statics) {
    const src = path.join(STATIC_DIR, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(OUTPUT_DIR, file));
      console.log(`  ✓ ${file}  (static → root)`);
    }
  }

  const elapsed = Date.now() - t0;
  console.log(`\nDone in ${elapsed}ms — ${posts.length} posts, ${pages.length} pages, ${allTags.length} tags`);
  console.log(`  zerothlayer.com/       → root landing page`);
  console.log(`  zerothlayer.com/blog/  → blog`);
}

build();
