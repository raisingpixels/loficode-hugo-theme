// LofiCode Main JavaScript

(function () {
  "use strict";

  // Theme toggle functionality with auto-detection
  const themeToggle = document.querySelector(".theme-toggle");
  const htmlElement = document.documentElement;

  // Auto-detect theme preference
  function getInitialTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme;
    }

    // Use system preference if no saved theme
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }

    return "light";
  }

  // Set initial theme
  const currentTheme = getInitialTheme();
  htmlElement.setAttribute("data-theme", currentTheme);

  // Update button icon and text based on theme
  function updateThemeIcon() {
    const isDark = htmlElement.getAttribute("data-theme") === "dark";
    if (themeToggle) {
      themeToggle.innerHTML = isDark ? "☀️" : "🌙";
    }
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem("theme")) {
          const newTheme = e.matches ? "dark" : "light";
          htmlElement.setAttribute("data-theme", newTheme);
          updateThemeIcon();
        }
      });
  }

  if (themeToggle) {
    updateThemeIcon();

    themeToggle.addEventListener("click", () => {
      const currentTheme = htmlElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      htmlElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateThemeIcon();
    });
  }

  // Reading progress (for blog posts)
  const readingProgress = document.querySelector(".reading-progress");
  if (readingProgress) {
    function updateReadingProgress() {
      const article = document.querySelector(".post-content");
      if (!article) return;

      const scrolled = window.scrollY;
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;

      const progress = Math.max(
        0,
        Math.min(
          100,
          ((scrolled - articleTop + windowHeight) / articleHeight) * 100
        )
      );

      readingProgress.style.width = progress + "%";
    }

    window.addEventListener("scroll", updateReadingProgress);
    updateReadingProgress(); // Initial call
  }

  // Ambient sound controls
  const muteToggle = document.querySelector(".mute-toggle");
  const ambientIcons = document.querySelectorAll(".ambient-icon");
  const ambientLabel = document.querySelector(".ambient-label");
  const volumeSlider = document.querySelector(".volume-slider");
  const equalizer = document.querySelector(".equalizer");

  let currentSound = null;
  let isPlaying = false;
  let audioElements = {};

  // Sound data
  const sounds = {
    coffee: { name: "Coffee Shop Ambience", emoji: "☕" },
    rain: { name: "Gentle Rain", emoji: "🌧️" },
    fireplace: { name: "Crackling Fireplace", emoji: "🔥" },
  };

  function updateAmbientState() {
    if (!muteToggle || !ambientLabel || !equalizer) return;

    const muteIcon = muteToggle.querySelector("i");

    if (isPlaying && currentSound) {
      muteToggle.classList.remove("muted");
      if (muteIcon) {
        muteIcon.className = "fas fa-volume-up";
      }
      muteToggle.title = "Mute ambient sounds";
      equalizer.classList.remove("muted");
      ambientLabel.textContent = `Playing: ${sounds[currentSound].name}`;
    } else {
      muteToggle.classList.add("muted");
      if (muteIcon) {
        muteIcon.className = "fas fa-volume-mute";
      }
      muteToggle.title = "Play ambient sounds";
      equalizer.classList.add("muted");
      if (currentSound) {
        ambientLabel.textContent = `Paused: ${sounds[currentSound].name}`;
      } else {
        ambientLabel.textContent = "Click to start ambient sounds";
      }
    }
  }

  // Load audio file
  async function loadSound(soundType) {
    if (audioElements[soundType]) {
      return audioElements[soundType];
    }

    try {
      const audio = new Audio(`/audio/${soundType}.mp3`);
      audio.loop = true;
      audio.volume = volumeSlider ? volumeSlider.value : 0.3;

      // Handle loading errors gracefully
      audio.addEventListener("error", () => {
        console.log(`Could not load ${soundType} audio file`);
        if (ambientLabel) {
          ambientLabel.textContent = `${sounds[soundType].name} not available`;
        }
        // Remove the audio element from cache so it doesn't try again
        delete audioElements[soundType];
      });

      // Test if the audio file exists by trying to load it
      return new Promise((resolve, reject) => {
        audio.addEventListener("canplaythrough", () => {
          audioElements[soundType] = audio;
          resolve(audio);
        });

        audio.addEventListener("error", () => {
          reject(new Error(`Audio file not found: ${soundType}.mp3`));
        });

        // Set a timeout to avoid hanging
        setTimeout(() => {
          reject(new Error(`Audio loading timeout: ${soundType}.mp3`));
        }, 5000);

        audio.load();
      });
    } catch (error) {
      console.log(`Error loading ${soundType} audio:`, error);
      if (ambientLabel) {
        ambientLabel.textContent = `${sounds[soundType].name} not available`;
      }
      return null;
    }
  }

  if (muteToggle) {
    muteToggle.addEventListener("click", async () => {
      if (currentSound) {
        const audio = audioElements[currentSound];
        if (audio) {
          if (isPlaying) {
            audio.pause();
            isPlaying = false;
          } else {
            try {
              await audio.play();
              isPlaying = true;
            } catch (e) {
              console.log("Could not play audio:", e);
            }
          }
          updateAmbientState();
        }
      }
    });
  }

  ambientIcons.forEach((icon) => {
    icon.addEventListener("click", async () => {
      const soundType = icon.dataset.sound;

      // Stop current sound if playing
      if (currentSound && audioElements[currentSound]) {
        audioElements[currentSound].pause();
        isPlaying = false;
      }

      // Remove active state from all icons
      ambientIcons.forEach((i) => i.classList.remove("active"));

      if (currentSound === soundType && !isPlaying) {
        // If clicking the same sound that's paused, play it
        const audio = audioElements[soundType];
        if (audio) {
          try {
            await audio.play();
            isPlaying = true;
            icon.classList.add("active");
          } catch (e) {
            console.log("Could not play audio:", e);
          }
        }
      } else if (currentSound === soundType && isPlaying) {
        // If clicking the same sound that's playing, stop it
        currentSound = null;
        isPlaying = false;
      } else {
        // Start new sound
        currentSound = soundType;

        try {
          const audio = await loadSound(soundType);
          if (audio) {
            await audio.play();
            isPlaying = true;
            icon.classList.add("active");
          } else {
            // Audio file not available
            isPlaying = false;
            currentSound = null;
            if (ambientLabel) {
              ambientLabel.textContent = `${sounds[soundType].name} not available`;
            }
          }
        } catch (e) {
          console.log("Could not load or play audio:", e);
          isPlaying = false;
          currentSound = null;
          if (ambientLabel) {
            ambientLabel.textContent = `${sounds[soundType].name} not available`;
          }
        }
      }

      updateAmbientState();
    });
  });

  if (volumeSlider) {
    volumeSlider.addEventListener("input", (e) => {
      const volume = e.target.value;

      // Update volume for all loaded audio elements
      Object.values(audioElements).forEach((audio) => {
        audio.volume = volume;
      });

      // Visual feedback on equalizer intensity
      const bars = document.querySelectorAll(".equalizer-bar");
      bars.forEach((bar) => {
        bar.style.opacity = Math.max(0.3, volume);
      });
    });
  }

  // Initialize ambient state
  updateAmbientState();

  // Copy code functionality for shortcodes
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const codeContent = e.target.parentElement.nextElementSibling.textContent;

      try {
        await navigator.clipboard.writeText(codeContent);
        btn.textContent = "Copied!";
        btn.style.background = "rgba(0, 255, 0, 0.3)";

        setTimeout(() => {
          btn.textContent = "Copy";
          btn.style.background = "rgba(255, 255, 255, 0.2)";
        }, 2000);
      } catch (err) {
        btn.textContent = "Failed";
        setTimeout(() => {
          btn.textContent = "Copy";
        }, 2000);
      }
    });
  });

  // Enhanced code fence functionality for markdown
  function initializeCodeFences() {
    const highlights = document.querySelectorAll(".highlight");

    highlights.forEach((highlight) => {
      // Extract language from class names
      const pre = highlight.querySelector("pre");
      const code = highlight.querySelector("code");

      if (code) {
        // Look for language class (e.g., language-html, language-javascript)
        const classList = Array.from(code.classList);
        const langClass = classList.find((cls) => cls.startsWith("language-"));

        if (langClass) {
          const lang = langClass.replace("language-", "");
          highlight.setAttribute("data-lang", lang);
        }
      }

      // Add copy functionality to markdown code fences
      highlight.addEventListener("click", async (e) => {
        // Check if click is on the copy button area (pseudo-element)
        const rect = highlight.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Copy button is positioned at center-right of header (header is ~50px tall)
        if (clickX > rect.width - 80 && clickY < 50) {
          e.preventDefault();

          const code = highlight.querySelector("code");
          if (code) {
            try {
              // Extract clean code content without line numbers
              let codeText = code.textContent;

              // Remove line numbers if they exist
              // Hugo often generates line numbers in various formats
              codeText = codeText
                // Remove numbered lines (e.g., "1 ", "2 ", etc. at start of lines)
                .replace(/^\s*\d+\s+/gm, '')
                // Remove line number spans or elements
                .replace(/^\s*\d+\s*/gm, '')
                // Clean up any extra whitespace
                .trim();

              await navigator.clipboard.writeText(codeText);

              // Visual feedback - temporarily change the pseudo-element content
              highlight.setAttribute("data-copied", "true");

              setTimeout(() => {
                highlight.removeAttribute("data-copied");
              }, 2000);
            } catch (err) {
              console.log("Copy failed:", err);
            }
          }
        }
      });
    });
  }

  // Initialize code fences when DOM is ready
  initializeCodeFences();

  // Table of contents generation and highlighting
  function generateTOC() {
    const tocContent = document.getElementById("toc-content");
    const headings = document.querySelectorAll(".post-body h2, .post-body h3");

    if (!tocContent || headings.length === 0) return;

    const tocList = document.createElement("ul");

    headings.forEach((heading, index) => {
      // Add ID to heading if it doesn't have one
      if (!heading.id) {
        heading.id = `heading-${index}`;
      }

      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${heading.id}`;
      a.textContent = heading.textContent;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;
        const targetPosition = heading.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });
      });

      li.appendChild(a);
      tocList.appendChild(li);
    });

    tocContent.appendChild(tocList);
  }

  function updateTOC() {
    const headings = document.querySelectorAll(".post-body h2, .post-body h3");
    const tocLinks = document.querySelectorAll("#toc-content a");

    if (headings.length === 0 || tocLinks.length === 0) return;

    let current = 0;
    headings.forEach((heading, i) => {
      if (heading.getBoundingClientRect().top <= 100) {
        current = i;
      }
    });

    tocLinks.forEach((link, i) => {
      link.classList.toggle("active", i === current);
    });
  }

  // Generate TOC if we're on a blog post
  if (document.querySelector(".post-body")) {
    generateTOC();
    window.addEventListener("scroll", updateTOC);
    updateTOC(); // Initial call
  }

  // Tag filtering (for homepage)
  const filterTags = document.querySelectorAll(".filter-tags .tag");
  filterTags.forEach((tag) => {
    tag.addEventListener("click", () => {
      // Remove active from all tags
      filterTags.forEach((t) => t.classList.remove("active"));
      // Add active to clicked tag
      tag.classList.add("active");

      const tagName = tag.dataset.tag || tag.textContent.toLowerCase();
      const posts = document.querySelectorAll(".post-item");

      if (tagName === "all" || tag.textContent === "All") {
        // Show all posts
        posts.forEach((post) => {
          post.style.display = "grid";
        });
      } else {
        // Filter posts by tag
        posts.forEach((post) => {
          const postTags = Array.from(
            post.querySelectorAll(".post-tag-vaporwave")
          ).map((tagEl) => tagEl.textContent.toLowerCase());

          if (postTags.some((postTag) => postTag.includes(tagName))) {
            post.style.display = "grid";
          } else {
            post.style.display = "none";
          }
        });
      }
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Sliding Search Form functionality
  const searchToggle = document.querySelector(".search-toggle");
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const searchClose = document.querySelector(".search-close");
  const searchSubmit = document.querySelector(".search-submit");

  let searchData = [];
  let isSearchOpen = false;

  // Load search data (posts) - works on all pages
  async function loadSearchData() {
    // If we're on the homepage, use the existing post items
    const posts = document.querySelectorAll(".post-item");
    if (posts.length > 0) {
      searchData = Array.from(posts).map((post) => {
        const titleElement = post.querySelector(".post-title-vaporwave a");
        const excerptElement = post.querySelector(".post-excerpt-vaporwave");
        const tagsElements = post.querySelectorAll(".post-tag-vaporwave");
        const dateElement = post.querySelector(".post-date");

        return {
          title: titleElement ? titleElement.textContent : "",
          url: titleElement ? titleElement.href : "",
          excerpt: excerptElement ? excerptElement.textContent : "",
          tags: Array.from(tagsElements).map((tag) => tag.textContent),
          date: dateElement ? dateElement.textContent : "",
          element: post,
        };
      });
    } else {
      // If we're on other pages, try to fetch the homepage to get post data
      try {
        const response = await fetch("/");
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const homepagePosts = doc.querySelectorAll(".post-item");

        searchData = Array.from(homepagePosts).map((post) => {
          const titleElement = post.querySelector(".post-title-vaporwave a");
          const excerptElement = post.querySelector(".post-excerpt-vaporwave");
          const tagsElements = post.querySelectorAll(".post-tag-vaporwave");
          const dateElement = post.querySelector(".post-date");

          return {
            title: titleElement ? titleElement.textContent : "",
            url: titleElement ? titleElement.href : "",
            excerpt: excerptElement ? excerptElement.textContent : "",
            tags: Array.from(tagsElements).map((tag) => tag.textContent),
            date: dateElement ? dateElement.textContent : "",
            element: null, // No element reference since we're not on homepage
          };
        });
      } catch (error) {
        console.log("Could not load search data:", error);
        searchData = [];
      }
    }
  }

  // Toggle search form
  function toggleSearch() {
    isSearchOpen = !isSearchOpen;

    if (isSearchOpen) {
      searchForm.classList.add("active");
      setTimeout(() => {
        searchInput.focus();
      }, 300);
    } else {
      searchForm.classList.remove("active");
      searchInput.value = "";
      searchResults.innerHTML = "";
      searchResults.classList.remove("has-results");
      // Reset post visibility
      resetPostVisibility();
    }
  }

  // Reset post visibility and filters
  function resetPostVisibility() {
    const posts = document.querySelectorAll(".post-item");
    posts.forEach((post) => {
      post.style.display = "grid";
      post.style.outline = "none";
    });

    // Reset filter tags
    const filterTags = document.querySelectorAll(".filter-tags .tag");
    filterTags.forEach((tag) => tag.classList.remove("active"));
    const allTag =
      document.querySelector('.filter-tags .tag[data-tag="all"]') ||
      document.querySelector(".filter-tags .tag:first-child");
    if (allTag) allTag.classList.add("active");
  }

  // Perform search
  function performSearch(query) {
    if (!query.trim()) {
      searchResults.innerHTML = "";
      searchResults.classList.remove("has-results");
      resetPostVisibility();
      return;
    }

    const searchLower = query.toLowerCase();
    const results = searchData.filter((post) => {
      return (
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    });

    displaySearchResults(results, query);
    highlightSearchResults(results);
  }

  // Display search results
  function displaySearchResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="search-no-results">
          No posts found for "${query}". Try different keywords or browse by tags.
        </div>
      `;
    } else {
      const resultsHTML = results
        .map(
          (post) => `
        <div class="search-result-item" onclick="handleSearchResultClick('${
          post.url
        }')">
          <div class="search-result-title">${highlightText(
            post.title,
            query
          )}</div>
          <div class="search-result-excerpt">${highlightText(
            truncateText(post.excerpt, 120),
            query
          )}</div>
          <div class="search-result-meta">
            <span>${post.date}</span>
            <span>${post.tags.join(", ")}</span>
          </div>
        </div>
      `
        )
        .join("");

      searchResults.innerHTML = resultsHTML;
    }

    searchResults.classList.add("has-results");
  }

  // Handle search result clicks with SPA navigation
  function handleSearchResultClick(url) {
    // Close search first
    toggleSearch();

    // Use SPA navigation if available
    if (window.spa && url.startsWith("/posts/")) {
      const slug = url.split("/posts/")[1].replace("/", "");
      window.spa.showPost(slug, true);
    } else {
      // Fallback to regular navigation
      window.location.href = url;
    }
  }

  // Make handleSearchResultClick globally accessible
  window.handleSearchResultClick = handleSearchResultClick;

  // Highlight search results on page (only works on homepage)
  function highlightSearchResults(results) {
    const posts = document.querySelectorAll(".post-item");

    // Only highlight if we're on a page with post items (homepage)
    if (posts.length > 0) {
      const resultUrls = new Set(results.map((r) => r.url));

      posts.forEach((post) => {
        const titleLink = post.querySelector(".post-title-vaporwave a");
        if (titleLink && resultUrls.has(titleLink.href)) {
          post.style.display = "grid";
          post.style.outline = "2px solid var(--accent-primary)";
        } else {
          post.style.display = "none";
        }
      });
    }
  }

  // Highlight text matches
  function highlightText(text, query) {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
    return text.replace(
      regex,
      '<mark style="background: var(--accent-primary); color: white; padding: 0.1rem 0.2rem; border-radius: 3px;">$1</mark>'
    );
  }

  // Escape regex special characters
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Truncate text
  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + "...";
  }

  // Event listeners for search
  if (searchToggle) {
    loadSearchData();

    searchToggle.addEventListener("click", toggleSearch);
  }

  if (searchClose) {
    searchClose.addEventListener("click", toggleSearch);
  }

  if (searchInput) {
    // Real-time search as user types
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(e.target.value);
      }, 300); // Debounce search
    });

    // Handle Enter key
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        performSearch(searchInput.value);
      }

      // Close search with Escape
      if (e.key === "Escape") {
        toggleSearch();
      }
    });
  }

  if (searchSubmit) {
    searchSubmit.addEventListener("click", () => {
      performSearch(searchInput.value);
    });
  }

  // Close search when clicking outside
  document.addEventListener("click", (e) => {
    if (
      isSearchOpen &&
      !searchForm.contains(e.target) &&
      !searchToggle.contains(e.target)
    ) {
      toggleSearch();
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Theme toggle with 't' key
    if (e.key === "t" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const activeElement = document.activeElement;
      if (
        activeElement.tagName !== "INPUT" &&
        activeElement.tagName !== "TEXTAREA"
      ) {
        if (themeToggle) {
          themeToggle.click();
        }
      }
    }

    // Mute toggle with 'm' key
    if (e.key === "m" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const activeElement = document.activeElement;
      if (
        activeElement.tagName !== "INPUT" &&
        activeElement.tagName !== "TEXTAREA"
      ) {
        if (muteToggle) {
          muteToggle.click();
        }
      }
    }
  });

  // Add loading states for ambient sounds
  function showLoadingState(soundType) {
    const icon = document.querySelector(`[data-sound="${soundType}"]`);
    if (icon) {
      icon.style.opacity = "0.5";
      icon.style.transform = "scale(0.9)";
    }
  }

  function hideLoadingState(soundType) {
    const icon = document.querySelector(`[data-sound="${soundType}"]`);
    if (icon) {
      icon.style.opacity = "";
      icon.style.transform = "";
    }
  }

  // Enhanced audio loading with loading states
  async function loadSoundWithLoading(soundType) {
    if (audioElements[soundType]) {
      return audioElements[soundType];
    }

    showLoadingState(soundType);

    const audio = new Audio(`/audio/${soundType}.mp3`);
    audio.loop = true;
    audio.volume = volumeSlider ? volumeSlider.value : 0.3;

    // Handle loading events
    audio.addEventListener("canplaythrough", () => {
      hideLoadingState(soundType);
    });

    audio.addEventListener("error", () => {
      hideLoadingState(soundType);
      console.log(`Could not load ${soundType} audio file`);
      if (ambientLabel) {
        ambientLabel.textContent = `${sounds[soundType].name} not available`;
      }
    });

    audioElements[soundType] = audio;
    return audio;
  }

  // Fade in/out effects for audio
  function fadeIn(audio, duration = 1000) {
    audio.volume = 0;
    const targetVolume = volumeSlider ? volumeSlider.value : 0.3;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, stepTime);
  }

  function fadeOut(audio, duration = 500) {
    const initialVolume = audio.volume;
    const steps = 10;
    const stepTime = duration / steps;
    const volumeStep = initialVolume / steps;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(initialVolume - volumeStep * currentStep, 0);

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.pause();
      }
    }, stepTime);
  }

  // SPA (Single Page Application) System
  class LofiCodeSPA {
    constructor() {
      this.postsData = [];
      this.pagesData = [];
      this.currentView = "home";
      this.currentPost = null;
      this.currentPage = null;
      this.isLoading = false;
      this.isRealPostPage = false;
      this.isRealPage = false;

      this.init();
    }

    async init() {
      // Check if we're on a real post page (not homepage with SPA)
      this.detectPageType();

      // Load posts and pages data
      await this.loadPostsData();
      await this.loadPagesData();

      // Set up event listeners
      this.setupEventListeners();

      // Handle initial URL
      this.handleInitialRoute();
    }

    detectPageType() {
      // Check if we're on a real post page by looking for post content structure
      const postContent = document.querySelector('.post-layout .post-content .post-body');
      const isPostURL = window.location.pathname.startsWith('/posts/');

      this.isRealPostPage = isPostURL && postContent;

      if (this.isRealPostPage) {
        console.log('📄 Detected real post page, SPA overlay disabled');
        this.currentView = "post";
      }
    }

    async loadPostsData() {
      try {
        const response = await fetch("/index.json");
        if (response.ok) {
          this.postsData = await response.json();
          console.log(
            "📚 Loaded",
            this.postsData.length,
            "posts for SPA navigation"
          );
        } else {
          console.log("Could not load posts data for SPA");
        }
      } catch (error) {
        console.log("Error loading posts data:", error);
      }
    }

    async loadPagesData() {
      try {
        const response = await fetch("/pages.json");
        if (response.ok) {
          this.pagesData = await response.json();
          console.log(
            "📄 Loaded",
            this.pagesData.length,
            "pages for SPA navigation"
          );
        } else {
          console.log("Could not load pages data for SPA");
        }
      } catch (error) {
        console.log("Error loading pages data:", error);
      }
    }

    setupEventListeners() {
      // Only set up SPA navigation if we're not on a real post page
      if (!this.isRealPostPage) {
        // Intercept all internal links
        document.addEventListener("click", (e) => {
          const link = e.target.closest("a");
          if (!link) return;

          const href = link.getAttribute("href");

          // Skip external links, anchors, and special keys
          if (!href || href.startsWith("http") || href.startsWith("#") || e.ctrlKey || e.metaKey) {
            return;
          }

          console.log("🔗 Link clicked:", href, "Link element:", link);

          // Check if it's a post link
          if (href.startsWith("/posts/")) {
            console.log("📝 Intercepting post link:", href);
            e.preventDefault();
            this.navigateToPost(href);
            return;
          }

          // Check if it's a page link - be more specific about which pages to intercept
          // Only intercept links that match our known pages
          const pageUrls = this.pagesData.map(p => p.url);
          const normalizedHref = href.endsWith('/') ? href : href + '/';

          if (pageUrls.includes(normalizedHref) || pageUrls.includes(href)) {
            console.log("📄 Intercepting page link:", href);
            e.preventDefault();
            this.navigateToPage(href);
            return;
          }

          console.log("🔗 Allowing normal navigation for:", href);
        });

        // Handle browser back/forward
        window.addEventListener("popstate", (e) => {
          if (e.state) {
            if (e.state.type === "post") {
              this.showPost(e.state.slug, false);
            } else if (e.state.type === "page") {
              this.showPage(e.state.slug, false);
            } else if (e.state.type === "home") {
              this.showHome(false);
            }
          } else {
            this.showHome(false);
          }
        });

        // Close overlays with Escape key
        document.addEventListener("keydown", (e) => {
          if (e.key === "Escape" && (this.currentView === "post" || this.currentView === "page")) {
            this.showHome();
          }
        });
      } else {
        // On real post pages, add a "back to home" button
        this.addBackToHomeButton();
      }
    }

    addBackToHomeButton() {
      // Check if there's already a back button
      if (document.querySelector('.back-to-home-btn')) return;

      // Create back to home button
      const backButton = document.createElement('button');
      backButton.className = 'back-to-home-btn';
      backButton.innerHTML = '<i class="fas fa-times"></i>';
      backButton.title = 'Back to Home';
      backButton.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 1000;
        background: var(--bg-secondary);
        border: 2px solid var(--accent-primary);
        border-radius: 50%;
        width: 3rem;
        height: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--text-primary);
        font-size: 1.2rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `;

      // Add hover effects
      backButton.addEventListener('mouseenter', () => {
        backButton.style.transform = 'scale(1.1)';
        backButton.style.background = 'var(--accent-primary)';
        backButton.style.color = 'var(--bg-primary)';
      });

      backButton.addEventListener('mouseleave', () => {
        backButton.style.transform = 'scale(1)';
        backButton.style.background = 'var(--bg-secondary)';
        backButton.style.color = 'var(--text-primary)';
      });

      // Navigate to home when clicked
      backButton.addEventListener('click', () => {
        window.location.href = '/';
      });

      document.body.appendChild(backButton);
    }

    handleInitialRoute() {
      // Only handle SPA routing if we're not on a real post page
      if (!this.isRealPostPage) {
        const path = window.location.pathname;
        if (path.startsWith("/posts/")) {
          const slug = path.split("/posts/")[1].replace("/", "");
          if (slug) {
            this.showPost(slug, false);
          }
        }
      }
    }

    navigateToPost(href) {
      const slug = href.split("/posts/")[1].replace("/", "");
      this.showPost(slug, true);
    }

    navigateToPage(href) {
      // Extract page slug from URL (e.g., "/about/" -> "about")
      const slug = href.replace(/^\/|\/$/g, ''); // Remove leading and trailing slashes
      this.showPage(slug, true);
    }

    async showPage(slug, updateHistory = true) {
      if (this.isLoading) return;

      this.isLoading = true;
      this.currentView = "page";

      // Find page data
      let page = this.pagesData.find((p) => {
        const pageSlug = p.url.replace(/^\/|\/$/g, '');
        return pageSlug === slug || p.slug === slug;
      });

      if (!page) {
        console.log("Page not found:", slug);
        console.log("Available pages:", this.pagesData.map(p => ({ slug: p.slug, url: p.url })));
        this.isLoading = false;
        return;
      }

      this.currentPage = page;

      // Update URL if needed
      if (updateHistory) {
        const newUrl = `/${slug}/`;
        history.pushState({ type: "page", slug }, page.title, newUrl);
      }

      // Create and show page overlay
      this.createPageOverlay(page);

      this.isLoading = false;
    }

    createPageOverlay(page) {
      // Remove existing overlay
      const existingOverlay = document.querySelector(".post-overlay");
      if (existingOverlay) {
        existingOverlay.remove();
      }

      // Create overlay
      const overlay = document.createElement("div");
      overlay.className = "post-overlay";

      // Get site title from the main page logo
      const siteTitle = document.querySelector('.logo')?.textContent || 'LofiCode';

      overlay.innerHTML = `
        <div class="post-overlay-backdrop"></div>
        <div class="post-overlay-content">
          <div class="post-overlay-header">
            <div class="post-overlay-title">
              <a href="/" class="overlay-site-title">${siteTitle}</a>
            </div>
            <button class="post-overlay-close" aria-label="Close page">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="post-layout">
            <article class="post-content">
              <header class="post-header">
                <h1 class="post-title">${page.title}</h1>
              </header>
              <div class="post-body">
                ${page.content}
              </div>
            </article>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // Add event listeners
      const closeBtn = overlay.querySelector(".post-overlay-close");
      const backdrop = overlay.querySelector(".post-overlay-backdrop");
      const siteTitleLink = overlay.querySelector(".overlay-site-title");

      closeBtn.addEventListener("click", () => this.showHome());
      backdrop.addEventListener("click", () => this.showHome());

      // Handle site title click in SPA overlay - should close overlay, not reload page
      if (siteTitleLink) {
        siteTitleLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.showHome();
        });
      }

      // Animate in
      requestAnimationFrame(() => {
        overlay.classList.add("active");
      });

      // Re-initialize code highlighting and other features
      setTimeout(() => {
        initializeCodeFences();
        // Re-initialize ambient sound controls for the overlay
        this.initializeOverlayAmbientControls(overlay);
      }, 100);
    }

    async showPost(slug, updateHistory = true) {
      if (this.isLoading) return;

      this.isLoading = true;
      this.currentView = "post";

      // Find post data - try multiple ways to match the slug
      let post = this.postsData.find((p) => p.slug === slug);

      // If not found by slug, try matching by URL
      if (!post) {
        post = this.postsData.find((p) => {
          const urlSlug = p.url.split('/').filter(Boolean).pop();
          return urlSlug === slug;
        });
      }

      // If still not found, try matching by filename
      if (!post) {
        post = this.postsData.find((p) => {
          const filename = p.url.split('/').filter(Boolean).pop();
          return filename === slug || filename === slug + '/';
        });
      }

      if (!post) {
        console.log("Post not found:", slug);
        console.log("Available posts:", this.postsData.map(p => ({ slug: p.slug, url: p.url })));
        this.isLoading = false;
        return;
      }

      this.currentPost = post;

      // Update URL if needed
      if (updateHistory) {
        const newUrl = `/posts/${slug}/`;
        history.pushState({ type: "post", slug }, post.title, newUrl);
      }

      // Create and show post overlay
      this.createPostOverlay(post);

      this.isLoading = false;
    }

    createPostOverlay(post) {
      // Remove existing overlay
      const existingOverlay = document.querySelector(".post-overlay");
      if (existingOverlay) {
        existingOverlay.remove();
      }

      // Find related posts and prev/next navigation
      const relatedPosts = this.findRelatedPosts(post);
      const navigation = this.findPrevNextPosts(post);

      // Create overlay
      const overlay = document.createElement("div");
      overlay.className = "post-overlay";

      // Get site title from the main page logo
      const siteTitle = document.querySelector('.logo')?.textContent || 'LofiCode';

      overlay.innerHTML = `
        <div class="post-overlay-backdrop"></div>
        <div class="post-overlay-content">
          <div class="post-overlay-header">
            <div class="post-overlay-title">
              <a href="/" class="overlay-site-title">${siteTitle}</a>
            </div>
            <button class="post-overlay-close" aria-label="Close post">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="post-layout">
            <article class="post-content">
              <header class="post-header">
                <div class="post-meta">
                  <span class="post-date">${post.dateFormatted}</span>
                  <div class="reading-time-post">
                    <span class="coffee-cups">${"☕".repeat(
                      Math.max(1, Math.min(5, Math.ceil(post.readingTime / 3)))
                    )}</span>
                    <span>${post.readingTime} min read</span>
                  </div>
                </div>
                <h1 class="post-title">${post.title}</h1>
                ${
                  post.subtitle
                    ? `<p class="post-subtitle">${post.subtitle}</p>`
                    : ""
                }
                ${
                  post.tags && post.tags.length > 0
                    ? `
                  <div class="post-tags-header">
                    ${post.tags
                      .map((tag) => `<a href="/tags/${tag.toLowerCase().replace(/\s+/g, '-')}" class="post-tag">${tag}</a>`)
                      .join("")}
                  </div>
                `
                    : ""
                }
              </header>
              <div class="post-body">
                ${post.content}
              </div>

              ${
                relatedPosts.length > 0
                  ? `
                <div class="related-posts">
                  <h3>Related Content</h3>
                  <div class="related-grid">
                    ${relatedPosts
                      .map(
                        (relatedPost) => `
                      <div class="related-post">
                        <h4><a href="${relatedPost.url}" data-spa-link>${
                          relatedPost.title
                        }</a></h4>
                        <div class="related-meta">
                          ${relatedPost.dateFormatted} •
                          ${"☕".repeat(
                            Math.max(1, Math.ceil(relatedPost.readingTime / 3))
                          )} ${relatedPost.readingTime} min read
                        </div>
                      </div>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              `
                  : ""
              }

              ${
                navigation.prev || navigation.next
                  ? `
                <nav class="post-navigation">
                  ${
                    navigation.prev
                      ? `
                    <div class="nav-previous">
                      <span class="nav-label">← Previous</span>
                      <a href="${navigation.prev.url}" data-spa-link class="nav-title">${navigation.prev.title}</a>
                    </div>
                  `
                      : "<div></div>"
                  }
                  ${
                    navigation.next
                      ? `
                    <div class="nav-next">
                      <span class="nav-label">Next →</span>
                      <a href="${navigation.next.url}" data-spa-link class="nav-title">${navigation.next.title}</a>
                    </div>
                  `
                      : "<div></div>"
                  }
                </nav>
              `
                  : ""
              }
            </article>

            <aside class="sidebar">
              <nav class="toc">
                <h4>Contents</h4>
                <div id="toc-content">
                  <!-- TOC will be generated by JavaScript -->
                </div>
              </nav>
            </aside>
          </div>

        </div>
      `;

      document.body.appendChild(overlay);

      // Add event listeners
      const closeBtn = overlay.querySelector(".post-overlay-close");
      const backdrop = overlay.querySelector(".post-overlay-backdrop");
      const siteTitleLink = overlay.querySelector(".overlay-site-title");

      closeBtn.addEventListener("click", () => this.showHome());
      backdrop.addEventListener("click", () => this.showHome());

      // Handle site title click in SPA overlay - should close overlay, not reload page
      if (siteTitleLink) {
        siteTitleLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.showHome();
        });
      }

      // Add SPA navigation for related posts and prev/next links
      const spaLinks = overlay.querySelectorAll("a[data-spa-link]");
      spaLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const href = link.getAttribute("href");
          if (href && href.startsWith("/posts/")) {
            const slug = href.split("/posts/")[1].replace("/", "");
            this.showPost(slug, true);
          }
        });
      });

      // Animate in
      requestAnimationFrame(() => {
        overlay.classList.add("active");
      });

      // Re-initialize code highlighting and other post features
      setTimeout(() => {
        initializeCodeFences();
        this.generateOverlayTOC(overlay);

        // Re-initialize ambient sound controls for the overlay
        this.initializeOverlayAmbientControls(overlay);
      }, 100);
    }

    findRelatedPosts(currentPost) {
      if (!currentPost.tags || currentPost.tags.length === 0) {
        return [];
      }

      // Find posts with matching tags
      const related = this.postsData
        .filter((post) => post.slug !== currentPost.slug) // Exclude current post
        .map((post) => {
          // Calculate relevance score based on shared tags
          const sharedTags = post.tags
            ? post.tags.filter((tag) => currentPost.tags.includes(tag)).length
            : 0;

          return { ...post, relevanceScore: sharedTags };
        })
        .filter((post) => post.relevanceScore > 0) // Only posts with shared tags
        .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
        .slice(0, 3); // Take top 3

      return related;
    }

    findPrevNextPosts(currentPost) {
      // Sort posts by date (newest first)
      const sortedPosts = [...this.postsData].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      const currentIndex = sortedPosts.findIndex(
        (post) => post.slug === currentPost.slug
      );

      return {
        prev: currentIndex > 0 ? sortedPosts[currentIndex - 1] : null,
        next:
          currentIndex < sortedPosts.length - 1
            ? sortedPosts[currentIndex + 1]
            : null,
      };
    }

    initializeOverlayAmbientControls(overlay) {
      // Get ambient controls from the overlay
      const overlayMuteToggle = overlay.querySelector(".mute-toggle");
      const overlayAmbientIcons = overlay.querySelectorAll(".ambient-icon");
      const overlayAmbientLabel = overlay.querySelector(".ambient-label");
      const overlayVolumeSlider = overlay.querySelector(".volume-slider");
      const overlayEqualizer = overlay.querySelector(".equalizer");

      // Sync with current state
      if (overlayMuteToggle && currentSound) {
        const muteIcon = overlayMuteToggle.querySelector("i");
        if (isPlaying) {
          overlayMuteToggle.classList.remove("muted");
          if (muteIcon) muteIcon.className = "fas fa-volume-up";
          overlayMuteToggle.title = "Mute ambient sounds";
          if (overlayEqualizer) overlayEqualizer.classList.remove("muted");
          if (overlayAmbientLabel) overlayAmbientLabel.textContent = `Playing: ${sounds[currentSound].name}`;
        } else {
          overlayMuteToggle.classList.add("muted");
          if (muteIcon) muteIcon.className = "fas fa-volume-mute";
          overlayMuteToggle.title = "Play ambient sounds";
          if (overlayEqualizer) overlayEqualizer.classList.add("muted");
          if (overlayAmbientLabel) overlayAmbientLabel.textContent = `Paused: ${sounds[currentSound].name}`;
        }
      }

      // Sync active sound icon
      if (currentSound) {
        const activeIcon = overlay.querySelector(`[data-sound="${currentSound}"]`);
        if (activeIcon && isPlaying) {
          activeIcon.classList.add("active");
        }
      }

      // Set volume slider to current volume
      if (overlayVolumeSlider && volumeSlider) {
        overlayVolumeSlider.value = volumeSlider.value;
      }

      // Add event listeners for overlay controls
      if (overlayMuteToggle) {
        overlayMuteToggle.addEventListener("click", async () => {
          if (currentSound) {
            const audio = audioElements[currentSound];
            if (audio) {
              if (isPlaying) {
                audio.pause();
                isPlaying = false;
              } else {
                try {
                  await audio.play();
                  isPlaying = true;
                } catch (e) {
                  console.log("Could not play audio:", e);
                }
              }
              updateAmbientState();
              // Update overlay state as well
              this.updateOverlayAmbientState(overlay);
            }
          }
        });
      }

      overlayAmbientIcons.forEach((icon) => {
        icon.addEventListener("click", async () => {
          const soundType = icon.dataset.sound;

          // Stop current sound if playing
          if (currentSound && audioElements[currentSound]) {
            audioElements[currentSound].pause();
            isPlaying = false;
          }

          // Remove active state from all icons (both main and overlay)
          document.querySelectorAll(".ambient-icon").forEach((i) => i.classList.remove("active"));
          overlayAmbientIcons.forEach((i) => i.classList.remove("active"));

          if (currentSound === soundType && !isPlaying) {
            // If clicking the same sound that's paused, play it
            const audio = audioElements[soundType];
            if (audio) {
              try {
                await audio.play();
                isPlaying = true;
                icon.classList.add("active");
                // Also update main page icon if it exists
                const mainIcon = document.querySelector(`[data-sound="${soundType}"]:not(.post-overlay [data-sound="${soundType}"])`);
                if (mainIcon) mainIcon.classList.add("active");
              } catch (e) {
                console.log("Could not play audio:", e);
              }
            }
          } else if (currentSound === soundType && isPlaying) {
            // If clicking the same sound that's playing, stop it
            currentSound = null;
            isPlaying = false;
          } else {
            // Start new sound
            currentSound = soundType;

            try {
              const audio = await loadSound(soundType);
              if (audio) {
                await audio.play();
                isPlaying = true;
                icon.classList.add("active");
                // Also update main page icon if it exists
                const mainIcon = document.querySelector(`[data-sound="${soundType}"]:not(.post-overlay [data-sound="${soundType}"])`);
                if (mainIcon) mainIcon.classList.add("active");
              } else {
                // Audio file not available
                isPlaying = false;
                currentSound = null;
                if (overlayAmbientLabel) {
                  overlayAmbientLabel.textContent = `${sounds[soundType].name} not available`;
                }
              }
            } catch (e) {
              console.log("Could not load or play audio:", e);
              isPlaying = false;
              currentSound = null;
              if (overlayAmbientLabel) {
                overlayAmbientLabel.textContent = `${sounds[soundType].name} not available`;
              }
            }
          }

          updateAmbientState();
          this.updateOverlayAmbientState(overlay);
        });
      });

      if (overlayVolumeSlider) {
        overlayVolumeSlider.addEventListener("input", (e) => {
          const volume = e.target.value;

          // Update volume for all loaded audio elements
          Object.values(audioElements).forEach((audio) => {
            audio.volume = volume;
          });

          // Update main volume slider if it exists
          if (volumeSlider) {
            volumeSlider.value = volume;
          }

          // Visual feedback on equalizer intensity (both main and overlay)
          const allBars = document.querySelectorAll(".equalizer-bar");
          allBars.forEach((bar) => {
            bar.style.opacity = Math.max(0.3, volume);
          });
        });
      }
    }

    updateOverlayAmbientState(overlay) {
      const overlayMuteToggle = overlay.querySelector(".mute-toggle");
      const overlayAmbientLabel = overlay.querySelector(".ambient-label");
      const overlayEqualizer = overlay.querySelector(".equalizer");

      if (!overlayMuteToggle || !overlayAmbientLabel || !overlayEqualizer) return;

      const muteIcon = overlayMuteToggle.querySelector("i");

      if (isPlaying && currentSound) {
        overlayMuteToggle.classList.remove("muted");
        if (muteIcon) {
          muteIcon.className = "fas fa-volume-up";
        }
        overlayMuteToggle.title = "Mute ambient sounds";
        overlayEqualizer.classList.remove("muted");
        overlayAmbientLabel.textContent = `Playing: ${sounds[currentSound].name}`;
      } else {
        overlayMuteToggle.classList.add("muted");
        if (muteIcon) {
          muteIcon.className = "fas fa-volume-mute";
        }
        overlayMuteToggle.title = "Play ambient sounds";
        overlayEqualizer.classList.add("muted");
        if (currentSound) {
          overlayAmbientLabel.textContent = `Paused: ${sounds[currentSound].name}`;
        } else {
          overlayAmbientLabel.textContent = "Click to start ambient sounds";
        }
      }
    }

    generateOverlayTOC(overlay) {
      const tocContent = overlay.querySelector("#toc-content");
      const headings = overlay.querySelectorAll(".post-body h2, .post-body h3");

      if (!tocContent || headings.length === 0) return;

      const tocList = document.createElement("ul");

      headings.forEach((heading, index) => {
        // Add ID to heading if it doesn't have one
        if (!heading.id) {
          heading.id = `heading-${index}`;
        }

        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent;
        a.addEventListener("click", (e) => {
          e.preventDefault();
          // For overlay, we need to scroll within the overlay content
          const overlayContent = overlay.querySelector('.post-overlay-content');
          const overlayHeaderHeight = overlay.querySelector('.post-overlay-header')?.offsetHeight || 60;

          if (overlayContent) {
            const targetPosition = heading.getBoundingClientRect().top + overlayContent.scrollTop - overlayHeaderHeight - 20;
            overlayContent.scrollTo({
              top: targetPosition,
              behavior: "smooth"
            });
          }
        });

        li.appendChild(a);
        tocList.appendChild(li);
      });

      tocContent.appendChild(tocList);

      // Set up scroll listener for overlay TOC highlighting
      const overlayContent = overlay.querySelector('.post-overlay-content');
      if (overlayContent) {
        overlayContent.addEventListener('scroll', () => {
          this.updateOverlayTOC(overlay);
        });
        this.updateOverlayTOC(overlay); // Initial call
      }
    }

    updateOverlayTOC(overlay) {
      const headings = overlay.querySelectorAll(".post-body h2, .post-body h3");
      const tocLinks = overlay.querySelectorAll("#toc-content a");

      if (headings.length === 0 || tocLinks.length === 0) return;

      const overlayContent = overlay.querySelector('.post-overlay-content');
      if (!overlayContent) return;

      let current = 0;
      headings.forEach((heading, i) => {
        const rect = heading.getBoundingClientRect();
        const overlayRect = overlayContent.getBoundingClientRect();
        const relativeTop = rect.top - overlayRect.top;

        if (relativeTop <= 100) {
          current = i;
        }
      });

      tocLinks.forEach((link, i) => {
        link.classList.toggle("active", i === current);
      });
    }

    showHome(updateHistory = true) {
      this.currentView = "home";
      this.currentPost = null;

      // Remove post overlay
      const overlay = document.querySelector(".post-overlay");
      if (overlay) {
        overlay.classList.remove("active");
        setTimeout(() => {
          overlay.remove();
        }, 300);
      }

      // Update URL if needed
      if (updateHistory) {
        history.pushState({ type: "home" }, "LofiCode", "/");
      }
    }
  }

  // Initialize SPA system
  let spa = null;

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      spa = new LofiCodeSPA();
      window.spa = spa; // Make globally accessible
    });
  } else {
    spa = new LofiCodeSPA();
    window.spa = spa; // Make globally accessible
  }

  // Load More Posts functionality
  const loadMoreBtn = document.getElementById('load-more-btn');
  const loadMoreLoading = document.getElementById('load-more-loading');
  const postsContainer = document.getElementById('posts-container');

  if (loadMoreBtn && postsContainer) {
    loadMoreBtn.addEventListener('click', async () => {
      const loaded = parseInt(loadMoreBtn.dataset.loaded);
      const total = parseInt(loadMoreBtn.dataset.total);
      const postsPerPage = 3;

      // Show loading state
      loadMoreBtn.style.display = 'none';
      loadMoreLoading.style.display = 'flex';

      try {
        // Fetch posts data from index.json
        const response = await fetch('/index.json');
        const postsData = await response.json();

        // Get the next batch of posts
        const nextPosts = postsData.slice(loaded, loaded + postsPerPage);

        // Create post elements
        for (const post of nextPosts) {
          const postElement = await createPostElement(post);
          postsContainer.appendChild(postElement);

          // Add a small delay for smooth animation
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Update loaded count
        const newLoaded = loaded + nextPosts.length;
        loadMoreBtn.dataset.loaded = newLoaded;

        // Hide loading state
        loadMoreLoading.style.display = 'none';

        // Show button again if there are more posts
        if (newLoaded < total) {
          loadMoreBtn.style.display = 'flex';
        }

      } catch (error) {
        console.error('Error loading more posts:', error);
        loadMoreLoading.style.display = 'none';
        loadMoreBtn.style.display = 'flex';
        loadMoreBtn.innerHTML = '<span class="load-more-text">Error loading posts</span><span class="load-more-icon">😞</span>';
      }
    });
  }

  // Create post element from post data
  async function createPostElement(post) {
    const postDiv = document.createElement('article');
    postDiv.className = `post-item${post.featured ? ' featured' : ''}`;

    // Calculate coffee cups for reading time (max 5 cups)
    const cupsToShow = Math.min(post.readingTime, 5);
    const coffeeCups = "☕".repeat(cupsToShow);

    // Create mood badge if mood exists
    const moodBadge = post.mood ? `<span class="post-mood">${post.mood}</span>` : '';

    // Create featured badge if featured
    const featuredBadge = post.featured ? '<span class="featured-badge">✨ Featured</span>' : '';

    // Create tags
    const tagsHtml = post.tags && post.tags.length > 0
      ? post.tags.map(tag => `<span class="post-tag-vaporwave">${tag}</span>`).join('')
      : '';

    postDiv.innerHTML = `
      <div class="post-content">
        <div class="post-header-inline">
          <h2 class="post-title-vaporwave">
            <a href="${post.url}">${post.title}</a>
          </h2>
        </div>

        <div class="post-date-with-badges">
          <span class="post-date">${post.dateFormatted}</span>
          ${featuredBadge}
          ${moodBadge}
        </div>

        ${post.subtitle ? `<p class="post-list-subtitle">${post.subtitle}</p>` : ''}

        <p class="post-excerpt-vaporwave">
          ${post.excerpt}
        </p>

        ${tagsHtml ? `<div class="post-tags-vaporwave">${tagsHtml}</div>` : ''}

        <a href="${post.url}" class="continue-reading-vaporwave">
          Read More →
        </a>
      </div>

      <div class="post-meta-sidebar">
        <div class="reading-time-vaporwave">
          <span class="coffee-cups">${coffeeCups}</span>
          <span>${post.readingTime} min</span>
        </div>
      </div>
    `;

    // Add fade-in animation
    postDiv.style.opacity = '0';
    postDiv.style.transform = 'translateY(20px)';

    // Trigger animation after a brief delay
    setTimeout(() => {
      postDiv.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      postDiv.style.opacity = '1';
      postDiv.style.transform = 'translateY(0)';
    }, 50);

    return postDiv;
  }

  // Console easter egg
  console.log(`
    ☕ Welcome to LofiCode! ☕

    You found the console! Here are some keyboard shortcuts:

    't' - Toggle theme (light/dark)
    'm' - Mute/unmute ambient sounds

    Built with love, coffee, and way too many interruptions.
    Happy coding! ✨
    `);
})();
