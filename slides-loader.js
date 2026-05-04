(function () {
  async function loadSlidesManifest() {
    const response = await fetch('slides/manifest.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Kunne ikke laste slides/manifest.json: ${response.status}`);
    }
    return response.json();
  }

  async function parseSlideHTML(htmlText) {
    // Create a temporary container and parse the HTML
    const container = document.createElement('div');
    container.innerHTML = htmlText;
    
    // Extract the slides container
    const slidesDiv = container.querySelector('.slides');
    if (!slidesDiv) {
      throw new Error('No .slides div found in HTML');
    }

    // Extract metadata from data attributes
    const moduleId = slidesDiv.getAttribute('data-module-id');
    const moduleTitle = slidesDiv.getAttribute('data-module-title');

    // Extract individual slides
    const slides = [];
    const slideElements = slidesDiv.querySelectorAll('.slide');
    
    slideElements.forEach(slideEl => {
      slides.push({
        type: slideEl.getAttribute('data-slide-type') || 'content',
        content: slideEl.innerHTML
      });
    });

    return {
      moduleId,
      moduleTitle,
      slides
    };
  }

  async function initSlides() {
    try {
      const manifest = await loadSlidesManifest();
      window.SLIDES_CACHE = {};

      // Load and parse each slideshow HTML file
      for (const entry of manifest) {
        const response = await fetch(entry.file, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Kunne ikke laste ${entry.file}: ${response.status}`);
        }
        const htmlText = await response.text();
        const parsed = await parseSlideHTML(htmlText);
        window.SLIDES_CACHE[entry.id] = parsed;
      }

      return window.SLIDES_CACHE;
    } catch (err) {
      console.error('Error loading slides:', err);
      return {};
    }
  }

  window.SLIDES_MANIFEST = [];
  window.SLIDES_READY = initSlides().then(cache => {
    window.SLIDES_MANIFEST = Object.entries(cache).map(([id, data]) => ({
      id,
      title: data.moduleTitle
    }));
    return cache;
  });
})();
