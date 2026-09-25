// ---- Shared Custom Select (styled dropdown wrapper around a native <select>) ----
// Moved out of app.js so account.html can reuse it too, instead of forking
// its own copy -- keeps the native <select> as the source of truth (existing
// .value reads/writes and "change" listeners elsewhere keep working
// untouched) while presenting a rounded, app-styled trigger + option list
// instead of the OS-native popup. CSS lives in tokens.css.
//
// Wrapped in an IIFE (not a bare top-level function) so this file only
// exposes window.DVCUI.initCustomSelect -- a plain top-level function
// declaration here would leak a same-named global that collides with
// app.js's own `const initCustomSelect = window.DVCUI.initCustomSelect`
// (mixing a function declaration and a const for one name in the same
// non-module script scope is a SyntaxError, not a silent shadow).
(function () {
  function initCustomSelect(selectEl) {
    const wrapper = selectEl.closest(".custom-select");
    const trigger = wrapper.querySelector(".custom-select-trigger");
    const valueEl = trigger.querySelector(".custom-select-value");
    const dropdown = wrapper.querySelector(".custom-select-dropdown");

    function render() {
      valueEl.textContent = selectEl.options[selectEl.selectedIndex]?.textContent || "";
      dropdown.innerHTML = Array.from(selectEl.options).map(opt => `
        <div class="custom-select-option${opt.value === selectEl.value ? " selected" : ""}" data-value="${opt.value}">${opt.textContent}</div>
      `).join("");
    }

    trigger.addEventListener("click", () => {
      const willOpen = !wrapper.classList.contains("open");
      document.querySelectorAll(".custom-select.open").forEach(el => el.classList.remove("open"));
      if (willOpen) {
        render();
        wrapper.classList.add("open");
      }
    });

    dropdown.addEventListener("click", (e) => {
      const opt = e.target.closest(".custom-select-option");
      if (!opt) return;
      selectEl.value = opt.dataset.value;
      selectEl.dispatchEvent(new Event("change", { bubbles: true }));
      wrapper.classList.remove("open");
      render();
    });

    selectEl._customSelectRender = render;
    render();
  }

  document.addEventListener("click", (e) => {
    document.querySelectorAll(".custom-select.open").forEach(el => {
      if (!el.contains(e.target)) el.classList.remove("open");
    });
  });

  window.DVCUI = { initCustomSelect };
})();
