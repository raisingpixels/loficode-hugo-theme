# LofiCode Hugo Theme - Technical Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Theme Architecture](#theme-architecture)
4. [Layout System](#layout-system)
5. [CSS Architecture](#css-architecture)
6. [JavaScript Features](#javascript-features)
7. [Search Implementation](#search-implementation)
8. [Theme System](#theme-system)
9. [Performance Optimizations](#performance-optimizations)
10. [Build Process](#build-process)
11. [Contributing Guidelines](#contributing-guidelines)
12. [Advanced Features](#advanced-features)

## Overview

The LofiCode Hugo theme is a modern, developer-focused theme that combines a retro lo-fi aesthetic with cutting-edge web technologies. It features a dual-theme system (light/dark), advanced search functionality, ambient sound system, and immersive visual effects while maintaining excellent performance and accessibility.

### Key Technologies
- **Hugo**: Static site generator (v0.112.0+)
- **CSS**: Custom properties, CSS Grid, Flexbox
- **JavaScript**: Vanilla ES6+ (no frameworks)
- **Fonts**: Google Fonts (Inter, Orbitron, JetBrains Mono)
- **Audio**: Web Audio API for ambient sounds

### Design Philosophy
- **Performance First**: Minimal dependencies, optimized assets
- **Accessibility**: WCAG AA compliance, semantic HTML
- **Developer Experience**: Clean code, comprehensive documentation
- **Visual Appeal**: Retro-futuristic vaporwave aesthetic with smooth animations

## Project Structure

```
loficode/
├── archetypes/
│   └── default.md                 # Content templates
├── exampleSite/                   # Demo site
│   ├── content/
│   │   ├── posts/                # Sample blog posts
│   │   ├── _index.md             # Homepage content
│   │   ├── about.md              # About page
│   │   └── contact.md            # Contact page
│   ├── static/
│   │   └── images/               # Sample images
│   └── hugo.toml                 # Example configuration
├── layouts/
│   ├── _default/
│   │   ├── baseof.html           # Base template
│   │   ├── list.html             # List page template
│   │   ├── single.html           # Single post template
│   │   └── index.html            # Homepage template
│   ├── partials/
│   │   ├── head.html             # HTML head section
│   │   ├── header.html           # Site header
│   │   ├── footer.html           # Site footer
│   │   ├── ambient-bar.html      # Ambient sound controls
│   │   ├── post-list-item.html   # Post preview component
│   │   └── toc.html              # Table of contents
│   ├── taxonomy/
│   │   ├── list.html             # Taxonomy listing
│   │   └── term.html             # Individual term page
│   ├── 404.html                  # Custom 404 page with search
│   ├── index.json                # Search index template
│   └── pages.json                # Pages index template
├── static/
│   ├── css/
│   │   └── style.css             # Main stylesheet
│   ├── js/
│   │   └── main.js               # Main JavaScript
│   └── images/                   # Theme assets
├── .github/
│   └── workflows/
│       └── hugo.yml              # CI/CD pipeline
├── theme.toml                    # Theme metadata
└── README.md                     # Documentation
```

## Theme Architecture

### Hugo Template Hierarchy

The theme follows Hugo's template lookup order with strategic overrides:

1. **Base Template (`baseof.html`)**
   - Defines the overall HTML structure
   - Conditionally includes reading progress bar
   - Conditionally includes header and ambient bar based on page type
   - Provides blocks for content injection

2. **Layout Templates**
   - `index.html`: Homepage with posts grid and filtering
   - `single.html`: Individual post pages with sidebar
   - `list.html`: Archive and category pages
   - `404.html`: Custom error page with integrated search

3. **Partial Templates**
   - Modular components for reusability
   - Each partial has a specific responsibility
   - Easy to maintain and extend

### Base Template Structure

```html
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}" data-theme="light">
<head>
    {{ partial "head.html" . }}
</head>
<body>
    {{ if not .IsHome }}
    <div class="reading-progress"></div>
    {{ end }}

    {{ if not (eq .Type "posts") }}
    {{ partial "header.html" . }}
    {{ end }}

    <main>
        {{ block "main" . }}{{ end }}
    </main>

    {{ if not (eq .Type "posts") }}
    {{ partial "ambient-bar.html" . }}
    {{ end }}

    <script src="{{ "js/main.js" | absLangURL }}"></script>
</body>
</html>
```

**Key Features:**
- **Conditional reading progress**: Only shows on non-homepage pages
- **Conditional header**: Hidden on post pages for immersive reading
- **Conditional ambient bar**: Hidden on post pages to avoid conflicts
- **Simple script loading**: Direct script inclusion without Hugo Pipes

### Content Types

The theme supports multiple content types with rich front matter:

```yaml
# Front matter example
---
title: "Post Title"
date: 2023-01-01T00:00:00Z
draft: false
description: "Post description for SEO"
tags: ["tag1", "tag2"]
categories: ["category1"]
featured_image: "/images/post-image.jpg"
author: "Author Name"
reading_time: 5
toc: true
mood: "focused"
featured: true
---
```

## Layout System

### Responsive Grid System

The theme uses CSS Grid for layout with responsive breakpoints.

### Post Layout with Sidebar

The single post layout includes a sticky sidebar for desktop.

## CSS Architecture

### CSS Custom Properties System

The theme uses a sophisticated CSS custom properties system with automatic theme detection.

### Key CSS Features

1. **Automatic Theme Detection**: Uses `prefers-color-scheme` media query
2. **Manual Theme Override**: `data-theme` attribute on `<html>` element
3. **Comprehensive Variable System**: Colors, typography, spacing, shadows, and gradients
4. **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
5. **Advanced Animations**: Keyframe animations for visual effects

### Component-Based Architecture

The CSS follows a component-based approach with clear naming conventions.

## JavaScript Features

### Architecture Overview

The JavaScript is implemented as a single IIFE (Immediately Invoked Function Expression) that contains all functionality. The main features include:

1. **Theme Management**: Auto-detection and manual toggle between light/dark themes
2. **Reading Progress**: Visual progress bar for blog posts
3. **Ambient Sound System**: Lo-fi background sounds with controls
4. **Search Functionality**: Real-time search with results overlay
5. **Table of Contents**: Auto-generated navigation for posts
6. **SPA System**: Single Page Application overlay for seamless navigation
7. **Code Enhancement**: Copy functionality for code blocks
8. **Tag Filtering**: Interactive tag filtering on homepage
9. **Load More**: Progressive loading of posts

### Key Features Implementation

#### Theme Management
- **Auto-detection**: Respects system preference on first visit
- **Manual toggle**: Persistent user preference in localStorage
- **System preference monitoring**: Automatically switches if no manual preference set
- **Smooth transitions**: CSS transitions for all theme changes
- **Icon updates**: Theme toggle button updates based on current theme

#### Reading Progress Bar
- **Conditional display**: Only shows on blog post pages (not homepage)
- **Accurate calculation**: Based on article content, not entire page
- **Smooth animation**: Uses CSS transitions for fluid progress updates
- **Fixed positioning**: Stays at top of viewport during scroll

#### Ambient Sound System
- **Multiple sound sources**: Coffee shop, rain, fireplace ambience
- **Volume control**: Slider with visual feedback on equalizer
- **Graceful fallback**: Handles missing audio files without breaking
- **Visual feedback**: Animated equalizer bars and button states
- **Keyboard shortcuts**: 'm' key for mute toggle
- **Persistent state**: Continues playing during SPA navigation

#### Search Implementation
- **Real-time search**: Results update as user types (300ms debounce)
- **Multiple search targets**: Title, excerpt, content, and tags
- **Highlighting**: Search terms highlighted in results
- **SPA integration**: Search results can trigger SPA navigation
- **Sliding interface**: Search form slides down from header

### SPA Navigation System

The theme includes a sophisticated Single Page Application system for seamless navigation.

**SPA Features:**
- **Seamless navigation**: No page reloads for internal links
- **Overlay system**: Posts open in overlay on homepage
- **History management**: Proper browser back/forward support
- **Real page detection**: Distinguishes between SPA and real pages
- **Ambient sound persistence**: Sounds continue during navigation

### Ambient Sound System

The theme includes a comprehensive ambient sound system.

**Ambient Sound Features:**
- **Multiple sound sources**: Coffee shop, rain, fireplace
- **Volume control**: Real-time volume adjustment with visual feedback
- **Graceful fallback**: Handles missing audio files without breaking
- **Visual feedback**: Animated equalizer bars and button states
- **Keyboard shortcuts**: 'm' key for mute toggle
- **Persistent across navigation**: Continues playing during SPA transitions
- **Fixed bottom bar**: Always accessible ambient controls

## Search Implementation

### Search Index Generation

Hugo generates a JSON search index using the `index.json` layout:

```html
<!-- layouts/index.json -->
{{- $pages := where .Site.RegularPages "Type" "posts" -}}
{{- $searchData := slice -}}
{{- range $pages -}}
    {{- $searchData = $searchData | append (dict
        "title" .Title
        "url" .RelPermalink
        "excerpt" (.Summary | plainify | truncate 150)
        "content" (.Content | plainify)
        "tags" .Params.tags
        "date" .Date.Format "2006-01-02"
        "dateFormatted" (.Date.Format "Jan 2, 2006")
        "readingTime" (.ReadingTime | default 1)
        "slug" .File.BaseFileName
    ) -}}
{{- end -}}
{{- $searchData | jsonify -}}
```

### Client-Side Search Implementation

The search is implemented using vanilla JavaScript with simple string matching.

## Theme System

### Theme Detection

- Theme toggle functionality with auto-detection
- Auto-detect theme preference
- Listens for system theme changes

### CSS Theme Implementation

The theme system uses a three-tier approach:

1. **Default (Light)**: Base CSS custom properties
2. **System Preference**: `@media (prefers-color-scheme: dark)` override
3. **Manual Override**: `[data-theme="dark"]` and `[data-theme="light"]` selectors

This ensures proper fallbacks and respects user preferences at all levels.

## Performance Optimizations

### Asset Loading Strategy

- **Direct script loading**: No Hugo Pipes processing for faster builds
- **CSS imports**: Google Fonts loaded via CSS import
- **Lazy loading**: Images use `loading="lazy"` attribute
- **Efficient animations**: CSS transforms and opacity for smooth performance

### JavaScript Optimizations

- **Debounced search** to avoid excessive API calls
- **Efficient scroll handling** with requestAnimationFrame

### CSS Performance

- **CSS custom properties**: Efficient theme switching without JavaScript
- **Transform-based animations**: Hardware acceleration for smooth effects
- **Efficient selectors**: Avoid deep nesting and complex selectors
- **Minimal reflows**: Use transform and opacity for animations

## Build Process

### Hugo Configuration

The theme requires specific Hugo configuration for optimal functionality:

```toml
# hugo.toml
baseURL = "https://example.com"
languageCode = "en-us"
title = "LofiCode Blog"
theme = "loficode"

[params]
  description = "A cozy example site showcasing the LofiCode Hugo theme"
  tagline = "Coding with coffee and lo-fi beats ☕🎵"

  # Profile section
  [params.author]
    name = "LofiCode Dev"
    image = "/images/profile.png"

  [params.social]
    twitter = "username"
    github = "username"
    linkedin = "username"

[markup]
  [markup.highlight]
    style = "dracula"
    lineNos = true
    lineNumbersInTable = false
    tabWidth = 2
    noClasses = false

[outputs]
  home = ["HTML", "RSS", "JSON"]
  section = ["HTML", "RSS"]
```

**Key Configuration Points:**
- **JSON output**: Required for search functionality
- **Syntax highlighting**: Dracula style for code blocks

## Contributing Guidelines

### Code Style

1. **HTML**: Use semantic HTML5 elements
2. **CSS**: Follow component-based naming with BEM-inspired conventions
3. **JavaScript**: Use ES6+ features, avoid jQuery
4. **Hugo**: Follow Hugo best practices and template conventions

### File Organization

```
layouts/
├── _default/          # Default templates
├── partials/          # Reusable components
├── taxonomy/          # Taxonomy templates
└── 404.html          # Custom 404 page

static/
├── css/              # Main stylesheet
├── js/               # Main JavaScript
└── images/           # Theme assets
```

### Development Workflow

1. **Setup**: Clone repository and install Hugo
2. **Development**: Use `hugo server -D` for live reload
3. **Testing**: Test on multiple browsers and devices
4. **Documentation**: Update documentation for new features
5. **Pull Request**: Submit PR with clear description

### Testing Checklist

- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness
- [ ] Accessibility (WCAG AA)
- [ ] Performance (Lighthouse score > 90)
- [ ] SEO optimization
- [ ] Theme switching functionality
- [ ] Search functionality
- [ ] Ambient sound system
- [ ] SPA navigation
- [ ] Build process
