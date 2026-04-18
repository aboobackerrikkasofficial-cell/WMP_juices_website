const frameCount = 105; // Updated sequence after user optimization
const getFramePath = (index) => {
  // Mapping to the verified high-quality frames folder
  return `/public/watermelon_permanent_frames/ezgif-frame-${index.toString().padStart(3, '0')}.png`;
};

// DOM Elements
const canvas = document.getElementById('hero-canvas');
const context = canvas.getContext('2d');
const scrollContainer = document.querySelector('.hero-scroll-container');
const textPanel = document.querySelector('.hero-text-panel');
const exploreBtn = document.querySelector('.hero-cta');
// Heritage storytelling elements removed

// Image objects cache
const images = [];
let imagesLoaded = 0;
let lenis; // Momentum Scroll Engine

// Commerce State — always start fresh
let cart = [];
localStorage.removeItem('mwp_cart');

// Loader Elements
const juiceLoader = document.getElementById('juice-loader');
const loaderLiquid = document.querySelector('.fruit-liquid');
const loaderPerc = document.querySelector('.load-percentage');

// High-Performance Canvas Settings: Capped at 1.5 DPR to prevent GPU saturation
const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
let cw, ch;

function resizeCanvas() {
  cw = window.innerWidth * dpr;
  ch = window.innerHeight * dpr;
  canvas.width = cw;
  canvas.height = ch;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  canvas.style.willChange = 'transform';
  canvas.style.contain = 'paint';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Priority Preload System: Loads key hero frames first for instant speed, rest in background
async function preloadImages() {
  const loadStartTime = performance.now();
  const priorityCount = 40; // First 40 frames for the "First Impression"

  for (let i = 0; i < frameCount; i++) images[i] = null;

  // STAGE 1: Priority Loading
  const priorityPromises = Array.from({ length: priorityCount }, async (_, i) => {
    try {
      const response = await fetch(getFramePath(i + 1));
      const blob = await response.blob();
      // ULTRA-HD UPGRADE: Scaling to 2560px for 4K/8K clarity on large screens
      const bitmap = await createImageBitmap(blob, {
        resizeWidth: 2560, 
        resizeQuality: 'high'
      });
      images[i] = bitmap;
      imagesLoaded++;

      const progress = Math.round((imagesLoaded / frameCount) * 100);
      if (loaderLiquid) loaderLiquid.style.height = `${progress}%`;
      if (loaderPerc) loaderPerc.textContent = `${progress}%`;

      if (imagesLoaded === 1) drawFrame(1);
    } catch (e) {
      console.warn(`Priority frame ${i + 1} fail`, e);
    }
  });

  // Wait only for the first 40 frames to show the website
  await Promise.all(priorityPromises);

  // UNLOCK WEBSITE: site is ready with high-quality hero
  if (juiceLoader) juiceLoader.classList.add('loaded');
  document.body.classList.add('is-ready');
  console.log(`🚀 Priority Hero Primed in ${(performance.now() - loadStartTime).toFixed(0)}ms`);

  // STAGE 2: Background Loading (Non-blocking)
  const backgroundPromises = Array.from({ length: frameCount - priorityCount }, async (_, i) => {
    const frameIdx = i + priorityCount;
    try {
      const response = await fetch(getFramePath(frameIdx + 1));
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob, {
        resizeWidth: 2560, // Full high-fidelity decoding
        resizeQuality: 'high'
      });
      images[frameIdx] = bitmap;
      imagesLoaded++;
    } catch (e) {
      console.warn(`BG frame ${frameIdx + 1} fail`, e);
    }
  });

  // Silently complete the rest
  Promise.all(backgroundPromises).then(() => {
    console.log(`✨ Full 168-Frame 4K Engine Fully Loaded`);
  });
}

function drawFrame(frameIndex, opacity = 1) {
  const img = images[Math.max(0, Math.min(frameCount - 1, Math.floor(frameIndex) - 1))];
  if (img) {

    const imgRatio = img.width / img.height;
    const canvasRatio = cw / ch;

    let renderW, renderH, offsetX, offsetY;
    if (imgRatio > canvasRatio) {
      renderH = ch;
      renderW = img.width * (ch / img.height);
      offsetX = (cw - renderW) / 2;
      offsetY = 0;
    } else {
      renderW = cw;
      renderH = img.height * (cw / img.width);
      offsetX = 0;
      offsetY = (ch - renderH) / 2;
    }

    context.globalAlpha = opacity;
    // HIGH-FIDELITY FILTERS: Boosting clarity, saturation, and contrast for 8K look
    // ULTRA-HD OPTIMIZATION: Maximum clarity and vibrant punch
    context.filter = 'contrast(1.2) saturate(1.25) brightness(1.02) sepia(0.05)';
    context.imageSmoothingQuality = 'high';
    
    context.drawImage(
      img,
      Math.round(offsetX),
      Math.round(offsetY),
      Math.round(renderW),
      Math.round(renderH)
    );
    context.filter = 'none'; // Reset to prevent stack
    context.globalAlpha = 1;
  }
}

// Scroll animation logic (Optimized Smooth Lerping)
let currentFrame = 1;
let targetFrame = 1;
let lastRenderedFrame = -1;
let scrollProgress = 0;
let smoothProgress = 0; // Secondary lerp for jitter-free progress
let lastScrollProgress = -1;

function updateScrollVal() {
  const rect = scrollContainer.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const scrollTop = -rect.top;
  const maxScroll = rect.height - windowHeight;

  scrollProgress = scrollTop / maxScroll;
  scrollProgress = Math.max(0, Math.min(1, scrollProgress));

  // Sync Canvas Visibility for fixed positioning
  const animationPanel = document.querySelector('.hero-animation-panel');
  if (animationPanel) {
    if (scrollProgress > 0 && scrollProgress < 1) {
      animationPanel.style.opacity = 1;
    } else if (scrollProgress >= 1) {
      animationPanel.style.opacity = Math.max(0, 1 - (scrollTop - maxScroll) / 500);
    }
  }

  // Sync Navbar Morphing
  const navbar = document.querySelector('.liquid-nav');
  if (navbar) {
    if (scrollProgress > 0.6) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
}

// Momentum Scroll Initialization
function initLenis() {
  lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.1,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  lenis.on('scroll', (e) => {
    updateScrollVal();
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// Continuous render loop with Delta-Time Physics
let lastTime = performance.now();

function renderLoop(time) {
  const now = performance.now();
  const deltaTime = (now - lastTime) / 16.666;
  lastTime = now;

  // Secondary lerp for the progress itself to create ultra-smooth video scrubbing
  // ULTRA-RESPONSIVE LERP: Increased to 0.08 for instant response to scroll flips
  smoothProgress += (scrollProgress - smoothProgress) * (0.08 * Math.min(deltaTime, 2.0));

  targetFrame = Math.min(
    frameCount - 1,
    Math.max(0, smoothProgress * (frameCount - 1))
  );

  lastRenderedFrame = currentFrame;

  // Render Loop: High-Precision Cinematic Frame Blending
  const diff = targetFrame - currentFrame;

  if (Math.abs(diff) > 0.0001) {
    // Advanced Lerping
    currentFrame += diff * (0.05 * Math.min(deltaTime, 2.0));

    // RENDER PIPELINE: Direct opaque drawing to prevent white flashes or transparency blinking
    // context.clearRect(0, 0, cw, ch); // REMOVED: Clearing causes white background to bleed through

    // Draw only the primary active frame - no blended opacity transitions as requested
    drawFrame(currentFrame + 1, 1);

    lastRenderedFrame = currentFrame;

    canvas.style.opacity = 1;
  }

  // Storytelling Logic Removed


  // Elegant text parallax and dynamic highlighting for MAIN LOGO
  if (textPanel && Math.abs(scrollProgress - lastScrollProgress) > 0.0001) {
    // LOGO LOCK: Strictly 100% opacity for the first 2% of scroll
    let opFactor = 1;
    if (smoothProgress > 0.02) {
      opFactor = Math.max(0, 1 - ((smoothProgress - 0.02) * 8));
    }
    
    const yOffset = Math.round(smoothProgress * -150); 
    const shadowIntensity = 0.5 + (Math.abs(diff) * 10);

    textPanel.style.transform = `translate3d(0, ${yOffset}px, 0)`;
    textPanel.style.opacity = opFactor;
    textPanel.style.textShadow = `0 10px 40px rgba(0,0,0,${Math.min(0.9, shadowIntensity)})`;
    textPanel.style.visibility = opFactor > 0.01 ? 'visible' : 'hidden';
  }

  lastScrollProgress = scrollProgress;
  window.requestAnimationFrame(renderLoop);
}

// Product Data for MWP Juices
const productsData = [
  {
    name: "Watermelon Bliss",
    desc: "Nature's hydration miracle. Cold-pressed to perfection.",
    priceOrig: "₹60",
    priceDisc: "₹40",
    image: "/public/product-images/watermelon-juice.png",
    specs: [
      { label: "Hydration", value: "92% Water Content" },
      { label: "Vitamins", value: "Vitamin C, A, & Lycopene" },
      { label: "Benefits", value: "Heart Health & Muscle Recovery" },
      { label: "Digestive", value: "Natural Cooling Properties" }
    ]
  },
  {
    name: "Mango Majesty",
    desc: "The king of fruits, captured in a luscious, velvety blend.",
    priceOrig: "₹60",
    priceDisc: "₹40",
    image: "/public/product-images/mango-juice.png",
    specs: [
      { label: "Immune Boost", value: "High Vitamin C & Beta-Carotene" },
      { label: "Digestion", value: "Natural Amylase Enzymes" },
      { label: "Energy", value: "Clean, Tropical Fuel" },
      { label: "Vitamins", value: "Vitamin A, C, & Folate" }
    ]
  },
  {
    name: "Pineapple Punch",
    desc: "Tropical sunshine with a vibrant, anti-inflammatory kick.",
    priceOrig: "₹60",
    priceDisc: "₹40",
    image: "/public/product-images/pineapple-juice.png",
    specs: [
      { label: "Enzymes", value: "Potent Bromelain Content" },
      { label: "Immune", value: "Daily dose of Vitamin C" },
      { label: "Body", value: "Manganese for Bone Health" },
      { label: "Goodness", value: "Gut Health & Skin Glow" }
    ]
  }
];

// --- COMMERCE ENGINE: PRISM BASKET ---
function saveCart() {
  localStorage.setItem('mwp_cart', JSON.stringify(cart));
  updateCartUI();
}

function addToCart(index) {
  const prod = productsData[index];
  const existing = cart.find(item => item.name === prod.name);

  if (existing) {
    // Already in cart — show error toast only
    showCartToast(`<strong>${prod.name}</strong> is already in your basket.`, 'already');
    return;
  }

  cart.push({
    ...prod,
    quantity: 1,
    id: index
  });

  saveCart();

  // Show success popup toast
  showCartToast(`Added <strong>${prod.name}</strong> to basket!`, 'success');

  // Auto-close the product modal after 1.5s
  setTimeout(() => {
    window.closeModal();
  }, 1500);

  // Pulse the navbar badge
  const badge = document.getElementById('cart-badge');
  badge.classList.remove('pop');
  void badge.offsetWidth;
  badge.classList.add('pop');
}

function showCartToast(htmlString, type = 'success') {
  if (!htmlString) return;

  // Global toast
  const existing = document.querySelector('.cart-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `cart-toast cart-toast--${type}`;
  toast.innerHTML = `<span class="cart-toast-icon">${type === 'success' ? '🛒' : '⚠️'}</span><span class="cart-toast-msg">${htmlString}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('cart-toast--visible'));
  setTimeout(() => {
    toast.classList.remove('cart-toast--visible');
    setTimeout(() => toast.remove(), 500);
  }, 2800);
}

function updateQuantity(id, delta) {
  const item = cart.find(i => i.id == id);
  if (!item) return;
  // Minimum quantity is 1 — use delete button to remove
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart();
}

function setQuantity(id, val) {
  const item = cart.find(i => i.id == id);
  if (!item) return;
  const num = parseInt(val);
  // Clamp to at least 1; empty/0 input just resets to 1
  item.quantity = (!num || num < 1) ? 1 : num;
  saveCart();
  updateCartUI(); // re-render so input reflects clamped value
}

function deleteFromCart(id) {
  // Custom confirm overlay instead of native browser dialog
  showDeleteConfirm(id);
}

function showDeleteConfirm(id) {
  const item = cart.find(i => i.id == id);
  if (!item) return;

  // Remove any existing confirm
  const prev = document.getElementById('cart-confirm-overlay');
  if (prev) prev.remove();

  const overlay = document.createElement('div');
  overlay.id = 'cart-confirm-overlay';
  overlay.innerHTML = `
    <div class="cart-confirm-box">
      <p>Remove <strong>${item.name}</strong> from your basket?</p>
      <div class="cart-confirm-actions">
        <button class="confirm-no-btn" onclick="document.getElementById('cart-confirm-overlay').remove()">Keep It</button>
        <button class="confirm-yes-btn" onclick="confirmDelete(${id})">Yes, Remove</button>
      </div>
    </div>
  `;
  document.getElementById('cart-panel').appendChild(overlay);
}

function confirmDelete(id) {
  cart = cart.filter(i => i.id != id);
  saveCart();
  const overlay = document.getElementById('cart-confirm-overlay');
  if (overlay) overlay.remove();
}

function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  const itemsList = document.getElementById('cart-items-list');
  const totalPrice = document.getElementById('cart-total-price');

  // Update Badge
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  badge.textContent = totalCount;

  // Update List
  if (cart.length === 0) {
    itemsList.innerHTML = '<div class="cart-empty-msg">Your basket is waiting for a burst of flavor.</div>';
  } else {
    itemsList.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-core">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p class="cart-item-price">${item.priceDisc} &times; ${item.quantity} = ₹${parseInt(item.priceDisc.replace('₹', '')) * item.quantity}</p>
          </div>
          <div class="cart-item-actions">
            <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
            <input type="number" class="qty-input" value="${item.quantity}" min="1" onchange="setQuantity(${item.id}, this.value)" />
            <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            <button class="qty-delete-btn" onclick="deleteFromCart(${item.id})" title="Remove item">
              <svg viewBox="0 0 24 24" width="15" height="15"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Update Total Price (Lively)
  const total = cart.reduce((acc, item) => {
    const price = parseInt(item.priceDisc.replace('₹', ''));
    return acc + (price * item.quantity);
  }, 0);

  totalPrice.textContent = `₹${total}`;
}

function openCart() {
  document.getElementById('cart-panel').classList.add('active');
  if (typeof lenis !== 'undefined' && lenis) lenis.stop();
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-panel').classList.remove('active');
  if (typeof lenis !== 'undefined' && lenis) lenis.start();
  document.body.style.overflow = '';
}

// Attach to window for onclick handlers
window.updateQuantity = updateQuantity;
window.setQuantity = setQuantity;
window.addToCart = addToCart;
window.deleteFromCart = deleteFromCart;
window.confirmDelete = confirmDelete;
window.openCart = openCart;
window.closeCart = closeCart;

window.openModal = function (index) {
  const prod = productsData[index];
  const modalBody = document.getElementById('modal-body');
  const alreadyInCart = cart.some(item => item.name === prod.name);

  let specsHtml = prod.specs.map(spec => `
    <div class="spec-row">
      <span class="spec-label">${spec.label}</span>
      <span class="spec-value">${spec.value}</span>
    </div>
  `).join('');

  modalBody.innerHTML = `
    <div class="modal-body-inner">
      <div class="modal-image-wrap">
        <img src="${prod.image}" alt="${prod.name} | Premium Cold-Pressed Juice Experience" />
      </div>
      <div class="modal-text-wrap">
        <div class="modal-header">
          <h3>${prod.name}</h3>
          <p class="modal-desc">${prod.desc}</p>
        </div>
        
        <div class="modal-specs-stack">
          ${specsHtml}
        </div>

        <div class="prestige-footer">
          <div class="prestige-pricing">
            <span class="price-disc">${prod.priceDisc}</span>
            <span class="price-orig">${prod.priceOrig}</span>
            <span class="prestige-badge">SAVE ₹20</span>
          </div>
          <button class="modal-buy-btn ${alreadyInCart ? 'modal-buy-btn--added' : ''}" onclick="addToCart(${index})">
            ${alreadyInCart ? '✓ Added to Cart' : 'Add to Basket'}
          </button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('product-modal').classList.add('active');

  // SEO: Update title dynamically
  document.title = `${prod.name} | MWP Juice Experience`;

  if (typeof lenis !== 'undefined' && lenis) lenis.stop();
  document.body.style.overflow = 'hidden';
};

window.closeModal = function () {
  document.getElementById('product-modal').classList.remove('active');

  // SEO: Restore title
  document.title = "MWP Juice | Premium Cold-Pressed Refreshment | Kasaragod, Kerala";

  if (typeof lenis !== 'undefined' && lenis) lenis.start();
  document.body.style.overflow = '';
};

function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  productsData.forEach((prod, index) => {
    const delay = index * 0.1; // staggered animation
    const html = `
      <div class="product-card" style="transition-delay: ${delay}s, 0s, 0s;">
        <div class="product-badge">Fresh</div>
        <div class="product-image-wrap">
          <img src="${prod.image}" alt="${prod.name} Cold-Pressed Juice" class="product-image" loading="lazy" />
        </div>
        <div class="product-info">
          <h3 class="product-name">${prod.name}</h3>
          <p class="product-desc">${prod.desc}</p>
          <div class="product-pricing">
            <div class="price-stack">
              <span class="price-disc">${prod.priceDisc}</span>
              <span class="price-orig">${prod.priceOrig}</span>
            </div>
            <span class="save-badge">Save ₹20</span>
          </div>
          <button class="product-btn" data-index="${index}">View Experience</button>
        </div>
      </div>
    `;
    grid.insertAdjacentHTML('beforeend', html);
  });

  // Cleanly bind click events to all buttons
  document.querySelectorAll('.product-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.getAttribute('data-index');
      window.openModal(idx);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.product-card').forEach(card => observer.observe(card));

  const headObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Invert logic for visibility if needed, or keep standard
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.products-header').forEach(header => {
    headObserver.observe(header);
  });
}

// Initialization and Entry Triggers
function init() {
  const textPanel = document.querySelector('.hero-text-panel');
  preloadImages(); // Parallel Loading starts
  initLenis();      // Momentum Scroll starts

  renderProducts();  // Dynamic Product Grid

  // Initialize general scroll reveals
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

  // Main Render Loop for Canvas Animation
  renderLoop();

  // Scroll visibility for Hero Text Panel
  if (textPanel) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          textPanel.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    const heroLayout = document.querySelector('.hero-layout');
    if (heroLayout) heroObserver.observe(heroLayout);
  }

  // Set up modal listeners
  const closeBtn = document.getElementById('modal-close');
  const modalOverlay = document.getElementById('product-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // --- CART LISTENERS ---
  const cartTrigger = document.getElementById('cart-trigger');
  const cartClose = document.getElementById('cart-close');
  if (cartTrigger) cartTrigger.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);

  updateCartUI(); // Load initial state

  // --- CHECKOUT: SEND ORDER VIA EMAILJS ---
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', async () => {
      if (cart.length === 0) {
        showCartToast('Your basket is empty!', 'already');
        return;
      }

      // Check Authentication
      if (!currentUser) {
        showCartToast('Please Sign In or Login to place an order.', 'already');
        closeCart();
        openAuthModal(authSelectModal);
        return;
      }

      // Build order summary
      const orderLines = cart.map(item => {
        const price = parseInt(item.priceDisc.replace('₹', ''));
        return `${item.name} × ${item.quantity} = ₹${price * item.quantity}`;
      }).join('\n');

      const total = cart.reduce((acc, item) => {
        const price = parseInt(item.priceDisc.replace('₹', ''));
        return acc + (price * item.quantity);
      }, 0);

      // Loading state
      const originalText = checkoutBtn.innerText;
      checkoutBtn.innerText = 'Placing Order...';
      checkoutBtn.disabled = true;

      try {
        if (typeof emailjs === 'undefined') throw new Error('EmailJS not loaded');

        // EXACT VARIABLE MAPPINGS FOR EMAILJS DASHBOARD
        // The user must map: {{from_name}}, {{from_email}}, {{from_phone}}, {{address}}, {{delivery_date}}, {{item_section}}, {{total_price}}
        const templateParams = {
          from_name: currentUser.name,
          from_email: currentUser.email,
          from_phone: currentUser.mobile,
          address: currentUser.place,
          delivery_date: currentUser.date,
          item_section: orderLines,
          total_price: `₹${total}`,
          message: `Order Details:\n${orderLines}\n\nTotal Price: ₹${total}`
        };

        const serviceId = 'service_l511ey6';
        const templateId = 'template_tkxbs9d';

        await emailjs.send(serviceId, templateId, templateParams);

        // Save order to Mock DB
        const ordersDB = JSON.parse(localStorage.getItem('mwp_orders')) || [];
        ordersDB.push({ userEmail: currentUser.email, items: cart, total, date: new Date().toISOString() });
        localStorage.setItem('mwp_orders', JSON.stringify(ordersDB));

        // Success — clear cart and close panel
        cart = [];
        saveCart();
        closeCart();
        showCartToast('Order placed! Check your email 🎉', 'success');

      } catch (err) {
        console.error('Order Email Error:', err);
        showCartToast('Order failed. Please try again.', 'already');
      } finally {
        checkoutBtn.innerText = originalText;
        checkoutBtn.disabled = false;
      }
    });
  }

  // --- DATABASE & AUTH LOGIC ---
  const usersDB = JSON.parse(localStorage.getItem('mwp_users')) || [];
  let currentUser = JSON.parse(localStorage.getItem('mwp_current_user')) || null;

  function updateNavbarProfile() {
    const navUserSvg = document.getElementById('nav-user-svg');
    const navUserAvatar = document.getElementById('nav-user-avatar');
    if (!navUserSvg || !navUserAvatar) return;

    if (currentUser && currentUser.avatar) {
      navUserAvatar.src = currentUser.avatar;
      navUserAvatar.style.display = 'block';
      navUserSvg.style.display = 'none';
    } else {
      navUserAvatar.style.display = 'none';
      navUserSvg.style.display = 'block';
      navUserAvatar.src = '';
    }
  }

  // Hydrate Nav purely on start
  updateNavbarProfile();

  // DOM Elements
  const profileTrigger = document.getElementById('profile-trigger');

  const authSelectModal = document.getElementById('auth-selection-modal');
  const authSelectClose = document.getElementById('auth-selection-close');
  const gotoLoginBtn = document.getElementById('btn-goto-login');
  const gotoRegisterBtn = document.getElementById('btn-goto-register');

  const loginModal = document.getElementById('login-modal');
  const loginClose = document.getElementById('login-close');
  const loginForm = document.getElementById('login-form');

  const profileModal = document.getElementById('profile-modal');
  const profileClose = document.getElementById('profile-close');
  const profileForm = document.getElementById('profile-form');

  const userProfileModal = document.getElementById('user-profile-modal');
  const userProfileClose = document.getElementById('user-profile-close');
  const btnLogout = document.getElementById('btn-logout');

  function closeAllModals() {
    [authSelectModal, loginModal, profileModal, userProfileModal].forEach(m => {
      if (m) m.classList.remove('active');
    });
    // Ensure scroll lock is released when closing any auth modal
    if (typeof lenis !== 'undefined' && lenis) lenis.start();
    document.body.style.overflow = '';
  }

  function openAuthModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    if (typeof lenis !== 'undefined' && lenis) lenis.stop();
    document.body.style.overflow = 'hidden';
  }

  // Bind Object Clicks for Modals
  [authSelectClose, loginClose, profileClose, userProfileClose].forEach(btn => {
    if (btn) btn.addEventListener('click', closeAllModals);
  });

  // Close modals when clicking outside
  [authSelectModal, loginModal, profileModal, userProfileModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeAllModals();
      });
    }
  });

  // Profile icon logic
  if (profileTrigger) {
    profileTrigger.addEventListener('click', () => {
      if (currentUser) {
        // Show Profile
        document.getElementById('display-user-name').textContent = currentUser.name;
        document.getElementById('display-user-email').textContent = currentUser.email;
        document.getElementById('display-user-mobile').textContent = currentUser.mobile;

        const avatarImg = document.getElementById('display-user-avatar');
        const avatarPlaceholder = document.getElementById('avatar-placeholder');
        if (currentUser.avatar) {
          avatarImg.src = currentUser.avatar;
          avatarImg.style.display = 'block';
          avatarPlaceholder.style.display = 'none';
        } else {
          avatarImg.style.display = 'none';
          avatarPlaceholder.style.display = 'block';
        }

        openAuthModal(userProfileModal);
      } else {
        // Show Auth Selection
        openAuthModal(authSelectModal);
      }
    });
  }

  // Profile Picture Upload Logic
  const avatarUpload = document.getElementById('upload-avatar');
  if (avatarUpload) {
    avatarUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // INSTANT PREVIEW (Zero Latency)
      const instantUrl = URL.createObjectURL(file);

      const avatarImg = document.getElementById('display-user-avatar');
      const avatarPlaceholder = document.getElementById('avatar-placeholder');
      const navAvatar = document.getElementById('nav-user-avatar');
      const navSvg = document.getElementById('nav-user-svg');

      if (avatarImg) { avatarImg.src = instantUrl; avatarImg.style.display = 'block'; }
      if (avatarPlaceholder) { avatarPlaceholder.style.display = 'none'; }
      if (navAvatar) { navAvatar.src = instantUrl; navAvatar.style.display = 'block'; }
      if (navSvg) { navSvg.style.display = 'none'; }

      // Background Persistence (Heavier task)
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Avatar = event.target.result;

        // Update current user
        currentUser.avatar = base64Avatar;
        localStorage.setItem('mwp_current_user', JSON.stringify(currentUser));

        // Update user in DB
        const dbIndex = usersDB.findIndex(u => u.email === currentUser.email);
        if (dbIndex !== -1) {
          usersDB[dbIndex].avatar = base64Avatar;
          localStorage.setItem('mwp_users', JSON.stringify(usersDB));
        }

        showCartToast('Profile picture saved!', 'success');
      };

      reader.readAsDataURL(file);
    });
  }

  // Navigation from Auth Selection
  if (gotoLoginBtn) {
    gotoLoginBtn.addEventListener('click', () => {
      closeAllModals();
      openAuthModal(loginModal);
    });
  }
  if (gotoRegisterBtn) {
    gotoRegisterBtn.addEventListener('click', () => {
      closeAllModals();
      openAuthModal(profileModal);
    });
  }

  // Register Form Handling
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const pass = document.getElementById('prof-password').value;
      const confirmPass = document.getElementById('prof-confirm-password').value;

      if (pass !== confirmPass) {
        showCartToast('Passwords do not match!', 'already');
        return;
      }

      const email = document.getElementById('prof-email').value;
      if (usersDB.some(u => u.email === email)) {
        showCartToast('Email is already registered!', 'already');
        return;
      }

      const newUser = {
        name: document.getElementById('prof-name').value,
        mobile: document.getElementById('prof-mobile').value,
        email: email,
        place: document.getElementById('prof-place').value,
        date: document.getElementById('prof-date').value,
        password: pass
      };

      usersDB.push(newUser);
      localStorage.setItem('mwp_users', JSON.stringify(usersDB));

      showCartToast('Account Created! Please login.', 'success');
      closeAllModals();
      profileForm.reset();

      // Navigate to login
      setTimeout(() => {
        openAuthModal(loginModal);
      }, 500);
    });
  }

  // Login Form Handling
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;

      const user = usersDB.find(u => u.email === email && u.password === pass);
      if (user) {
        currentUser = user;
        localStorage.setItem('mwp_current_user', JSON.stringify(currentUser));
        showCartToast(`Welcome back, <strong>${user.name}</strong>!`, 'success');
        updateNavbarProfile(); // Sync to top bar
        closeAllModals();
        loginForm.reset();
      } else {
        showCartToast('Invalid credentials!', 'already');
      }
    });
  }

  // Logout
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      currentUser = null;
      localStorage.removeItem('mwp_current_user');
      updateNavbarProfile(); // remove from nav
      closeAllModals();
      showCartToast('Logged out securely.', 'success');
    });
  }


  // --- FORM HANDLING & EMAILJS ---
  const contactForm = document.querySelector('.contact-form');
  const notificationContainer = document.getElementById('notification-container');

  if (typeof emailjs !== 'undefined') {
    emailjs.init("Z6ahC4a9k8ts8wgIf");
  }

  function showNotification(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'error' ? '🍋' : '🌟'}</span>
      <span class="toast-msg">${message}</span>
    `;

    notificationContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('active'));

    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 600);
    }, 4000);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const inputs = contactForm.querySelectorAll('input, textarea');
      const emailInput = contactForm.querySelector('input[type="email"]');
      let isValid = true;

      inputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('invalid');
        } else {
          input.classList.remove('invalid');
        }
      });

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailInput && !emailRegex.test(emailInput.value)) {
        isValid = false;
        emailInput.classList.add('invalid');
        showNotification("Please enter a valid email address!", "error");
        return;
      }

      if (!isValid) {
        showNotification("Please fill all of the inputs!", "error");
        return;
      }

      const btn = contactForm.querySelector('.contact-btn');
      const originalText = btn.innerText;
      btn.innerText = "Sending Sensation...";
      btn.disabled = true;

      try {
        const templateParams = {
          from_name: contactForm.querySelector('input[type="text"]').value,
          from_email: emailInput.value,
          from_phone: document.getElementById('contact-phone').value,
          message: contactForm.querySelector('textarea').value,
          to_email: 'rikkas.aboo@gmail.com'
        };

        const serviceId = "service_l511ey6";
        const templateId = "template_tkxbs9d";

        await emailjs.send(serviceId, templateId, templateParams);
        showNotification("Experience Sent! Check your inbox soon.", "success");
        contactForm.reset();

      } catch (err) {
        console.error("EmailJS Error:", err);
        showNotification("Submission Error. Check your EmailJS setup!", "error");
      } finally {
        btn.innerText = originalText;
        btn.disabled = false;
      }
    });

    contactForm.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', () => input.classList.remove('invalid'));
    });
  }
  // Mobile Menu Logic
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('main-nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
