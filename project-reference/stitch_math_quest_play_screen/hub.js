(() => {
  document.querySelectorAll('[role="switch"]').forEach((control) => {
    control.addEventListener('click', () => {
      const next = control.getAttribute('aria-checked') !== 'true';
      control.setAttribute('aria-checked', String(next));
    });
  });
})();
