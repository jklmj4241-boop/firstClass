(() => {
  const tabs = document.querySelectorAll('.category-tab');
  const cards = [...document.querySelectorAll('.catalog-card')];
  const searchForm = document.querySelector('#product-search-form');
  const searchInput = document.querySelector('#product-search-input');
  const searchTrigger = document.querySelector('#product-search-trigger');

  function syncSearchTrigger() {
    const hasQuery = searchInput.value.length > 0;
    searchTrigger.dataset.clear = String(hasQuery);
    searchTrigger.setAttribute('aria-label', hasQuery ? '검색어 지우기' : '제품 검색');
    searchTrigger.innerHTML = hasQuery
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#D9D9D9" stroke="none"></circle><path d="M8.5 8.5l7 7m0-7l-7 7" fill="none" stroke="#888888" stroke-width="1.8" stroke-linecap="round"></path></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"></circle><path d="m16 16 5 5"></path></svg>';
  }

  syncSearchTrigger();
  searchTrigger.addEventListener('click', (event) => {
    if (!searchInput.value.length) {
      // 검색어가 없을 때 돋보기를 누르면 검색창을 활성화합니다.
      event.preventDefault();
      searchInput.focus();
      return;
    }

    // 검색어가 있을 때는 X 버튼으로 검색어를 지웁니다.
    event.preventDefault();
    searchInput.value = '';
    searchKeyword = '';
    syncSearchTrigger();
    updateProducts(true);
    searchInput.blur();
  });
  const count = document.querySelector('#visible-count');
  const emptyMessage = document.querySelector('#empty-message');
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  const initialButtons = [...document.querySelectorAll('[data-initial]')];
  const subcategoryButtons = [...document.querySelectorAll('[data-subcategory]')];
  const sortButtons = [...document.querySelectorAll('[data-sort]')];
  const resetButton = document.querySelector('#filter-reset');
  const pagination = document.querySelector('#product-pagination');
  const paginationNumbers = document.querySelector('#pagination-numbers');
  const PAGE_SIZE = 10;
  let currentPage = 1;
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

  function updateProducts(resetPage = false) {
    if (resetPage) currentPage = 1;

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

    const totalPages = Math.ceil(matchedCards.length / PAGE_SIZE);
    currentPage = Math.min(Math.max(currentPage, 1), Math.max(totalPages, 1));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageCards = matchedCards.slice(startIndex, startIndex + PAGE_SIZE);
    const grid = document.querySelector('#product-grid');

    cards.forEach((card) => { card.hidden = true; });
    pageCards.forEach((card) => {
      card.hidden = false;
      grid.appendChild(card);
    });

    count.textContent = String(matchedCards.length);
    emptyMessage.hidden = matchedCards.length !== 0;

    if (pagination && paginationNumbers) {
      pagination.hidden = totalPages <= 1;
      paginationNumbers.innerHTML = '';

      for (let page = 1; page <= totalPages; page += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'pagination-number';
        button.textContent = String(page);
        button.setAttribute('aria-label', page + '페이지');
        button.setAttribute('aria-current', page === currentPage ? 'page' : 'false');
        button.classList.toggle('is-active', page === currentPage);
        button.addEventListener('click', () => {
          currentPage = page;
          updateProducts();
        });
        paginationNumbers.appendChild(button);
      }

      pagination.querySelectorAll('[data-page-action]').forEach((button) => {
        const action = button.dataset.pageAction;
        button.disabled =
          (action === 'first' || action === 'prev') ? currentPage === 1 :
          (action === 'next' || action === 'last') ? currentPage === totalPages : true;
      });
    }
  }

  searchInput.addEventListener('input', () => {
    searchKeyword = searchInput.value.trim().toLocaleLowerCase();
    syncSearchTrigger();
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

  if (pagination) {
    pagination.addEventListener('click', (event) => {
      const button = event.target.closest('[data-page-action]');
      if (!button || button.disabled) return;

      const totalPages = Math.ceil(
        cards.filter((card) => {
          const categoryMatches = selectedCategory === 'all'
            || (selectedCategory === 'new' && card.dataset.featured === 'true')
            || card.dataset.category === selectedCategory;
          const initialMatches = !selectedInitial || getInitial(card.dataset.name) === selectedInitial;
          const searchableText = (card.dataset.name + ' ' + card.textContent).toLocaleLowerCase();
          const keywordMatches = !searchKeyword || searchableText.includes(searchKeyword);
          return categoryMatches && keywordMatches && initialMatches;
        }).length / PAGE_SIZE
      );

      const action = button.dataset.pageAction;
      if (action === 'first') currentPage = 1;
      if (action === 'prev') currentPage -= 1;
      if (action === 'next') currentPage += 1;
      if (action === 'last') currentPage = totalPages;
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
      syncSearchTrigger();
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
