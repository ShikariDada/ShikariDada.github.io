/**
 * Dark mode toggle — matches stephango.com behavior
 * Uses localStorage + prefers-color-scheme fallback
 */
(function () {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", function () {
    const isDark = document.body.classList.toggle("theme-dark");
    localStorage.theme = isDark ? "dark" : "light";
  });
})();
