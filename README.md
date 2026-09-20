# Varun Shiralkar

Personal website and blog. Built with Next.js and statically exported to GitHub Pages.

## Develop

```bash
npm install
npm run dev
```

## Blog posts

Add Markdown files to `content/blog/` with frontmatter:

```md
---
title: Post title
date: 2026-09-20
excerpt: One-line summary
---

Body copy here.
```

Edit `content/about.md` for the About page.

## Deploy

Pushes to `main` build and deploy via GitHub Actions (`.github/workflows/deploy.yml`). In the repo settings, set Pages source to **GitHub Actions**.
