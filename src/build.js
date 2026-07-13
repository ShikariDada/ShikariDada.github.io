#!/usr/bin/env node
/**
 * Zeroth Layer — Static Site Builder
 *
 * Reads Markdown from content/, generates HTML pages with the
 * stephango.com design language (Flexoki colors, minimal layout).
 *
 * Usage:
 *   node src/build.js          Build once
 *   node src/build.js --watch  Rebuild on file changes
 *
 * Output: public/
 */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

// ─────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────
const CONTENT_DIR = path.join(__dirname, "..", "content");
const OUTPUT_DIR = path.join(__dirname, "..", "public");
const STATIC_DIR = path.join(__dirname, "..", "static");
const SITE = {
  title: "Zeroth Layer",
  url: "https://zerothlayer.com",
  description: "Ideas, essays, and explorations about life and the systems that shape it.",
  author: "Zeroth Layer",
  instagram: "https://www.instagram.com/zerothlayer?igsh=OGF2ZnowdG1hbWhq",
  discord: "https://discord.gg/kqW9Ea5pMP",
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} minute read`;
}

function formatDateLong(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year} · ${month}`;
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function excerpt(text, maxLen = 160) {
  // Strip markdown formatting for a clean plain-text excerpt
  const plain = text
    .replace(/^---[\s\S]*?---/, "")  // frontmatter
    .replace(/#+\s/g, "")            // headings
    .replace(/\*\*|__/g, "")         // bold
    .replace(/\*|_/g, "")            // italic
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\n+/g, " ")           // newlines
    .trim();
  if (plain.length <= maxLen) return plain;
  return plain.substring(0, maxLen).replace(/\s+\S*$/, "") + "...";
}

// ─────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────
function baseTemplate({ title, description, content, slug = "" }) {
  const pageTitle = slug ? `${title} — ${SITE.title}` : SITE.title;
  const pageDesc = description || SITE.description;
  const canonicalUrl = slug ? `${SITE.url}/${slug}` : SITE.url + "/";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <script>
      // MUST be first — prevents flash of wrong theme on every page load
      (function() {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('theme-dark');
        }
      })();
    </script>
    <meta charset="UTF-8">
    <title>${pageTitle}</title>

    <meta name="viewport"            content="width=device-width, initial-scale=1.0">
    <meta name="description"         content="${pageDesc}">
    <meta name="author"              content="${SITE.author}">

    <link rel="canonical"            href="${canonicalUrl}">
    <link rel="icon"                 href="/icon.png" type="image/png">
    <link rel="stylesheet"           href="/styles.css" type="text/css">
    <link rel="alternate"            href="/feed.xml" type="application/atom+xml" title="${SITE.title}">

    <meta property="og:site_name"    content="${SITE.title}">
    <meta property="og:url"          content="${canonicalUrl}">
    <meta property="og:title"        content="${title}">
    <meta property="og:description"  content="${pageDesc}">
    <meta property="og:type"         content="article">
  </head>

  <body>
    <nav class="flex align-center">
      <span class="flex-grow">
        <a class="plain" href="/">${SITE.title}</a>
      </span>
      <span class="flex-shrink nav-links">
        <a href="/about" class="muted plain">About</a>
      </span>
      <span id="theme-toggle" title="Toggle dark mode" aria-label="Toggle dark mode" role="switch">
        <div class="theme-toggle-slide"></div>
        <div class="theme-toggle-switch"></div>
      </span>
    </nav>

    <main>
      ${content}
    </main>

    <footer>
      <div class="wrap">
        <p class="muted">Follow me on <a href="${SITE.instagram}">Instagram</a>, and join the <a href="${SITE.discord}">Discord Community</a>.</p>
        <a href="/about" class="footer-logo">
          <img src="/icon.png" alt="About ${SITE.title}">
        </a>
      </div>
    </footer>

    <script src="/theme.js"></script>
  </body>
</html>`;
}

function homeTemplate(posts, allTags) {
  const latest = posts[0];
  if (!latest) return "<div class='wrap'><p>No posts yet.</p></div>";

  const latestHtml = `
      <p><span class="muted small">Latest</span></p>

      <div>
        <a href="/${latest.slug}" class="plain">
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
    .map((t) => `<a href="/tags/${slugify(t)}">${t}</a>`)
    .join(`<span class="muted">, </span>\n          `);

  const writingHtml = posts
    .map(
      (p) =>
        `<li><span class="list-date muted">${formatDateShort(p.date)}</span> <a href="/${p.slug}">${p.title}</a></li>`
    )
    .join("\n          ");

  return `
      <div class="wrap">
        ${latestHtml}

        <hr>

        <p><span class="muted small">Topics</span></p>

        <div class="line-height-loose">
          ${topicsHtml}
        </div>

        <hr>

        <p><span class="muted small">Writing</span></p>

        <ul class="clean-list">
          ${writingHtml}
        </ul>
      </div>`;
}

function postTemplate(post) {
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

function pageTemplate(page) {
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

function tagTemplate(tag, posts) {
  const listHtml = posts
    .map(
      (p) =>
        `<li><span class="list-date muted">${formatDateShort(p.date)}</span> <a href="/${p.slug}">${p.title}</a></li>`
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
    .map(
      (p) => `
    <entry>
      <title>${p.title}</title>
      <link href="${SITE.url}/${p.slug}"/>
      <id>${SITE.url}/${p.slug}</id>
      <updated>${new Date(p.date).toISOString()}</updated>
      <summary>${p.description || excerpt(p.rawContent)}</summary>
      <content type="html"><![CDATA[${p.html}]]></content>
    </entry>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${SITE.title}</title>
  <link href="${SITE.url}/"/>
  <link href="${SITE.url}/feed.xml" rel="self"/>
  <id>${SITE.url}/</id>
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
    `<url><loc>${SITE.url}/about</loc></url>`,
    ...posts.map((p) => `<url><loc>${SITE.url}/${p.slug}</loc></url>`),
    ...tags.map((t) => `<url><loc>${SITE.url}/tags/${slugify(t)}</loc></url>`),
  ].join("\n  ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;
}

// ─────────────────────────────────────────────
// Main Build
// ─────────────────────────────────────────────
function build() {
  console.log("Building Zeroth Layer...");
  const startTime = Date.now();

  // Clean output
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  ensureDir(OUTPUT_DIR);

  // Read all markdown files
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md") && f !== ".gitkeep");

  const posts = [];
  const pages = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
    const { data: fm, content: mdContent } = matter(raw);

    const slug = path.basename(file, ".md");
    const html = marked.parse(mdContent);

    const item = {
      slug,
      title: fm.title || slug,
      date: fm.date ? new Date(fm.date).toISOString().split("T")[0] : "2026-01-01",
      tags: fm.tags || [],
      description: fm.description || "",
      layout: fm.layout || "post",
      rawContent: mdContent,
      html,
    };

    // index.md is no longer needed — homepage is auto-generated
    if (slug === "index") continue;

    if (item.layout === "page") {
      pages.push(item);
    } else {
      posts.push(item);
    }
  }

  // Sort posts by date (newest first)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Collect all tags
  const allTags = [...new Set(posts.flatMap((p) => p.tags))];

  // ── Generate Homepage ──
  const homeContent = homeTemplate(posts, allTags);
  const homeHtml = baseTemplate({
    title: SITE.title,
    description: SITE.description,
    content: homeContent,
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), homeHtml);
  console.log("  ✓ index.html");

  // ── Generate Post Pages ──
  for (const post of posts) {
    const dir = path.join(OUTPUT_DIR, post.slug);
    ensureDir(dir);
    const content = postTemplate(post);
    const html = baseTemplate({
      title: post.title,
      description: post.description,
      content,
      slug: post.slug,
    });
    fs.writeFileSync(path.join(dir, "index.html"), html);
    console.log(`  ✓ ${post.slug}/index.html`);
  }

  // ── Generate Pages (about, etc.) ──
  for (const page of pages) {
    const dir = path.join(OUTPUT_DIR, page.slug);
    ensureDir(dir);
    const content = pageTemplate(page);
    const html = baseTemplate({
      title: page.title,
      description: page.description,
      content,
      slug: page.slug,
    });
    fs.writeFileSync(path.join(dir, "index.html"), html);
    console.log(`  ✓ ${page.slug}/index.html`);
  }

  // ── Generate Tag Pages ──
  for (const tag of allTags) {
    const tagSlug = slugify(tag);
    const dir = path.join(OUTPUT_DIR, "tags", tagSlug);
    ensureDir(dir);
    const tagPosts = posts.filter((p) => p.tags.map(slugify).includes(tagSlug));
    const content = tagTemplate(tag, tagPosts);
    const html = baseTemplate({
      title: `${tag} — ${SITE.title}`,
      description: `Posts tagged "${tag}"`,
      content,
      slug: `tags/${tagSlug}`,
    });
    fs.writeFileSync(path.join(dir, "index.html"), html);
    console.log(`  ✓ tags/${tagSlug}/index.html`);
  }

  // ── Generate RSS Feed ──
  fs.writeFileSync(path.join(OUTPUT_DIR, "feed.xml"), generateRSS(posts));
  console.log("  ✓ feed.xml");

  // ── Generate Sitemap ──
  fs.writeFileSync(path.join(OUTPUT_DIR, "sitemap.xml"), generateSitemap(posts, allTags));
  console.log("  ✓ sitemap.xml");

  // ── Generate CNAME ──
  fs.writeFileSync(path.join(OUTPUT_DIR, "CNAME"), "zerothlayer.com");
  console.log("  ✓ CNAME");

  // ── Generate .nojekyll ──
  fs.writeFileSync(path.join(OUTPUT_DIR, ".nojekyll"), "");
  console.log("  ✓ .nojekyll");

  // ── Generate 404 page (redirects /blog/... old Quartz links gracefully) ──
  const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script>
      (function() {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('theme-dark');
        }
        // Redirect old /blog/... Quartz URLs to clean root URLs
        var path = window.location.pathname;
        if (path.startsWith('/blog/')) {
          var newPath = path.replace('/blog', '') || '/';
          window.location.replace(newPath);
        }
      })();
    </script>
    <meta charset="UTF-8">
    <title>Page not found — ${SITE.title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/styles.css">
    <link rel="icon" href="/icon.png" type="image/png">
  </head>
  <body>
    <nav class="flex align-center">
      <span class="flex-grow"><a class="plain" href="/">${SITE.title}</a></span>
      <span class="flex-shrink nav-links"><a href="/about" class="muted plain">About</a></span>
      <span id="theme-toggle" title="Toggle dark mode" aria-label="Toggle dark mode" role="switch">
        <div class="theme-toggle-slide"></div>
        <div class="theme-toggle-switch"></div>
      </span>
    </nav>
    <main>
      <div class="wrap">
        <heading><h1>404</h1></heading>
        <article>
          <p class="muted">This page does not exist. <a href="/">Go home →</a></p>
        </article>
      </div>
    </main>
    <script src="/theme.js"></script>
  </body>
</html>`;
  fs.writeFileSync(path.join(OUTPUT_DIR, "404.html"), notFoundHtml);
  console.log("  ✓ 404.html");

  // ── Copy Static Assets ──
  const statics = fs.readdirSync(STATIC_DIR);
  for (const file of statics) {
    const src = path.join(STATIC_DIR, file);
    const dest = path.join(OUTPUT_DIR, file);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, dest);
      console.log(`  ✓ ${file} (static)`);
    }
  }

  const elapsed = Date.now() - startTime;
  console.log(`\nDone in ${elapsed}ms — ${posts.length} posts, ${pages.length} pages, ${allTags.length} tags`);
}

// ─────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────
build();
