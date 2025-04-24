async function fetchHeader() {
  fetch("components/header.html")
    .then((res) => res.text())
    .then((data) => {
      const headerContainer = document.getElementById("header-container");
      if (!headerContainer) {
        console.log("Missing Header Container");
      }
      document.getElementById("header-container").innerHTML = data;
    });
}
async function fetchHero() {
  fetch("components/hero.html")
    .then((res) => res.text())
    .then((heroHTML) => {
      const container = document.getElementById("hero-container");
      container.innerHTML = heroHTML;

      // Set content and background after insertion
      const hero = container.querySelector(".hero-banner");
      const title = container.querySelector("#hero-title");
      const text = container.querySelector("#hero-text");

      const { heroImage, heroTitle, heroText } = document.body.dataset;

      hero.style.backgroundImage = `url('${heroImage}')`;
      title.textContent = heroTitle;
      text.textContent = heroText;
    });
}
async function renderAllTeaserSections() {
  const sections = document.querySelectorAll("section.teasers[data-src]");

  for (const section of sections) {
    const jsonPath = section.dataset.src;
    const headerText = section.dataset.header;
    const header = document.createElement("h2");
    header.innerText = headerText;
    section.appendChild(header);
    try {
      const res = await fetch(jsonPath);
      if (!res.ok)
        throw new Error(`Failed to fetch ${jsonPath}: ${res.statusText}`);

      const events = await res.json();

      events.forEach((event, index) => {
        const teaserWrapper = document.createElement("div");
        teaserWrapper.classList.add(
          index % 2 === 0 ? "teaser-left" : "teaser-right"
        );
        teaserWrapper.classList.add("teaser");

        teaserWrapper.innerHTML = `
            <img 
              class="teaser-image" 
              src="${event.image}" 
              title="${event.imageTitle || ""}" 
              alt="${event.imageAltText || ""}" 
            />
            <div>
              <h3>${event.title}</h3>
              <p>${event.shortDescription}</p>
              <a href="#" onclick="alert(\`${
                event.longDescription
              }\`); return false;">Read More</a>
              ${
                event.imageCredit
                  ? `<p class="image-credit">Image Credit: ${event.imageCredit}</p>`
                  : ""
              }
            </div>
          `;

        section.appendChild(teaserWrapper);
      });
    } catch (err) {
      console.error("Error rendering teaser section:", err);
    }
  }
}
async function renderAllCarousels() {
  const sections = document.querySelectorAll(".carousel-teaser");

  sections.forEach((section) => {
    const dataSrc = section.dataset.src;
    const headerText = section.dataset.header || "Explore Taniti";

    if (!dataSrc) return;

    fetch(dataSrc)
      .then((res) => res.json())
      .then((data) => {
        // Header
        const header = document.createElement("h2");
        header.textContent = headerText;
        section.appendChild(header);

        // Carousel Wrapper
        const wrapper = document.createElement("div");
        wrapper.classList.add("carousel-wrapper");

        data.forEach((item) => {
          const slide = document.createElement("div");
          slide.classList.add("carousel-slide");

          slide.innerHTML = `
            <div class="carousel-image" style="background-image: url('${item.image}');" role="img" aria-label="${item.imageAltText}"></div>
            <div class="carousel-content">
              <h3>${item.name}</h3>
              <p>${item.shortDescription}</p>
              <small class="image-credit">${item.imageCredit}</small>
            </div>
          `;

          wrapper.appendChild(slide);
        });

        section.appendChild(wrapper);
      })
      .catch((err) => {
        console.error(`Failed to load carousel data from ${dataSrc}:`, err);
      });
  });
}

async function fetchfooter() {
  fetch("components/footer.html")
    .then((res) => res.text())
    .then((data) => {
      const headerContainer = document.getElementById("header-container");
      if (!headerContainer) {
        console.log("Missing Header Container");
      }
      document.getElementById("footer-container").innerHTML = data;
    });
}

// Call the function after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  fetchHeader();
  fetchHero();
  renderAllTeaserSections();
  renderAllCarousels();
  fetchfooter();
});
