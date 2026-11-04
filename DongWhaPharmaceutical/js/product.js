(() => {
  const tabs = document.querySelectorAll('.category-tab');
  const cards = [...document.querySelectorAll('.catalog-card')];
  const searchForm = document.querySelector('#product-search-form');
  const searchInput = document.querySelector('#product-search-input');
  const searchTrigger = document.querySelector('#product-search-trigger');
  const searchModal = document.querySelector('#product-search-modal');
  const searchModalForm = document.querySelector('#product-search-modal-form');
  const searchModalInput = document.querySelector('#product-search-modal-input');
  const searchClose = document.querySelector('#product-search-close');
  const searchReset = document.querySelector('#search-reset');
  const searchTypeTabs = document.querySelectorAll('[data-search-type]');
  const searchInitials = document.querySelectorAll('[data-initial]');
  let modalType = 'all';
  let selectedInitial = '';
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

  const hangulInitials = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  function getInitials(value) {
    return [...value].map((char) => {
      const code = char.charCodeAt(0) - 44032;
      if (code < 0 || code > 11171) return char;
      return hangulInitials[Math.floor(code / 588)];
    }).join('');
  }

  function openSearchModal() {
    searchModal.hidden = false;
    searchInput.setAttribute('aria-expanded', 'true');
    searchTrigger.setAttribute('aria-expanded', 'true');
    searchModalInput.focus();
  }
  function closeSearchModal() {
    searchModal.hidden = true;
    searchInput.setAttribute('aria-expanded', 'false');
    searchTrigger.setAttribute('aria-expanded', 'false');
    searchTrigger.focus();
  }
  searchInput.addEventListener('click', openSearchModal);
  searchTrigger.addEventListener('click', openSearchModal);
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    openSearchModal();
  });
  searchClose.addEventListener('click', closeSearchModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !searchModal.hidden) closeSearchModal();
  });

  function updateSearchResults() {
    const keyword = searchModalInput.value.trim().toLocaleLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const category = card.dataset.category || '';
      const typeMatches = modalType === 'new' ? card.dataset.featured === 'true' : category === modalType;
      const text = (card.dataset.name + ' ' + card.textContent).toLocaleLowerCase();
      const keywordMatches = !keyword || text.includes(keyword);
      const initialMatches = !selectedInitial || getInitials(card.dataset.name || card.textContent).startsWith(selectedInitial);
      const show = typeMatches && keywordMatches && initialMatches;
      card.hidden = !show;
      if (show) visible += 1;
    });
    count.textContent = String(visible);
    emptyMessage.hidden = visible !== 0;
  }

  searchModalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    searchInput.value = searchModalInput.value;
    selectedCategory = modalType === 'new' ? 'all' : modalType;
    tabs.forEach((tab) => {
      const active = tab.dataset.filter === selectedCategory;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-pressed', String(active));
    });
    updateProducts();
    closeSearchModal();
  });
  searchModalInput.addEventListener('input', updateSearchResults);

  searchTypeTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      modalType = tab.dataset.searchType;
      searchTypeTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      updateSearchResults();
    });
  });

  searchInitials.forEach((button) => {
    button.addEventListener('click', () => {
      const wasActive = button.classList.contains('is-active');
      searchInitials.forEach((item) => item.classList.remove('is-active'));
      selectedInitial = wasActive ? '' : button.dataset.initial;
      if (!wasActive) button.classList.add('is-active');
      updateSearchResults();
    });
  });

  searchReset.addEventListener('click', () => {
    modalType = 'new';
    selectedCategory = 'all';
    selectedInitial = '';
    searchModalInput.value = '';
    searchInput.value = '';
    searchTypeTabs.forEach((item) => {
      const active = item.dataset.searchType === 'new';
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
        searchInitials.forEach((item) => item.classList.remove('is-active'));
    updateProducts();
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
