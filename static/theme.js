/**
 * Dark mode toggle — matches stephango.com behavior
 * Targets documentElement (html) to avoid flash of wrong theme
 */
(function () {
  var toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", function () {
    var isDark = document.documentElement.classList.toggle("theme-dark");
    try {
      localStorage.theme = isDark ? "dark" : "light";
    } catch (e) {}
  });
})();
