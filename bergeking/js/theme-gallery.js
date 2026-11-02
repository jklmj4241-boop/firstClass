const themeSelect = document.querySelector("#theme-select");
const previewFrame = document.querySelector("#login-preview");
const themeCards = document.querySelectorAll(".theme-card");

function changeTheme(theme) {
    themeSelect.value = theme;
    previewFrame.src = `login.html?theme=${encodeURIComponent(theme)}`;

    themeCards.forEach((card) => {
        const isSelected = card.dataset.theme === theme;
        card.setAttribute("aria-pressed", String(isSelected));
    });
}

themeSelect.addEventListener("change", (event) => {
    changeTheme(event.target.value);
});

themeCards.forEach((card) => {
    card.addEventListener("click", () => {
        changeTheme(card.dataset.theme);
    });
});

changeTheme("original");
