class HeaderComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header>
        <h1>Taniti Island</h1>
        <div class="nav-container">
          <nav id="navbar">
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="entertainment.html">Entertainment And Events</a></li>
              <li><a href="lodging.html">Accommodations</a></li>
              <li><a href="dining.html">Dining</a></li>
              <li><a href="attractions.html">Sites to See</a></li>
              <li><a href="resources.html">Travel Resources</a></li>
            </ul>
          </nav>
          <form id="searchForm">
            <input type="text" id="searchInput" placeholder="Search..." required />
            <button type="submit">Search</button>
          </form>
        </div>
      </header>
    `;

    this.querySelector("#searchForm").addEventListener(
      "submit",
      function (event) {
        event.preventDefault();
        const query = document.getElementById("searchInput").value.trim();
        if (query) {
          window.location.href = `search-results.html?query=${encodeURIComponent(
            query
          )}`;
        }
      }
    );
  }
}

customElements.define("site-header", HeaderComponent);

class FooterComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer>
        <nav>
          <ul>
            <li><a href="lodging.html">Lodging</a></li>
            <li><a href="dining.html">Dining</a></li>
            <li><a href="attractions.html">Attractions</a></li>
            <li><a href="entertainment.html">Entertainment And Events</a></li>
            <li><a href="details.html?src=resources&title=Travel%20to%20Taniti">Airfare</a></li>
            <li><a href="details.html?src=resources&title=Getting%20Around%20Taniti">Transportation</a></li>
            <li><a href="resources.html">Common Questions</a></li>
            <li><a href="details.html?src=resources&title=Frequently%20Asked%20Questions">Contact</a></li>
          </ul>
        </nav>
        <p>&copy; 2025 Taniti Tourism Authority. All rights reserved.</p>
      </footer>
    `;
  }
}
customElements.define("site-footer", FooterComponent);

class HeroBanner extends HTMLElement {
  async connectedCallback() {
    const dataSrc = this.dataset.src;
    const dataTitle = this.dataset.title;
    if (!dataSrc || !dataTitle) {
      console.log("AboutSection: Missing 'src' or 'title' data attributes.");
      return;
    }

    try {
      const res = await fetch(dataSrc);
      const data = await res.json();
      const matchedItem = data.find((item) => item.title === dataTitle);
      if (!matchedItem) {
        console.log(
          `AboutSection: No matching item found for title "${dataTitle}".`
        );
        return;
      }

      this.innerHTML = `
      <section class="hero-banner" style="background-image: url(${matchedItem.image});">
        <div class="hero-content">
          <h2 id="hero-title">${matchedItem.heroTitle}</h2>
          <p id="hero-text">${matchedItem.heroText}</p>
        </div>
      </section>
    `;
    } catch (err) {
      console.error("HeroBanner: Error rendering hero banner:", err);
    }
  }
}
customElements.define("hero-banner", HeroBanner);

class AboutSection extends HTMLElement {
  async connectedCallback() {
    const dataSrc = this.dataset.src;
    const dataTitle = this.dataset.title;
    if (!dataSrc || !dataTitle) {
      console.log("AboutSection: Missing 'src' or 'title' data attributes.");
      return;
    }

    try {
      const res = await fetch(dataSrc);
      const data = await res.json();
      const matchedItem = data.find((item) => item.title === dataTitle);
      if (!matchedItem) {
        console.log(
          `AboutSection: No matching item found for title "${dataTitle}".`
        );
        return;
      }

      this.innerHTML = ""; // Clear any previous content

      const titleEl = document.createElement("h2");
      titleEl.textContent = matchedItem.title;
      this.appendChild(titleEl);
      const details = matchedItem.details;
      if (Array.isArray(details)) {
        details.forEach((paraText) => {
          const para = document.createElement("p");
          para.innerHTML = paraText; // If you're inserting plain text
          this.appendChild(para);
        });
      } else if (typeof details === "string") {
        const para = document.createElement("p");
        para.innerHTML = details;
        this.appendChild(para);
      } else {
        console.log(
          `AboutSection: 'details' is not an array or a string in the data.`
        );
      }
    } catch (err) {
      console.error(
        `AboutSection: Failed to load about section from ${dataSrc}:`,
        err
      );
    }
  }
}

customElements.define("about-section", AboutSection);

class SearchResultTeaser extends HTMLElement {
  async connectedCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get("query")?.toLowerCase();

    if (!searchQuery) {
      console.error(
        "SearchResultTeaser: Missing 'query' parameter in the URL."
      );
      this.innerHTML = `<p>No search query provided.</p>`;
      return;
    }

    const reversePageTitleMap = Object.fromEntries(
      Object.entries(pageTitleMap).map(([file, title]) => [
        title,
        file.replace(".html", ""),
      ])
    );

    let jsonFiles = [];
    try {
      const indexRes = await fetch("data/index.json");
      jsonFiles = await indexRes.json();
    } catch (err) {
      console.error("SearchResultTeaser: Failed to load index.json", err);
      return;
    }

    const matches = [];

    for (const file of jsonFiles) {
      try {
        const res = await fetch(`data/${file}`);
        const items = await res.json();
        items.forEach((item) => {
          if (
            item.title?.toLowerCase().includes(searchQuery) ||
            item.shortDescription?.toLowerCase().includes(searchQuery) ||
            (item.details &&
              item.details.some((detail) =>
                detail.toLowerCase().includes(searchQuery)
              ))
          ) {
            matches.push({ ...item, src: `data/${file}` });
          }
        });
      } catch (err) {
        console.error(`SearchResultTeaser: Error fetching ${file}:`, err);
      }
    }

    if (matches.length === 0) {
      this.innerHTML = `<p>No results found for "${searchQuery}".</p>`;
      return;
    }

    const header = document.createElement("h2");
    header.textContent = `Search Results for "${searchQuery}"`;
    this.appendChild(header);

    matches.forEach((item) => {
      const teaserWrapper = document.createElement("div");
      teaserWrapper.classList.add("teaser", "teaser-left");
      let mainSrc =""
      let srcParam = encodeURIComponent(
        item.src.replace(/^data\//, "").replace(/\.json$/, "")
      );

      // Special handling for main-details.json matches
      if (
        item.src.includes("main-details.json") &&
        reversePageTitleMap[item.title]
      ) {
        mainSrc = encodeURIComponent(reversePageTitleMap[item.title]);
      }

      const titleParam = encodeURIComponent(item.title);

      teaserWrapper.innerHTML = `
        <img class="teaser-image" src="${item.image}" title="${
        item.imageTitle || ""
      }" alt="${item.imageAltText || ""}" />
        <div class="teaser-text">
          <h3>${item.title}</h3>
          <p>${item.shortDescription}</p>
          ${
            mainSrc
              ? `<a href="${mainSrc}"`
              : `<a href="details.html?src=${srcParam}&title=${titleParam}">Read More</a>`
          }
          
          ${
            item.imageCredit
              ? `<p class="image-credit">Image Credit: ${item.imageCredit}</p>`
              : ""
          }
        </div>
      `;

      this.appendChild(teaserWrapper);
    });
  }
}

customElements.define("search-result-teaser", SearchResultTeaser);

class TeaserSection extends HTMLElement {
  async connectedCallback() {
    const jsonPath = this.dataset.src;
    const headerText = this.dataset.header;
    if (!jsonPath || !headerText) {
      console.log("TeaserSection: Missing 'src' or 'header' data attributes.");
      return;
    }

    const header = document.createElement("h2");
    header.textContent = headerText;
    this.appendChild(header);

    try {
      const res = await fetch(jsonPath);
      const items = await res.json();

      if (items.length === 0) {
        console.log("TeaserSection: No items found in the provided JSON.");
      }

      items.forEach((item, index) => {
        const teaserWrapper = document.createElement("div");
        teaserWrapper.classList.add(
          "teaser",
          index % 2 === 0 ? "teaser-left" : "teaser-right"
        );
        const srcParam = encodeURIComponent(
          jsonPath.replace(/^data\//, "").replace(/\.json$/, "")
        );
        const titleParam = encodeURIComponent(item.title);
        teaserWrapper.innerHTML = `
          <img class="teaser-image" src="${item.image}" title="${
          item.imageTitle || ""
        }" alt="${item.imageAltText || ""}" />
          <div>
            <h3>${item.title}</h3>
            <p>${item.shortDescription}</p>
            <a href="details.html?src=${srcParam}&title=${titleParam}">Read More</a>
           ${
             item.imageCredit
               ? `<p class="image-credit">Image Credit: ${item.imageCredit}</p>`
               : ""
           }
          </div>
        `;
        this.appendChild(teaserWrapper);
      });
    } catch (err) {
      console.error("TeaserSection: Error rendering teaser section:", err);
    }
  }
}
customElements.define("teaser-section", TeaserSection);

class CarouselTeasers extends HTMLElement {
  async connectedCallback() {
    const dataSrc = this.dataset.src;
    const headerText = this.dataset.header;
    if (!dataSrc || !headerText) {
      console.log(
        "CarouselTeasers: Missing 'src' or 'header' data attributes."
      );
      return;
    }

    try {
      const res = await fetch(dataSrc);
      const data = await res.json();

      if (data.length === 0) {
        console.log("CarouselTeasers: No data found in the provided JSON.");
      }

      const header = document.createElement("h2");
      header.textContent = headerText;
      this.appendChild(header);

      const container = document.createElement("div");
      container.classList.add("carousel-container");

      const leftBtn = document.createElement("button");
      leftBtn.classList.add("carousel-btn", "left");
      leftBtn.innerHTML = "&#10094;";

      const rightBtn = document.createElement("button");
      rightBtn.classList.add("carousel-btn", "right");
      rightBtn.innerHTML = "&#10095;";

      const track = document.createElement("div");
      track.classList.add("carousel-track");

      data.forEach((item, i) => {
        const slide = document.createElement("div");
        slide.classList.add("carousel-slide");
        if (i === 0) slide.classList.add("active");

        const srcParam = encodeURIComponent(
          dataSrc.replace(/^data\//, "").replace(/\.json$/, "")
        );
        const titleParam = encodeURIComponent(item.title);
        slide.innerHTML = `
          <div class="carousel-image" style="background-image: url('${item.image}');" role="img" aria-label="${item.imageAltText}"></div>
          <div class="carousel-content">
            <h3>${item.title}</h3>
            <p>${item.shortDescription}</p>
            <a href="details.html?src=${srcParam}&title=${titleParam}">Read More</a>
            <small class="image-credit">${item.imageCredit}</small>
          </div>
        `;
        track.appendChild(slide);
      });

      container.appendChild(leftBtn);
      container.appendChild(track);
      container.appendChild(rightBtn);
      this.appendChild(container);

      let currentIndex = 0;
      const slides = track.querySelectorAll(".carousel-slide");

      const showSlide = (index) => {
        slides.forEach((slide, i) => {
          slide.classList.toggle("active", i === index);
        });
      };

      leftBtn.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
      });

      rightBtn.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
      });
    } catch (err) {
      console.error(
        `CarouselTeasers: Failed to load carousel data from ${dataSrc}:`,
        err
      );
    }
  }
}
customElements.define("carousel-teasers", CarouselTeasers);

class GalleryTeaser extends HTMLElement {
  async connectedCallback() {
    const dataSrc = this.dataset.src;
    const headerText = this.dataset.header;
    const visibleCount = parseInt(this.dataset.visible) || 3; // default to 3 if not set
    if (!dataSrc || !headerText) {
      console.log("GalleryTeaser: Missing 'src' or 'header' data attributes.");
      return;
    }

    try {
      const res = await fetch(dataSrc);
      const data = await res.json();

      if (data.length === 0) {
        console.log("GalleryTeaser: No data found in the provided JSON.");
      }

      const header = document.createElement("h2");
      header.textContent = headerText;
      this.appendChild(header);

      const container = document.createElement("div");
      container.classList.add("gallery-container");

      const leftBtn = document.createElement("button");
      leftBtn.classList.add("gallery-btn", "left");
      leftBtn.innerHTML = "&#10094;";

      const rightBtn = document.createElement("button");
      rightBtn.classList.add("gallery-btn", "right");
      rightBtn.innerHTML = "&#10095;";

      const track = document.createElement("div");
      track.classList.add("gallery-track");

      data.forEach((item) => {
        const card = document.createElement("div");
        card.classList.add("gallery-card");

        const srcParam = encodeURIComponent(
          dataSrc.replace(/^data\//, "").replace(/\.json$/, "")
        );
        const titleParam = encodeURIComponent(item.title);

        card.innerHTML = `
          <div class="gallery-image" style="background-image: url('${
            item.image
          }');" role="img" aria-label="${item.imageAltText}"></div>
          <div class="gallery-content">
            <h3>${item.title}</h3>
            <p>${item.shortDescription}</p>
            <a href="details.html?src=${srcParam}&title=${titleParam}">Read More</a>
            <small class="image-credit">${item.imageCredit || ""}</small>
          </div>
        `;
        track.appendChild(card);
      });

      if (data.length <= visibleCount) {
        leftBtn.style.display = "none";
        rightBtn.style.display = "none";
      }
      container.appendChild(leftBtn);
      container.appendChild(track);
      container.appendChild(rightBtn);
      this.appendChild(container);

      // Sliding behavior
      let currentIndex = 0;
      const cards = track.querySelectorAll(".gallery-card");

      const showCards = (index) => {
        const cardWidth = cards[0]?.offsetWidth || 0;
        track.style.transform = `translateX(-${index * cardWidth}px)`;
      };

      leftBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
          currentIndex--;
        } else {
          currentIndex = cards.length - visibleCount;
          if (currentIndex < 0) currentIndex = 0;
        }
        showCards(currentIndex);
      });

      rightBtn.addEventListener("click", () => {
        if (currentIndex < cards.length - visibleCount) {
          currentIndex++;
        } else {
          currentIndex = 0;
        }
        showCards(currentIndex);
      });

      // Initial layout setup
      const updateLayout = () => {
        track.style.display = "flex";
        track.style.transition = "transform 0.5s ease";
        cards.forEach((card) => {
          card.style.flex = `0 0 calc(100% / ${visibleCount})`;
          card.style.boxSizing = "border-box";
        });
      };

      window.addEventListener("resize", updateLayout);
      updateLayout();
    } catch (err) {
      console.error(
        `GalleryTeaser: Failed to load gallery data from ${dataSrc}:`,
        err
      );
    }
  }
}
customElements.define("gallery-teaser", GalleryTeaser);

// Filling functions
function build_top_display(src, title) {
  if (src && title) {
    const main = document.querySelector("main");

    const hero = document.createElement("hero-banner");
    hero.setAttribute("data-src", `data/${src}.json`);
    hero.setAttribute("data-title", title);

    const about = document.createElement("about-section");
    about.setAttribute("data-src", `data/${src}.json`);
    about.setAttribute("data-title", title);

    main.prepend(hero);
    hero.after(about);
  } else {
    // Handle missing params
    document.getElementById("mainContent").innerHTML =
      "<p>Error: Missing 'src' or 'title' parameters in the URL.</p>";
  }
}
function build_bottom_display() {
  const main = document.querySelector("main");

  const travelGal = document.createElement("gallery-teaser");
  travelGal.setAttribute("data-src", `data/resources.json`);
  travelGal.setAttribute("data-header", "Additional Resources");

  main.appendChild(travelGal);
}
const pageTitleMap = {
  "index.html": "Discover Taniti",
  "lodging.html": "Taniti Accommodations",
  "dining.html": "Experience Fine Dining",
  "attractions.html": "Sites to See",
  "entertainment.html": "Entertainment And Events",
  "resources.html": "Useful Resources",
};

function getParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const src = urlParams.get("src") || "main-details";
  const title =
    urlParams.get("title") ||
    pageTitleMap[window.location.pathname.split("/").pop()] ||
    "Discover Taniti";
  return { src, title };
}
