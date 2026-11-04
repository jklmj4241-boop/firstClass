(() => {
  const tabs = document.querySelectorAll('.category-tab');
  const cards = [...document.querySelectorAll('.catalog-card')];
  const searchForm = document.querySelector('#product-search-form');
  const searchInput = document.querySelector('#product-search-input');
  const count = document.querySelector('#visible-count');
  const emptyMessage = document.querySelector('#empty-message');
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  const initialButtons = [...document.querySelectorAll('[data-initial]')];
  const subcategoryButtons = [...document.querySelectorAll('[data-subcategory]')];
  const sortButtons = [...document.querySelectorAll('[data-sort]')];
  const resetButton = document.querySelector('#filter-reset');
  let selectedCategory = 'all';
  let selectedSubcategory = '';
  let selectedInitial = '';
  let selectedSort = 'default';
  let searchKeyword = '';

  const initialConsonants = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  function getInitial(text) {
    const first = (text || '').trim().charAt(0);
    const code = first.charCodeAt(0) - 44032;
    if (code < 0 || code > 11171) return '';
    return initialConsonants[Math.floor(code / 588)] || '';
  }

  function selectCategory(category) {
    const target = [...tabs].find((tab) => tab.dataset.filter === category);
    if (!target) return;
    selectedCategory = category;
    tabs.forEach((item) => {
      const isSelected = item === target;
      item.classList.toggle('is-active', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });
    updateProducts();
  }

  function updateProducts() {
    let visible = 0;

    cards.forEach((card) => {
      const categoryMatches = selectedCategory === 'all'
        || (selectedCategory === 'new' && card.dataset.featured === 'true')
        || card.dataset.category === selectedCategory;
      const subcategoryMatches = !selectedSubcategory || card.dataset.subcategory === selectedSubcategory;
      const initialMatches = !selectedInitial || getInitial(card.dataset.name) === selectedInitial;
      const searchableText = (card.dataset.name + ' ' + card.textContent).toLocaleLowerCase();
      const keywordMatches = !searchKeyword || searchableText.includes(searchKeyword);
      const shouldShow = categoryMatches && subcategoryMatches && keywordMatches && initialMatches;

      card.hidden = !shouldShow;
      if (shouldShow) visible += 1;
    });

    count.textContent = String(visible);
    emptyMessage.hidden = visible !== 0;

    const grid = document.querySelector('#product-grid');
    const visibleCards = cards.filter((card) => !card.hidden);
    visibleCards.sort((a, b) => {
      if (selectedSort === 'name') return a.dataset.name.localeCompare(b.dataset.name, 'ko');
      return cards.indexOf(a) - cards.indexOf(b);
    });
    visibleCards.forEach((card) => grid.appendChild(card));
  }

  searchInput.addEventListener('input', () => {
    searchKeyword = searchInput.value.trim().toLocaleLowerCase();
    updateProducts();
  });

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    searchKeyword = searchInput.value.trim().toLocaleLowerCase();
    updateProducts();
  });

  subcategoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.subcategory;
      selectedSubcategory = selectedSubcategory === next ? '' : next;
      subcategoryButtons.forEach((item) => {
        const active = item.dataset.subcategory === selectedSubcategory;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateProducts();
    });
  });

  initialButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.initial;
      selectedInitial = selectedInitial === next ? '' : next;
      initialButtons.forEach((item) => {
        const active = item.dataset.initial === selectedInitial;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateProducts();
    });
  });

  sortButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedSort = button.dataset.sort;
      sortButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateProducts();
    });
  });

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      selectedCategory = 'all';
      selectedSubcategory = '';
      selectedInitial = '';
      selectedSort = 'default';
      searchKeyword = '';
      searchInput.value = '';
      tabs.forEach((item) => {
        const active = item.dataset.filter === 'all';
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      subcategoryButtons.forEach((item) => {
        item.classList.remove('is-active');
        item.setAttribute('aria-pressed', 'false');
      });
      initialButtons.forEach((item) => {
        item.classList.remove('is-active');
        item.setAttribute('aria-pressed', 'false');
      });
      sortButtons.forEach((item) => {
        const active = item.dataset.sort === 'default';
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      history.replaceState(null, '', location.pathname + location.search);
      updateProducts();
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      selectCategory(tab.dataset.filter);
      const hashByCategory = {
        all: 'product-list',
        new: 'new-products',
        general: 'general-medicine',
        prescription: 'prescription-medicine',
        health: 'health-lifestyle',
        other: 'other-products'
      };
      history.replaceState(null, '', '#' + hashByCategory[tab.dataset.filter]);
    });
  });

  function applyCategoryFromHash() {
    const categoryByHash = {
      '#new-products': 'new',
      '#general-medicine': 'general',
      '#prescription-medicine': 'prescription',
      '#health-lifestyle': 'health',
      '#other-products': 'other'
    };
    const category = categoryByHash[location.hash];
    if (category) selectCategory(category);
  }

  window.addEventListener('hashchange', applyCategoryFromHash);
  applyCategoryFromHash();

  const headerMain = document.querySelector('.header-main');
  const megaMenu = document.querySelector('.mega-menu');
  const mainNav = document.querySelector('.main-nav');
  const desktopQuery = window.matchMedia('(min-width: 1025px)');

  function closeDesktopMegaMenu() {
    if (!headerMain || !menuToggle) return;
    headerMain.classList.remove('mega-menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '메뉴 열기');
  }

  if (menuToggle && mobileMenu && headerMain && megaMenu && mainNav) {
    menuToggle.addEventListener('click', () => {
      if (desktopQuery.matches) {
        const isOpen = headerMain.classList.toggle('mega-menu-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
        return;
      }

      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      menuToggle.setAttribute('aria-label', isExpanded ? '메뉴 열기' : '메뉴 닫기');
      mobileMenu.hidden = isExpanded;
    });

    // PC에서는 메인 페이지와 동일하게 메가 메뉴를 표시합니다.
    [mainNav, megaMenu].forEach((area) => {
      area.addEventListener('mouseenter', () => {
        if (desktopQuery.matches) headerMain.classList.add('mega-menu-open');
      });
      area.addEventListener('mouseleave', (event) => {
        if (!desktopQuery.matches) return;
        const next = event.relatedTarget;
        if (next && (mainNav.contains(next) || megaMenu.contains(next) || menuToggle.contains(next))) return;
        closeDesktopMegaMenu();
      });
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.hidden = true;
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', '메뉴 열기');
      });
    });

    window.addEventListener('resize', () => {
      if (desktopQuery.matches) {
        mobileMenu.hidden = true;
        menuToggle.setAttribute('aria-expanded', String(headerMain.classList.contains('mega-menu-open')));
      } else {
        closeDesktopMegaMenu();
        menuToggle.setAttribute('aria-expanded', String(!mobileMenu.hidden));
      }
    });
  }

  updateProducts();
})();
