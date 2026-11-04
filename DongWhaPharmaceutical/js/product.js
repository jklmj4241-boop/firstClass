(() => {
  const tabs = document.querySelectorAll('.category-tab');
  const cards = [...document.querySelectorAll('.catalog-card')];
  const searchForm = document.querySelector('#product-search-form');
  const searchInput = document.querySelector('#product-search-input');
  const searchWrap = document.querySelector('#product-search-wrap');
  const searchTrigger = document.querySelector('#product-search-trigger');
  const searchOptions = document.querySelector('#product-search-options');
  const count = document.querySelector('#visible-count');
  const emptyMessage = document.querySelector('#empty-message');
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  let selectedCategory = 'all';

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
    const keyword = searchInput.value.trim().toLocaleLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const categoryMatches = selectedCategory === 'all'
        ? card.dataset.featured === 'true'
        : card.dataset.category === selectedCategory;
      const searchableText = (card.dataset.name + ' ' + card.textContent).toLocaleLowerCase();
      const keywordMatches = !keyword || searchableText.includes(keyword);
      const shouldShow = categoryMatches && keywordMatches;

      card.hidden = !shouldShow;
      if (shouldShow) visible += 1;
    });

    count.textContent = String(visible);
    emptyMessage.hidden = visible !== 0;
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      selectCategory(tab.dataset.filter);
      const hashByCategory = {
        all: 'new-products',
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
      '#new-products': 'all',
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

  function openSearchOptions() {
    searchOptions.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
    searchTrigger.setAttribute('aria-expanded', 'true');
  }

  function closeSearchOptions() {
    searchOptions.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    searchTrigger.setAttribute('aria-expanded', 'false');
  }

  // 검색창 또는 돋보기 버튼을 누르면 와이어프레임의 검색 방법이 나타납니다.
  searchInput.addEventListener('click', () => {
    if (searchInput.readOnly) openSearchOptions();
  });
  searchTrigger.addEventListener('click', () => {
    if (searchInput.readOnly) {
      openSearchOptions();
    } else {
      searchForm.requestSubmit();
    }
  });

  searchOptions.querySelectorAll('[data-search-mode]').forEach((option) => {
    option.addEventListener('click', () => {
      const mode = option.dataset.searchMode;
      const placeholders = {
        name: '찾으시는 제품명을 입력하세요',
        symptom: '효능 또는 증상을 입력하세요',
        group: '찾으시는 제품군을 입력하세요'
      };
      searchInput.placeholder = placeholders[mode];
      searchInput.readOnly = false;
      closeSearchOptions();
      searchInput.focus();
    });
  });

  document.addEventListener('click', (event) => {
    if (!searchWrap.contains(event.target)) closeSearchOptions();
  });

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    updateProducts();
  });

  searchInput.addEventListener('input', updateProducts);

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeSearchOptions();
      searchInput.blur();
    }
  });

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      menuToggle.setAttribute('aria-label', isExpanded ? '메뉴 열기' : '메뉴 닫기');
      mobileMenu.hidden = isExpanded;
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.hidden = true;
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', '메뉴 열기');
      });
    });
  }

  updateProducts();
})();
