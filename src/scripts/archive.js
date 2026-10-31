const buttons = document.querySelectorAll("[data-filter]");
const rows = document.querySelectorAll("[data-project-row]");
const empty = document.querySelector("[data-filter-empty]");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    let visibleCount = 0;

    buttons.forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });

    rows.forEach((row) => {
      const rowFilters = (row.dataset.filters || "").split("|").filter(Boolean);
      const match = filter === "all" || rowFilters.includes(filter);
      row.hidden = !match;
      if (match) visibleCount += 1;
    });

    if (empty) {
      empty.hidden = visibleCount !== 0;
    }
  });
});
