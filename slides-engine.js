(function () {
  const state = {
    activeId: null,
    currentIndex: 0,
    slides: [],
    cache: new Map(),
    manifestMap: new Map()
  };

  function getElements() {
    return {
      overlay: document.getElementById('slideshowOverlay'),
      stage: document.getElementById('slideshowStage'),
      title: document.getElementById('slideshowTitle'),
      counter: document.getElementById('slideshowCounter'),
      prev: document.getElementById('slideshowPrev'),
      next: document.getElementById('slideshowNext'),
      close: document.getElementById('slideshowClose')
    };
  }

  function updateControls() {
    const { counter, prev, next } = getElements();
    const total = state.slides.length;
    const current = state.currentIndex + 1;

    if (counter) {
      counter.textContent = total === 0 ? '0 / 0' : `${current} / ${total}`;
    }

    if (prev) {
      prev.disabled = state.currentIndex <= 0;
    }

    if (next) {
      next.disabled = state.currentIndex >= total - 1;
    }
  }

  function renderCurrentSlide() {
    state.slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === state.currentIndex);
    });

    updateControls();
  }

  function goToSlide(index) {
    if (index < 0 || index >= state.slides.length) {
      return;
    }

    state.currentIndex = index;
    renderCurrentSlide();
  }

  function nextSlide() {
    goToSlide(state.currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(state.currentIndex - 1);
  }

  function closeSlideshow() {
    const { overlay, stage } = getElements();
    if (!overlay || !stage) {
      return;
    }

    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('slideshow-open');

    stage.innerHTML = '';
    state.activeId = null;
    state.currentIndex = 0;
    state.slides = [];
    updateControls();

    // Remove slide-active state from nav links
    document.querySelectorAll('.nav-item[data-slide-id]').forEach(link => {
      link.classList.remove('active');
    });
  }

  function markActiveSlideNav(slideId) {
    document.querySelectorAll('.nav-item[data-slide-id]').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-slide-id') === slideId);
    });
  }

  async function openSlideshow(slideId) {
    const { overlay, stage, title } = getElements();
    if (!overlay || !stage) {
      return;
    }

    // Get parsed slides from cache
    const slideData = window.SLIDES_CACHE && window.SLIDES_CACHE[slideId];
    if (!slideData) {
      throw new Error(`Fant ikke slideshow med id: ${slideId}`);
    }

    // Render slides from parsed Markdown
    stage.innerHTML = '';
    const deck = document.createElement('section');
    deck.className = 'ss-deck';
    deck.setAttribute('data-slideshow-id', slideId);

    // Create article for each slide
    slideData.slides.forEach(slide => {
      const article = document.createElement('article');
      article.className = `slide slide-${slide.type}`;
      article.innerHTML = slide.content;
      deck.appendChild(article);
    });

    stage.appendChild(deck);
    state.activeId = slideId;
    state.currentIndex = 0;
    state.slides = Array.from(stage.querySelectorAll('.slide'));

    if (title) {
      title.textContent = slideData.moduleTitle || 'Slides';
    }

    if (state.slides.length > 0) {
      state.slides.forEach(slide => slide.classList.remove('active'));
      state.slides[0].classList.add('active');
    }

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('slideshow-open');
    markActiveSlideNav(slideId);
    updateControls();
  }

  function onStageClick(event) {
    const actionEl = event.target.closest('[data-slide-back], [data-slide-next], [data-slide-prev]');
    if (!actionEl) {
      return;
    }

    if (actionEl.hasAttribute('data-slide-back')) {
      closeSlideshow();
      return;
    }

    if (actionEl.hasAttribute('data-slide-next')) {
      nextSlide();
      return;
    }

    if (actionEl.hasAttribute('data-slide-prev')) {
      prevSlide();
    }
  }

  function onDocumentKeydown(event) {
    const { overlay } = getElements();
    if (!overlay || !overlay.classList.contains('open')) {
      return;
    }

    if (event.key === 'Escape') {
      closeSlideshow();
      return;
    }

    if (event.key === 'ArrowRight') {
      nextSlide();
      return;
    }

    if (event.key === 'ArrowLeft') {
      prevSlide();
    }
  }

  function attachEvents() {
    const { stage, prev, next, close, overlay } = getElements();

    if (stage) {
      stage.addEventListener('click', onStageClick);
    }

    if (prev) {
      prev.addEventListener('click', () => prevSlide());
    }

    if (next) {
      next.addEventListener('click', () => nextSlide());
    }

    if (close) {
      close.addEventListener('click', () => closeSlideshow());
    }

    if (overlay) {
      overlay.addEventListener('click', event => {
        if (event.target === overlay) {
          closeSlideshow();
        }
      });
    }

    document.addEventListener('keydown', onDocumentKeydown);
  }

  function attachNavHook() {
    document.addEventListener('click', event => {
      const link = event.target.closest('.nav-item[data-slide-id]');
      if (!link) {
        return;
      }

      event.preventDefault();
      const slideId = link.getAttribute('data-slide-id');
      if (!slideId) {
        return;
      }

      openSlideshow(slideId).catch(error => {
        console.error('Kunne ikke åpne slideshow:', error);
      });
    });
  }

  async function initializeSlidesEngine() {
    if (window.SLIDES_READY) {
      const cache = await window.SLIDES_READY;
      // Build manifest map from cache
      state.manifestMap = new Map(
        Object.values(cache || {}).map(slideData => [
          slideData.moduleId,
          { id: slideData.moduleId, title: slideData.moduleTitle }
        ])
      );
    }

    attachEvents();
    attachNavHook();
  }

  window.SlidesEngine = {
    initialize: initializeSlidesEngine,
    open: openSlideshow,
    close: closeSlideshow,
    next: nextSlide,
    prev: prevSlide
  };
})();
