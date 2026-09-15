(() => {
  const variants = [
    { key: "A", name: "Tutor stage" },
    { key: "B", name: "Workshop journey" },
    { key: "C", name: "Focus theater" },
  ];

  const readVariant = () => {
    const requested = new URLSearchParams(window.location.search).get("variant")?.toUpperCase();
    return variants.some(({ key }) => key === requested) ? requested : "A";
  };

  const render = (key, replace = true) => {
    document.querySelectorAll("[data-variant]").forEach((section) => {
      section.hidden = section.dataset.variant !== key;
    });

    const current = variants.find(({ key: candidate }) => candidate === key) || variants[0];
    document.querySelector("[data-variant-label]").textContent = `${current.key} · ${current.name}`;
    document.title = `${current.name} — Web Play Home Prototype`;
    document.body.dataset.currentVariant = key;

    const url = new URL(window.location.href);
    url.searchParams.set("variant", key);
    window.history[replace ? "replaceState" : "pushState"]({}, "", url);
  };

  const cycle = (direction) => {
    const currentIndex = variants.findIndex(({ key }) => key === readVariant());
    const nextIndex = (currentIndex + direction + variants.length) % variants.length;
    render(variants[nextIndex].key, false);
  };

  document.querySelector("[data-previous]").addEventListener("click", () => cycle(-1));
  document.querySelector("[data-next]").addEventListener("click", () => cycle(1));
  window.addEventListener("popstate", () => render(readVariant()));
  window.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    if (event.target.matches("input, textarea, select, [contenteditable]")) return;
    event.preventDefault();
    cycle(event.key === "ArrowRight" ? 1 : -1);
  });

  render(readVariant());
})();
