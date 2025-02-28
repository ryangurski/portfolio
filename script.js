window.onload = () => {

  setTimeout(() => {
    window.scrollTo(0, 0); 
  }, 10);

  let page = window.location.pathname.split("/").pop();

  // Set initial page-related styles based on the page
  if (page === "index2.html") {
    document.body.style.minHeight = "230vh";
    document.body.style.overflow = "auto";
  } else if (page === "index3.html") {
    document.body.style.minHeight = "150vh";
    document.body.style.overflow = "auto";
  } else {
    document.body.style.minHeight = "100vh";
    document.body.style.overflow = "hidden"; 
  }
  document.body.style.overflowX = "hidden"; 

  const numGrains = 500;
  const grainContainer = document.getElementById("grain-container");

  function generateGrains(viewportHeight) {
    grainContainer.innerHTML = ""; 

    const pageHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );

    for (let i = 0; i < numGrains; i++) {
      const grain = document.createElement("div");
      grain.classList.add("grain");

      const randomX = Math.random() * window.innerWidth;
      const randomY = Math.random() * pageHeight; 

      grain.style.left = `${randomX}px`;
      grain.style.top = `${randomY}px`;

      grainContainer.appendChild(grain);
      animateGrain(grain);
    }
  }

  function animateGrain(grain) {
    function move() {
      const randomX = (Math.random() - 0.5) * 50;
      const randomY = (Math.random() - 0.5) * 50;

      grain.style.transform = `translate(${randomX}px, ${randomY}px)`;

      setTimeout(move, 500 + Math.random() * 1000);
    }
    move();
  }

  function adjustPageHeight() {
    let lastElement = [...document.body.children].reverse().find(el => el.offsetHeight > 0);
    if (!lastElement) return;
    const neededHeight = lastElement.getBoundingClientRect().bottom + window.scrollY + 50;
    document.body.style.minHeight = `${Math.max(neededHeight, window.innerHeight)}px`;
  }

  function adjustElementPosition(selector) {
    const element = document.querySelector(selector);
    const stripedTop = document.querySelector('.striped-top');
    if (!element || !stripedTop) return;
    element.style.top = `${stripedTop.offsetHeight + 20 * (stripedTop.offsetHeight / 100)}px`;
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
        const verticalCenter = (stripedTopHeight - elementHeight) / 2;

        element.style.position = 'absolute';
        element.style.top = `${verticalCenter}px`;
    });
  }

  function lockTextToStripes() {
    const stripe = document.querySelector('.background-stripes');
    const videosText = document.querySelector('#videos');
    const aboutText = document.querySelector('#about');
    if (!stripe || !videosText || !aboutText) return;
    const stripeRect = stripe.getBoundingClientRect();
    videosText.style.left = `${stripeRect.left + stripeRect.width * 0.2}px`; 
    videosText.style.top = `${stripeRect.top + stripeRect.height * 0.75}px`;
    aboutText.style.right = `${window.innerWidth - (stripeRect.left + stripeRect.width * 0.79)}px`; 
    aboutText.style.top = `${stripeRect.top + stripeRect.height * 0.75}px`;
  }

  const buttons = document.querySelectorAll('.intro-button');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      if (button.classList.contains('active')) {
        button.classList.remove('active');
        button.classList.add('inactive');
        document.getElementById(button.dataset.target).style.display = 'none';

        document.body.style.minHeight = page === "index2.html" || page === "index3.html" ? "150vh" : "100vh"; 
      } else {
        buttons.forEach(btn => {
          btn.classList.remove('active');
          btn.classList.add('inactive');
          document.getElementById(btn.dataset.target).style.display = 'none';
        });

        button.classList.remove('inactive');
        button.classList.add('active');
        document.getElementById(button.dataset.target).style.display = 'block';
      }
    });
  });

  const images = document.querySelectorAll(".ae-br, .ae-door, .blend-br, .blend-pp");
  let index = 0;
  let intervalId;
  
  function autoScroll() {
    images.forEach((img, i) => {
      img.classList.toggle("active", i === index); 
    });
  
    index = (index + 1) % images.length; // Loop back after last image
  }
  
  function resetCarousel() {
    clearInterval(intervalId); 
    index = 0; 
    autoScroll(); 
  
    intervalId = setInterval(autoScroll, 3000);
  }
  
  // Reset carousel to the beginning when the button is clicked
  const introButton = document.querySelector('.intro-button');
  if (introButton) {
    introButton.addEventListener('click', resetCarousel);
  }
  
  const iframes = document.querySelectorAll("iframe"); 
  const textElements = document.querySelectorAll("span:not(.circle)"); 
  const nextArrow = document.getElementById("nextArrow"); 
  const circles = document.querySelectorAll(".circle"); 
  let currentIndex = 0;

  if (iframes.length > 0 && textElements.length > 0) {
    iframes[0].classList.add("active");
    textElements[0].style.display = "block"; 
    circles[0].classList.add("active"); 

  function showNextIframe() {
    // Hide current iframe and text
    iframes[currentIndex].classList.remove("active");
    textElements[currentIndex].style.display = "none";
    circles[currentIndex].classList.remove("active"); 

    // Update current index to the next iframe
    currentIndex = (currentIndex + 1) % iframes.length;

    // Show next iframe and its associated text
    iframes[currentIndex].classList.add("active");
    textElements[currentIndex].style.display = "block"; 
    circles[currentIndex].classList.add("active"); 

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

  function adjustPageLayout() {
    adjustElementPosition('#videos-container');
    adjustElementPosition('.container');
    adjustElementPosition('.button-container');
    centerElements();
    lockTextToStripes();
  }

  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      adjustPageLayout();
      adjustPageHeight();
      generateGrains(); 
    });
  });

  requestAnimationFrame(() => {
    adjustPageLayout();
    adjustPageHeight();
    generateGrains();
  });
};