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
  const sections = document.querySelectorAll("carousel-teasers");

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

        // Carousel Container
        const container = document.createElement("div");
        container.classList.add("carousel-container");

        // Navigation Buttons
        const leftBtn = document.createElement("button");
        leftBtn.classList.add("carousel-btn", "left");
        leftBtn.innerHTML = "&#10094;";

        const rightBtn = document.createElement("button");
        rightBtn.classList.add("carousel-btn", "right");
        rightBtn.innerHTML = "&#10095;";

        // Carousel Track (positioned slides)
        const track = document.createElement("div");
        track.classList.add("carousel-track");

        data.forEach((item, i) => {
          const slide = document.createElement("div");
          slide.classList.add("carousel-slide");
          if (i === 0) slide.classList.add("active");

          slide.innerHTML = `
            <div class="carousel-image" style="background-image: url('${item.image}');" role="img" aria-label="${item.imageAltText}"></div>
            <div class="carousel-content">
              <h3>${item.title}</h3>
              <p>${item.shortDescription}</p>
              <small class="image-credit">${item.imageCredit}</small>
            </div>
          `;
          track.appendChild(slide);
        });

        container.appendChild(leftBtn);
        container.appendChild(track);
        container.appendChild(rightBtn);
        section.appendChild(container);

        // Slide logic
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
