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
  const loadMoreButton = document.querySelector('#product-load-more');
  const PAGE_SIZE = 10;
  let visibleLimit = PAGE_SIZE;
  let selectedCategory = 'all';
  let selectedInitial = '';
  let selectedSubcategory = '';
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

  function updateProducts(resetLimit = false) {
    if (resetLimit) visibleLimit = PAGE_SIZE;

    const matchedCards = cards.filter((card) => {
      const categoryMatches = selectedCategory === 'all'
        || (selectedCategory === 'new' && card.dataset.featured === 'true')
        || card.dataset.category === selectedCategory;
      const initialMatches = !selectedInitial || getInitial(card.dataset.name) === selectedInitial;
      const searchableText = (card.dataset.name + ' ' + card.textContent).toLocaleLowerCase();
      const keywordMatches = !searchKeyword || searchableText.includes(searchKeyword);
      return categoryMatches && keywordMatches && initialMatches;
    });

    matchedCards.sort((a, b) => {
      if (selectedSort === 'name') return a.dataset.name.localeCompare(b.dataset.name, 'ko');
      return cards.indexOf(a) - cards.indexOf(b);
    });

    const grid = document.querySelector('#product-grid');
    cards.forEach((card) => { card.hidden = true; });
    matchedCards.forEach((card, index) => {
      card.hidden = index >= visibleLimit;
      grid.appendChild(card);
    });

    // 전체 검색 결과 수를 유지하고, 화면에는 한 번에 최대 10개만 표시합니다.
    count.textContent = String(matchedCards.length);
    emptyMessage.hidden = matchedCards.length !== 0;

    if (loadMoreButton) {
      const hasMore = matchedCards.length > visibleLimit;
      loadMoreButton.hidden = !hasMore;
      loadMoreButton.textContent = hasMore
        ? '제품 더보기 (' + Math.min(visibleLimit, matchedCards.length) + ' / ' + matchedCards.length + ')'
        : '제품 더보기';
    }
  }

  searchInput.addEventListener('input', () => {
    searchKeyword = searchInput.value.trim().toLocaleLowerCase();
    updateProducts(true);
  });

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    searchKeyword = searchInput.value.trim().toLocaleLowerCase();
    updateProducts(true);
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
    });
  });

  initialButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const next = button.dataset.initial;
      selectedInitial = selectedInitial === next ? '' : next;
      subcategoryButtons.forEach((item) => {
        item.classList.remove('is-active');
        item.setAttribute('aria-pressed', 'false');
      });
      initialButtons.forEach((item) => {
        const active = item.dataset.initial === selectedInitial;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateProducts(true);
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
      updateProducts(true);
    });
  });

  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      visibleLimit += PAGE_SIZE;
      updateProducts();
    });
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      selectedCategory = 'all';
      selectedInitial = '';
      selectedSubcategory = '';
      selectedSort = 'default';
      searchKeyword = '';
      searchInput.value = '';
      tabs.forEach((item) => {
        const active = item.dataset.filter === 'all';
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
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
      updateProducts(true);
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

  updateProducts(true);
})();
