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
      selectedCategory = tab.dataset.filter;
      tabs.forEach((item) => {
        const isSelected = item === tab;
        item.classList.toggle('is-active', isSelected);
        item.setAttribute('aria-pressed', String(isSelected));
      });
      updateProducts();
    });
  });

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    updateProducts();
  });
  searchInput.addEventListener('input', updateProducts);

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
