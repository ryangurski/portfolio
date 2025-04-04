document.addEventListener('DOMContentLoaded', () => {

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  const grainContainer = document.getElementById("grain-container");
  const body = document.body;
  let page = window.location.pathname.split("/").pop();
  
  if (page === "index2.html") {
    body.style.minHeight = "230vh";
    body.style.overflow = "auto";
  } else if (page === "index3.html") {
    body.style.minHeight = "150vh"; 
    body.style.overflow = "auto";
  } else {
    body.style.minHeight = "100vh";
    body.style.overflow = "hidden";
  }
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
      
      requestIdleCallback(() => {
        generateRemainingGrains();
        
        animateLogo(page);
      });
    }, 100);
  });
  
  let resizeTimeout;
  window.addEventListener('resize', () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      adjustPageLayout();
      adjustPageHeight();
    }, 150); 
  });
  
  function animateLogo(page) {
    const logo = document.querySelector(".logo");
    if (logo && /index\d*\.html$/.test(page)) {
      logo.style.transition = "transform 1s ease-in-out";
      logo.style.transform = "rotate(360deg)";
      
      setTimeout(() => {
        logo.style.transition = "";
        logo.style.transform = "";
      }, 1000);
    }
  }
  
  function generateInitialGrains() {
    const fragment = document.createDocumentFragment();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const initialCount = Math.min(100, Math.floor((viewportWidth * viewportHeight) / 10000));
    
    for (let i = 0; i < initialCount; i++) {
      const grain = document.createElement("div");
      grain.classList.add("grain");
      
      const randomX = Math.random() * viewportWidth;
      const randomY = Math.random() * viewportHeight;
      
      grain.style.left = `${randomX}px`;
      grain.style.top = `${randomY}px`;
      grain.style.opacity = "0.7"; 
      
      fragment.appendChild(grain);
    }
    
    grainContainer.appendChild(fragment);
    
    const grains = grainContainer.querySelectorAll('.grain');
    grains.forEach(grain => {
      animateGrain(grain, true); 
    });
  }
  
  function generateRemainingGrains() {
    const numGrains = 500;
    const currentGrains = grainContainer.querySelectorAll('.grain').length;
    const remainingGrains = numGrains - currentGrains;
    
    if (remainingGrains <= 0) return;
    
    const fragment = document.createDocumentFragment();
    const pageHeight = Math.max(
      body.scrollHeight,
      document.documentElement.scrollHeight
    );
    
    const batchSize = 50;
    const batches = Math.ceil(remainingGrains / batchSize);
    
    function createBatch(batchIndex) {
      if (batchIndex >= batches) return;
      
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, remainingGrains);
      const localFragment = document.createDocumentFragment();
      
      for (let i = start; i < end; i++) {
        const grain = document.createElement("div");
        grain.classList.add("grain");
        
        const randomX = Math.random() * window.innerWidth;
        const randomY = Math.random() * pageHeight;
        
        grain.style.left = `${randomX}px`;
        grain.style.top = `${randomY}px`;
        
        localFragment.appendChild(grain);
      }
      
      grainContainer.appendChild(localFragment);
      
      const newGrains = Array.from(grainContainer.querySelectorAll('.grain')).slice(-(end - start));
      newGrains.forEach(grain => animateGrain(grain));
      
      if (batchIndex + 1 < batches) {
        setTimeout(() => requestIdleCallback(() => createBatch(batchIndex + 1)), 100);
      }
    }
    
    createBatch(0);
  }
  
  function animateGrain(grain, isInitial = false) {
    function move() {
      const factor = isInitial ? 0.2 : 1.0;
      const randomX = (Math.random() - 0.5) * 50 * factor;
      const randomY = (Math.random() - 0.5) * 50 * factor;
      
      grain.style.transform = `translate(${randomX}px, ${randomY}px)`;
      
      setTimeout(() => requestAnimationFrame(move), 500 + Math.random() * 1000);
    }
    requestAnimationFrame(move);
  }

  function adjustPageHeight() {
    let lastElement = [...document.body.children].reverse().find(el => el.offsetHeight > 0);
    if (!lastElement) return;
    const neededHeight = lastElement.getBoundingClientRect().bottom + window.scrollY + 50;
    document.body.style.minHeight = `${Math.max(neededHeight, window.innerHeight)}px`;
  }
  
  function adjustElementPosition(selector) {
    if (window.innerWidth <= 768) return;
    
    const element = document.querySelector(selector);
    const stripedTop = document.querySelector('.striped-top');
    if (!element || !stripedTop) return;
    
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
      menuButton.addEventListener("click", function() {
        menuButton.classList.toggle("open");
      });
    }
  }
  
  function setupReadMoreButtons() {
    document.querySelectorAll(".read-more-btn").forEach(button => {
      button.addEventListener("click", function() {
        let extraText = this.nextElementSibling;
        const isExpanded = extraText.style.display === "block";
        
        extraText.style.display = isExpanded ? "none" : "block";
        this.textContent = isExpanded ? "Read More" : "Read Less";
      });
    });
  }
  
  function setupIntroButtons(page) {
    const buttons = document.querySelectorAll(".intro-button");
    const images = document.querySelectorAll(".ae-br, .ae-door, .blend-br, .blend-pp");
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
          }
        });
      });
    }
  }
  
  function setupVideoNavigation() {
    const iframes = document.querySelectorAll("iframe");
    const textElements = document.querySelectorAll("span:not(.circle)");
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
        
        if (currentIndex === 1) {
          const darText = document.querySelector(".dar");
          if (darText) {
            darText.style.display = "block";
          }
        }
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
  }
});