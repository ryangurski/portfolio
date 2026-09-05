document.addEventListener('DOMContentLoaded', () => {

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  const grainContainer = document.getElementById("grain-container");
  const body = document.body;
  const page = window.location.pathname.split("/").pop() || "index.html";
  const scrollablePages = new Set(["index2.html", "index3.html"]);

  body.classList.toggle("homepage", page === "index.html");
  body.style.minHeight = page === "index2.html" ? "230vh" : scrollablePages.has(page) ? "150vh" : "100vh";
  body.style.overflow = scrollablePages.has(page) ? "auto" : "hidden";
  body.style.overflowX = "hidden";
  
  setupReadMoreButtons();
  setupMenuButton();
  setupIntroButtons(page);
  setupVideoNavigation();
  
  grainContainer.style.opacity = "0.1";
  generateInitialGrains();
  
  requestAnimationFrame(() => {
    adjustPageLayout();
    adjustPageHeight(); 
    
    setTimeout(() => {
      grainContainer.style.transition = "opacity 1s ease-in-out";
      grainContainer.style.opacity = "1";
    
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          startDeferredDecorations();
        });
      } else {
        setTimeout(() => {
          startDeferredDecorations();
        }, 500);
      }
    }, 100);
  });

  window.addEventListener('load', adjustPageHeight, { once: true });
  document.querySelectorAll('img, iframe').forEach(element => {
    element.addEventListener('load', schedulePageHeight, { once: true });
  });
  document.querySelectorAll('details').forEach(details => {
    details.addEventListener('toggle', schedulePageHeight);
  });

  const pageHeightObserver = new MutationObserver(records => {
    if (records.some(record => {
      return record.target !== document.body && !grainContainer.contains(record.target);
    })) {
      schedulePageHeight();
    }
  });
  pageHeightObserver.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'open']
  });
  
  let resizeTimeout;
  let resizeFrame;
  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;
  let wasMobile = window.innerWidth <= 768;
  let grainGeneration = 0;
  let remainingGrainTimeout;
  
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile !== wasMobile) {
        body.style.minHeight = '';
        wasMobile = isMobile;
      }
      adjustPageLayout();
      schedulePageHeight();
    });

    if (resizeTimeout) clearTimeout(resizeTimeout);
    
    resizeTimeout = setTimeout(() => {
      const widthChange = Math.abs(window.innerWidth - lastWidth) / lastWidth;
      const heightChange = Math.abs(window.innerHeight - lastHeight) / lastHeight;
      
      if (widthChange > 0.15 || heightChange > 0.15) {
        lastWidth = window.innerWidth;
        lastHeight = window.innerHeight;
        grainGeneration += 1;
        clearTimeout(remainingGrainTimeout);
        grainContainer.replaceChildren();
        
        generateInitialGrains();
        setTimeout(() => {
          generateRemainingGrains();
        }, 300);
      }
    }, 150); 
  });
  
  function animateLogo(page) {
    const logo = document.querySelector(".logo");
    
    if (logo && /index\d*\.html$/.test(page)) {
      logo.classList.remove("logo-spin");
      void logo.offsetWidth;
      logo.classList.add("logo-spin");
      
      setTimeout(() => {
        logo.classList.remove("logo-spin");
      }, 1000);
    }

  }

  function startDeferredDecorations() {
    generateRemainingGrains();
    animateLogo(page);
  }
  
  function generateInitialGrains() {
    const fragment = document.createDocumentFragment();
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const viewportWidth = window.visualViewport?.width || window.innerWidth;

    const initialCount = Math.min(150, Math.floor((viewportWidth * viewportHeight) / 8000)); 

    for (let i = 0; i < initialCount; i++) {
      const grain = createGrain(viewportWidth, viewportHeight);
      fragment.appendChild(grain);
    }

    grainContainer.appendChild(fragment);

    requestAnimationFrame(() => {
      grainContainer.querySelectorAll('.grain').forEach(grain => animateGrain(grain, true));
    });
  }

  function generateRemainingGrains() {
    // Keep the decorative layer lightweight on smaller or slower devices.
    const numGrains = Math.min(300, Math.max(120, Math.round(window.innerWidth / 4)));
    const currentGrains = grainContainer.querySelectorAll('.grain').length;
    const remainingGrains = numGrains - currentGrains;
    const generation = grainGeneration;

    if (remainingGrains <= 0) return;

    const pageHeight = Math.max(
      body.scrollHeight,
      document.documentElement.scrollHeight
    );

    const batchSize = 50;
    const batches = Math.ceil(remainingGrains / batchSize);

    function createBatch(batchIndex) {
      if (batchIndex >= batches || generation !== grainGeneration) return;

      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, remainingGrains);
      const localFragment = document.createDocumentFragment();
      const newGrains = [];

      for (let i = start; i < end; i++) {
        const grain = createGrain(window.innerWidth, pageHeight);
        localFragment.appendChild(grain);
        newGrains.push(grain);
      }

      grainContainer.appendChild(localFragment);

      requestAnimationFrame(() => {
        newGrains.forEach(grain => animateGrain(grain, false, generation));
      });

      if (batchIndex + 1 < batches) {
        remainingGrainTimeout = setTimeout(() => createBatch(batchIndex + 1), 100);
      }
    }

    createBatch(0);
  }

  function createGrain(width, height) {
    const grain = document.createElement("div");
    grain.classList.add("grain");

    const randomX = Math.random() * width;
    const randomY = Math.random() * height;

    grain.style.left = `${randomX}px`;
    grain.style.top = `${randomY}px`;
    grain.style.opacity = "0.8"; 
    return grain;
  }

  function animateGrain(grain, isInitial = false, generation = grainGeneration) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function move() {
      if (generation !== grainGeneration || !grain.isConnected) return;

      const factor = isInitial ? 0.3 : 1.0;
      const randomX = (Math.random() - 0.5) * 30 * factor; 
      const randomY = (Math.random() - 0.5) * 30 * factor;

      grain.style.transform = `translate(${randomX}px, ${randomY}px)`;

      setTimeout(() => requestAnimationFrame(move), 800 + Math.random() * 1200); 
    }
    requestAnimationFrame(move);
  }

  function adjustPageHeight() {
    const bottomGap = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--page-bottom-gap')
    ) || 32;
    const visibleElements = [...document.body.querySelectorAll('*')].filter(element => {
      if (element === grainContainer || element.getBoundingClientRect().width === 0) return false;

      let ancestor = element;
      while (ancestor && ancestor !== document.body) {
        const styles = window.getComputedStyle(ancestor);
        if (styles.display === 'none' || styles.visibility === 'hidden' || styles.position === 'fixed') {
          return false;
        }
        ancestor = ancestor.parentElement;
      }

      return true;
    });
    const maxBottom = visibleElements.reduce((bottom, element) => {
      return Math.max(bottom, element.getBoundingClientRect().bottom + window.scrollY);
    }, 0);

    if (maxBottom === 0) return;

    const neededHeight = maxBottom + bottomGap;
    document.body.style.minHeight = `${Math.max(neededHeight, window.innerHeight)}px`;
  }

  let pageHeightFrame;
  function schedulePageHeight() {
    cancelAnimationFrame(pageHeightFrame);
    pageHeightFrame = requestAnimationFrame(adjustPageHeight);
  }
  
  function adjustElementPosition(selector) {
    const element = document.querySelector(selector);
    if (!element) return;

    if (window.innerWidth <= 768) {
      element.style.removeProperty('top');
      return;
    }

    const stripedTop = document.querySelector('.striped-top');
    if (!stripedTop) return;
    
    const stripedHeight = stripedTop.offsetHeight;
    element.style.top = `${stripedHeight + 20 * (stripedHeight / 100)}px`;
  }
  
  function centerElements() {
    const elements = ['.logo', '#videos-top', '#about-top'];
    const stripedTop = document.querySelector('.striped-top');
    if (!stripedTop) return;
    
    const stripedTopHeight = stripedTop.offsetHeight;
    
    elements.forEach(selector => {
      const element = document.querySelector(selector);
      if (!element) return;
      
      const elementHeight = element.offsetHeight;
      element.style.position = 'absolute';
      element.style.top = `${(stripedTopHeight - elementHeight) / 2}px`;
    });
  }
  
  function lockTextToStripes() {
    const stripe = document.querySelector('.background-stripes');
    const videosText = document.querySelector('#videos');
    const aboutText = document.querySelector('#about');
    if (!stripe || !videosText || !aboutText) return;
    
    const stripeRect = stripe.getBoundingClientRect();
    const windowWidth = window.innerWidth;

    videosText.style.left = `${stripeRect.left + stripeRect.width * 0.2}px`;
    videosText.style.top = `${stripeRect.top + stripeRect.height * 0.75}px`;
    aboutText.style.right = `${windowWidth - (stripeRect.left + stripeRect.width * 0.79)}px`;
    aboutText.style.top = `${stripeRect.top + stripeRect.height * 0.75}px`;
  }
  
  function setupMenuButton() {
    const menuButton = document.getElementById("menuButton");
    const menuItems = document.getElementById("menuItems");
    
    if (menuButton && menuItems) {
      const setMenuOpen = isOpen => {
        menuButton.classList.toggle("open", isOpen);
        menuItems.classList.toggle("open", isOpen);
        menuItems.style.opacity = isOpen ? "1" : "0";
        menuItems.style.pointerEvents = isOpen ? "auto" : "none";
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", `${isOpen ? "Close" : "Open"} navigation menu`);
      };

      menuItems.querySelectorAll("a").forEach(link => {
        const linkPage = new URL(link.href, window.location.href).pathname.split("/").pop() || "index.html";
        if (linkPage === page) {
          link.setAttribute("aria-current", "page");
        }
        link.addEventListener("click", () => setMenuOpen(false));
      });

      menuButton.addEventListener("click", () => {
        setMenuOpen(!menuButton.classList.contains("open"));
      });

      document.addEventListener("click", event => {
        if (!menuButton.parentElement.contains(event.target)) {
          setMenuOpen(false);
        }
      });

      document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
          setMenuOpen(false);
          menuButton.focus();
        }
      });
    }
  }

  const hash = window.location.hash.substring(1);
  if (hash) {
    const button = document.querySelector(`.intro-button[data-target="${hash}"]`);
    if (button) {
      button.click();
    }
  }
  
  function setupReadMoreButtons() {
    document.querySelectorAll(".read-more-btn").forEach(button => {
      button.setAttribute("aria-expanded", "false");
      button.addEventListener("click", function() {
        let extraText = this.nextElementSibling;
        const isExpanded = extraText.style.display === "block";
        
        extraText.style.display = isExpanded ? "none" : "block";
        this.textContent = isExpanded ? "Read More" : "Read Less";
        this.setAttribute("aria-expanded", String(!isExpanded));
        schedulePageHeight();
      });
    });
  }
  
  function setupIntroButtons(page) {
    const buttons = document.querySelectorAll(".intro-button");
    const images = document.querySelectorAll(".ae-br, .ae-door, .blend-br, .blend-pp, .vs-sw, .blend-em");
    let index = 0;
    let intervalId;
    
    function autoScroll() {
      images.forEach((img, i) => {
        img.classList.toggle("active", i === index);
      });
      
      index = (index + 1) % images.length;
    }
    
    function resetCarousel() {
      clearInterval(intervalId);
      index = 0;
      autoScroll();
      
      intervalId = setInterval(autoScroll, 3000);
    }
    
    if (images.length > 0) {
      resetCarousel();
    }
    
    if (buttons.length > 0) {
      const firstButton = buttons[0];
      const firstTarget = document.getElementById(firstButton.dataset.target);
      
      firstButton.classList.add("active");
      if (firstTarget) firstTarget.style.display = "block";
      
      
      buttons.forEach(button => {
        button.addEventListener("click", () => {
          if (button.classList.contains("active")) {
            button.classList.remove("active");
            button.classList.add("inactive");
            
            const target = document.getElementById(button.dataset.target);
            if (target) target.style.display = "none";
            
            body.style.minHeight = page === "index2.html" || page === "index3.html" ? "150vh" : "100vh";
            schedulePageHeight();
          } else {
            buttons.forEach(btn => {
              btn.classList.remove("active");
              btn.classList.add("inactive");
              
              const target = document.getElementById(btn.dataset.target);
              if (target) target.style.display = "none";
            });
            
            button.classList.remove("inactive");
            button.classList.add("active");
            
            const target = document.getElementById(button.dataset.target);
            if (target) target.style.display = "block";
            
            resetCarousel();
            schedulePageHeight();
          }
        });
      });
    }
  }

  function initUniversalHoverFix() {
    if (!('ontouchstart' in window)) return;

    const killState = (el) => {
        if (!el) return;

        el.blur();
        const originalPointerEvents = el.style.pointerEvents;
        el.style.pointerEvents = 'none';

        requestAnimationFrame(() => {
            el.style.pointerEvents = originalPointerEvents;
        });
    };

    document.addEventListener('touchend', function(e) {
        const el = e.target.closest('button, a, [class*="hover"], [class*="active"], [role="button"]');
        if (el) {
            setTimeout(() => killState(el), 150);
        }
    }, { passive: true });

    document.addEventListener('touchmove', function(e) {
        const el = e.target.closest('button, a');
        if (el) killState(el);
    }, { passive: true });
  }

  initUniversalHoverFix();
  
  function setupVideoNavigation() {
    const iframes = document.querySelectorAll("iframe");
    const textElements = document.querySelectorAll(".pc, .dar");
    const nextArrow = document.getElementById("nextArrow");
    const circles = document.querySelectorAll(".circle");
    let currentIndex = 0;
    
    if (iframes.length > 0 && textElements.length > 0) {
      iframes[0].classList.add("active");
      textElements[0].style.display = "block";
      if (circles.length > 0) circles[0].classList.add("active");
      
      function showNextIframe() {
        iframes[currentIndex].classList.remove("active");
        textElements[currentIndex].style.display = "none";
        if (circles[currentIndex]) circles[currentIndex].classList.remove("active");
        
        currentIndex = (currentIndex + 1) % iframes.length;
        
        iframes[currentIndex].classList.add("active");
        textElements[currentIndex].style.display = "block";
        if (circles[currentIndex]) circles[currentIndex].classList.add("active");
        
      }
      
      if (nextArrow) {
        nextArrow.addEventListener("click", showNextIframe);
      }
    }
  }
  
  function adjustPageLayout() {
    adjustElementPosition('#videos-container');
    adjustElementPosition('.container');
    adjustElementPosition('.button-container');
    centerElements();
    lockTextToStripes();
    adjustAboutContentSpacing();
  }

  function adjustAboutContentSpacing() {
    const buttonContainer = document.querySelector('.button-container');
    const contentContainer = document.querySelector('.container');
    if (!buttonContainer || !contentContainer || window.innerWidth > 768) return;

    const buttonBottom = buttonContainer.getBoundingClientRect().bottom + window.scrollY;
    const spacing = 10;
    contentContainer.style.top = `${buttonBottom + spacing}px`;
    contentContainer.style.margin = '0 auto';
  }
});