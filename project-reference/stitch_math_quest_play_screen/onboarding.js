(() => {
  const consent = document.querySelector('[data-consent]');
  const continueButton = document.querySelector('[data-consent-continue]');
  consent?.addEventListener('change', () => {
    continueButton.disabled = !consent.checked;
    continueButton.setAttribute('aria-disabled', String(!consent.checked));
  });

  const group = document.querySelector('[data-mascot-group]');
  group?.querySelectorAll('[role="radio"]').forEach((option) => {
    option.addEventListener('click', () => {
      group.querySelectorAll('[role="radio"]').forEach((item) => {
        item.setAttribute('aria-checked', 'false');
        item.tabIndex = -1;
        item.classList.remove('is-selected');
      });
      option.setAttribute('aria-checked', 'true');
      option.tabIndex = 0;
      option.classList.add('is-selected');
    });
  });
})();
