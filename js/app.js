document.addEventListener('DOMContentLoaded', () => {

  // DOM refs
  const featuredContainer = document.getElementById('featured-grid');
  const offersGrid = document.getElementById('offers-grid');
  const allFilteredContainer = document.getElementById('all-filtered-products');
  const featuredSection = document.getElementById('featured-section');
  const offersSection = document.getElementById('offers-section');
  const filteredSection = document.getElementById('filtered-section');
  const noProductsMessage = document.getElementById('no-products-message');

  const searchInput = document.getElementById('search-input');
  const searchResultsTitle = document.getElementById('search-results-title');

  const categoryCarousel = document.getElementById('category-carousel');

  const productModal = document.getElementById('productModal');
  const modalProductName = document.getElementById('modal-product-name');
  const modalProductDescription = document.getElementById('modal-product-description');
  const modalProductPrice = document.getElementById('modal-product-price');
  const modalAddToCartBtn = document.getElementById('modal-add-to-cart-btn');
  const qtyInput = document.getElementById('qty-input');

  const carouselImagesContainer = document.getElementById('carousel-images-container');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  const cartBtn = document.getElementById('cart-btn');
  const cartBadge = document.getElementById('cart-badge');
  const cartModal = document.getElementById('cartModal');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalElement = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  const installBanner = document.getElementById('install-banner');
  const installCloseBtn = document.getElementById('install-close-btn');
  const installPromptBtn = document.getElementById('install-prompt-btn');

  // state
  let cart = [];
  let currentImageIndex = 0;
  let currentProduct = null;
  let deferredPrompt = null;

  // ---------- Banner Carousel ----------
const bannerCarousel = document.getElementById('banner-carousel');
const bannerDots = document.getElementById('banner-dots');
const slides = document.querySelectorAll('.banner-slide');
let currentBanner = 0;
let bannerInterval;

// Crear dots de navegación
slides.forEach((_, idx) => {
  const dot = document.createElement('div');
  dot.classList.add('banner-dot');
  if (idx === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToSlide(idx));
  bannerDots.appendChild(dot);
});

function updateBanner() {
  bannerCarousel.style.transform = `translateX(-${currentBanner * 100}%)`;
  document.querySelectorAll('.banner-dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentBanner);
  });
}

function goToSlide(idx) {
  currentBanner = idx;
  updateBanner();
  resetInterval();
}

function nextBanner() {
  currentBanner = (currentBanner + 1) % slides.length;
  updateBanner();
}

function resetInterval() {
  clearInterval(bannerInterval);
  bannerInterval = setInterval(nextBanner, 4000); // cada 4s
}

// touch swipe
let startX = 0;
bannerCarousel.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
});
bannerCarousel.addEventListener('touchend', e => {
  let endX = e.changedTouches[0].clientX;
  if (endX - startX > 50) {
    // swipe derecha
    currentBanner = (currentBanner - 1 + slides.length) % slides.length;
    updateBanner();
    resetInterval();
  } else if (startX - endX > 50) {
    // swipe izquierda
    nextBanner();
    resetInterval();
  }
});

// mouse drag opcional
let isDown = false, startXMouse;
bannerCarousel.addEventListener('mousedown', e => {
  isDown = true;
  startXMouse = e.pageX;
});
bannerCarousel.addEventListener('mouseup', e => {
  if (!isDown) return;
  let diff = e.pageX - startXMouse;
  if (diff > 50) {
    currentBanner = (currentBanner - 1 + slides.length) % slides.length;
    updateBanner();
  } else if (diff < -50) {
    nextBanner();
  }
  isDown = false;
  resetInterval();
});

resetInterval(); // iniciar auto


  // categories (derivado de productData)
  const categories = Array.from(new Set(productData.map(p => p.category))).map(c => ({ label: c }));

  // helpers
  const money = (v) => Number(v).toFixed(3);

  const generateProductCard = (p) => {
    return `
      <div class="product-card" data-product-id="${p.id}">
        <img src="${p.image[0]}" alt="${p.name}" class="product-image modal-trigger" data-id="${p.id}" />
        <div class="product-info">
          <div>
            <div class="product-name">${p.name}</div>
            <div class="product-description">${p.description}</div>
          </div>
          <div style="margin-top:8px">
            <div class="product-price">$${money(p.price)}</div>
          </div>
        </div>
      </div>
    `;
  };

  const renderProducts = (container, products) => {
    container.innerHTML = '';
    if (!products || products.length === 0) {
      noProductsMessage.style.display = 'block';
      return;
    }
    noProductsMessage.style.display = 'none';
    products.forEach(p => container.innerHTML += generateProductCard(p));
  };

  const generateCategoryCarousel = () => {
    categoryCarousel.innerHTML = '';
    // Añadir una opción 'Todas'
    const allItem = document.createElement('div');
    allItem.className = 'category-item';
    allItem.innerHTML = `<img class="category-image" src="img/icons/all.webp" alt="Todas" data-category="__all"><span class="category-name">Todas</span>`;
    categoryCarousel.appendChild(allItem);

    categories.forEach(c => {
      const el = document.createElement('div');
      el.className = 'category-item';
      // imagen genérica por categoría si no hay assets
      const fileName = `img/icons/${c.label.toLowerCase().replace(/\s+/g,'_')}.webp`;
      el.innerHTML = `<img class="category-image" src="${fileName}" alt="${c.label}" data-category="${c.label}"><span class="category-name">${c.label}</span>`;
      categoryCarousel.appendChild(el);
    });
  };

  // buscador
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      showDefaultSections();
      return;
    }
    const filtered = productData.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
    filteredSection.style.display = 'block';
    featuredSection.style.display = 'none';
    offersSection.style.display = 'none';
    searchResultsTitle.textContent = `Resultados para "${q}"`;
    renderProducts(allFilteredContainer, filtered);
  });

  const showDefaultSections = () => {
    featuredSection.style.display = 'block';
    offersSection.style.display = 'block';
    filteredSection.style.display = 'none';
    renderProducts(featuredContainer, productData.filter(p => p.featured));
    renderProducts(offersGrid, productData.filter(p => p.isOffer));
  };

  // manejo de categorías (evento delegado)
  categoryCarousel.addEventListener('click', (ev) => {
    const img = ev.target.closest('.category-image');
    if (!img) return;
    const cat = img.dataset.category;
    searchInput.value = '';
    if (cat === '__all') {
      showDefaultSections();
      return;
    }
    const filtered = productData.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    filteredSection.style.display = 'block';
    featuredSection.style.display = 'none';
    offersSection.style.display = 'none';
    searchResultsTitle.textContent = cat;
    renderProducts(allFilteredContainer, filtered);
  });

  // draggable carousel (mouse + touch)
  (function makeCarouselDraggable(){
    let isDown=false,startX,scrollLeft;
    categoryCarousel.addEventListener('mousedown', (e)=>{
      isDown=true;categoryCarousel.classList.add('grabbing');startX=e.pageX-categoryCarousel.offsetLeft;scrollLeft=categoryCarousel.scrollLeft;
    });
    window.addEventListener('mouseup', ()=>{isDown=false;categoryCarousel.classList.remove('grabbing')});
    categoryCarousel.addEventListener('mousemove', (e)=>{ if(!isDown) return; e.preventDefault(); const x=e.pageX-categoryCarousel.offsetLeft; const walk=(x-startX)*1.5; categoryCarousel.scrollLeft = scrollLeft - walk;});
    // touch
    categoryCarousel.addEventListener('touchstart',(e)=>{ startX = e.touches[0].pageX - categoryCarousel.offsetLeft; scrollLeft = categoryCarousel.scrollLeft; });
    categoryCarousel.addEventListener('touchmove',(e)=>{ const x = e.touches[0].pageX - categoryCarousel.offsetLeft; const walk=(x-startX)*1.2; categoryCarousel.scrollLeft = scrollLeft - walk; });
  })();

  // abrir modal producto
  document.addEventListener('click', (e) => {
    // abrir modal cuando clic en imagen
    if (e.target.closest('.modal-trigger')) {
      const id = e.target.dataset.id;
      openProductModal(id);
      return;
    }

    if (e.target.id === 'modal-add-to-cart-btn') {
      const qty = Math.max(1, parseInt(qtyInput.value) || 1);
      addToCart(currentProduct.id, qty);
      closeModal(productModal);
      return;
    }

    if (e.target.classList.contains('close-button') || e.target.classList.contains('close-cart-btn')) {
      closeModal(productModal);
      closeModal(cartModal);
    }
  });

  // abrir modal producto por id
  function openProductModal(id) {
    const product = productData.find(p => p.id === id);
    if (!product) return;
    currentProduct = product;
    modalProductName.textContent = product.name;
    modalProductDescription.textContent = product.description;
    modalProductPrice.textContent = `$${money(product.price)}`;
    qtyInput.value = 1;
    modalAddToCartBtn.dataset.id = product.id;
    updateCarousel(product.image || []);
    showModal(productModal);
  }

  // modal helpers
  function showModal(modal) { modal.style.display = 'block'; modal.setAttribute('aria-hidden','false'); }
  function closeModal(modal) { modal.style.display = 'none'; modal.setAttribute('aria-hidden','true'); }

  // carousel modal
  function updateCarousel(images){
    carouselImagesContainer.innerHTML = '';
    if(!images || images.length===0){
      carouselImagesContainer.innerHTML = `<div class="carousel-image" style="display:flex;align-items:center;justify-content:center;background:#f3f3f3">Sin imagen</div>`;
      return;
    }
    images.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'carousel-image';
      carouselImagesContainer.appendChild(img);
    });
    currentImageIndex = 0;
    carouselImagesContainer.style.transform = `translateX(0)`;
  }

  prevBtn.addEventListener('click', () => {
    if (currentImageIndex > 0) currentImageIndex--;
    updateCarouselPosition();
  });
  nextBtn.addEventListener('click', () => {
    const imgs = carouselImagesContainer.querySelectorAll('.carousel-image');
    if (currentImageIndex < imgs.length - 1) currentImageIndex++;
    updateCarouselPosition();
  });
  function updateCarouselPosition(){
    const w = carouselImagesContainer.clientWidth;
    const imgs = carouselImagesContainer.querySelectorAll('.carousel-image');
    if (imgs.length === 0) return;
    const imgWidth = imgs[0].clientWidth || carouselImagesContainer.clientWidth;
    carouselImagesContainer.style.transform = `translateX(-${currentImageIndex * imgWidth}px)`;
  }
  // responsive recompute on resize
  window.addEventListener('resize', updateCarouselPosition);

  // carrito
  function updateCart(){
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Tu carrito está vacío.</p>';
      cartBadge.style.display = 'none';
      cartBadge.textContent = '0';
      cartTotalElement.textContent = money(0);
      return;
    }
    let total = 0;
    let totalItems = 0;
    cart.forEach((item, idx) => {
      total += item.price * item.qty;
      totalItems += item.qty;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
  <div style="display:flex;align-items:center;gap:8px;">
    <img src="${item.image}" alt="${item.name}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;">
    <div>
      <strong>${item.name}</strong>
      <div style="font-size:.9rem;color:#666">${item.qty} x $${money(item.price)}</div>
    </div>
  </div>
  <div class="controls">
    <button class="qty-btn" data-idx="${idx}" data-op="dec">-</button>
    <button class="qty-btn" data-idx="${idx}" data-op="inc">+</button>
  </div>
`;

      cartItemsContainer.appendChild(div);
    });
    cartBadge.style.display = 'flex';
    cartBadge.textContent = String(totalItems);
    cartTotalElement.textContent = money(total);
  }

  // add to cart
  function addToCart(id, qty=1){
    const p = productData.find(x => x.id === id);
    if (!p) return;
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty += qty;
    else cart.push({ id: p.id, name: p.name, price: p.price, qty, image: p.image[0] });
    updateCart();
  }

  // cart controls (increment/decrement)
  cartItemsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-idx]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx,10);
    const op = btn.dataset.op;
    if (op === 'inc') cart[idx].qty++;
    if (op === 'dec') {
      cart[idx].qty--;
      if (cart[idx].qty <= 0) cart.splice(idx,1);
    }
    updateCart();
  });

  // abrir carrito
  cartBtn.addEventListener('click', () => {
    showModal(cartModal);
    updateCart();
  });

productModal.addEventListener('click', (e) => {
  // si el click no está dentro de la tarjeta (.modal-card) se cierra
  if (!e.target.closest('.modal-card')) closeModal(productModal);
});

cartModal.addEventListener('click', (e) => {
  // si el click no está dentro de la tarjeta del carrito (.cart-modal-card) se cierra
  if (!e.target.closest('.cart-modal-card')) closeModal(cartModal);
});

// cerrar con los botones X (asegura que existan listeners directos)
document.querySelectorAll('.close-button').forEach(btn =>
  btn.addEventListener('click', () => closeModal(productModal))
);
document.querySelectorAll('.close-cart-btn').forEach(btn =>
  btn.addEventListener('click', () => closeModal(cartModal))
);




  // checkout -> whatsapp
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) { alert('El carrito está vacío'); return; }
    const whatsappNumber = '573104650255'; // reemplaza por tu número sin signos ni espacios
    let message = 'Hola,%20quisiera%20hacer%20el%20siguiente%20pedido:%0A%0A';
    let total = 0;
    cart.forEach(item => {
      message += `- ${encodeURIComponent(item.name)} x${item.qty} = $${money(item.price * item.qty)}%0A`;
      total += item.price * item.qty;
    });
    message += `%0ATotal:%20$${money(total)}`;
    const link = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(link, '_blank');
  });

  // install prompt (PWA)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBanner.hidden = false;
  });
  installPromptBtn && installPromptBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    installBanner.hidden = true;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
  });
  installCloseBtn && installCloseBtn.addEventListener('click', () => installBanner.hidden = true);

  // init
  renderProducts(featuredContainer, productData.filter(p => p.featured));
  renderProducts(offersGrid, productData.filter(p => p.isOffer));
  generateCategoryCarousel();
  updateCart();
});
