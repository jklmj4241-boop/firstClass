(() => {
  const tabs = document.querySelectorAll('.category-tab');
  const cards = [...document.querySelectorAll('.catalog-card')];
  const searchForm = document.querySelector('#product-search-form');
  const searchInput = document.querySelector('#product-search-input');
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

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // 처음 클릭하면 검색창을 펼치고 입력할 수 있도록 포커스를 이동합니다.
    if (!searchForm.classList.contains('is-open')) {
      searchForm.classList.add('is-open');
      searchForm.querySelector('button').setAttribute('aria-label', '제품 검색');
      searchInput.focus();
      return;
    }

    updateProducts();
  });

  searchInput.addEventListener('input', updateProducts);

  // 검색창이 열린 상태에서 Escape를 누르면 입력창을 닫습니다.
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      searchForm.classList.remove('is-open');
      searchInput.value = '';
      searchForm.querySelector('button').setAttribute('aria-label', '검색창 열기');
      updateProducts();
      searchForm.querySelector('button').focus();
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
