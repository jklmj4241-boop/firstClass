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

  // 소다활 상세정보를 뉴스 페이지처럼 현재 화면 위에 레이어로 표시합니다.
  const sodaCard = cards.find((card) => card.dataset.name === '소다활');
  if (sodaCard) {
    const detailLayer = document.createElement('div');
    detailLayer.className = 'product-detail-overlay';
    detailLayer.hidden = true;
    detailLayer.innerHTML = `
      <section class="product-detail-panel" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
        <button type="button" class="product-detail-close" aria-label="상세정보 닫기">×</button>
        <div class="product-detail-modal-body">
          <div class="product-detail-modal-visual"><img src="DWP-img/DWP01.png" alt="소다활 제품 이미지"></div>
          <div class="product-detail-modal-info">
            <p class="product-detail-modal-category">음료</p>
            <h2 id="product-detail-title">소다활</h2>
            <div class="product-detail-modal-table">
              <div class="product-detail-modal-row"><h3>제품분류</h3><p>식품 · 음료 &gt; 음료</p></div>
              <div class="product-detail-modal-row"><h3>제품소개</h3><div><p>명치까지 뻥! 먹취해소 소다활</p><p>ZERO 슈가 · 칼로리 · 카페인</p><p>입안은 깔끔하게 채우는 상큼한 매실/레몬라임맛 제로 탄산음료 소다활!</p><p>부채표 노하우 까스활 코어 농축액과 쿨링향으로 속까지 시원한 스파클링</p></div></div>
              <div class="product-detail-modal-row"><h3>섭취방법</h3><p>500 mL(pet), 355mL(can) / 기호에 맞게 섭취</p></div>
              <div class="product-detail-modal-row"><h3>포장단위</h3><div><p>패트 : 500mL/패트병, 6병(중박스), 24병(대박스)</p><p>캔 : 355mL/캔, 6캔(중박스), 24캔(대박스)</p></div></div>
              <div class="product-detail-modal-row"><h3>성분</h3><div class="product-detail-modal-ingredients">
                <p class="ingredient-heading">[PET] 1병(500mL) 당</p>
                <p class="ingredient-line"><span>까스활 코어 농축액</span><span>10mg</span></p>
                <p class="ingredient-line"><span>ㄴ 계피 엑스</span><span>6.3mg(63.1%)</span></p>
                <p class="ingredient-line"><span>ㄴ 건생강 엑스</span><span>3.2mg(31.6%)</span></p>
                <p class="ingredient-line"><span>ㄴ 소두구추출물</span><span>0.5mg(5.3%)</span></p>
                <p class="ingredient-heading second">[Can] 1캔(355mL) 당</p>
                <p class="ingredient-line"><span>까스활 코어 농축액</span><span>7mg</span></p>
                <p class="ingredient-line"><span>ㄴ 계피 엑스</span><span>4.4mg(63.1%)</span></p>
                <p class="ingredient-line"><span>ㄴ 건생강 엑스</span><span>2.2mg(31.6%)</span></p>
                <p class="ingredient-line"><span>ㄴ 소두구추출물</span><span>0.4mg(5.3%)</span></p>
              </div></div>
            </div>
          </div>
        </div>
      </section>`;
    document.body.appendChild(detailLayer);
    const closeDetail = () => {
      detailLayer.hidden = true;
      document.body.classList.remove('product-detail-open');
      document.documentElement.classList.remove('product-detail-open');
      sodaCard.focus();
    };
    const openDetail = () => {
      detailLayer.hidden = false;
      document.body.classList.add('product-detail-open');
      document.documentElement.classList.add('product-detail-open');
      detailLayer.querySelector('.product-detail-close').focus();
    };
    detailLayer.querySelector('.product-detail-close').addEventListener('click', closeDetail);
    detailLayer.addEventListener('click', (event) => {
      if (event.target === detailLayer) closeDetail();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !detailLayer.hidden) closeDetail();
    });
    sodaCard.classList.add('is-clickable');
    sodaCard.setAttribute('role', 'button');
    sodaCard.setAttribute('tabindex', '0');
    sodaCard.setAttribute('aria-haspopup', 'dialog');
    sodaCard.setAttribute('aria-label', '소다활 상세정보 보기');
    sodaCard.addEventListener('click', openDetail);
    sodaCard.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDetail();
      }
    });
  }

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
