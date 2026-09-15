(() => {
  const group = document.querySelector('[role="radiogroup"]');
  const check = document.querySelector('[data-check-answer]');
  const selectionStatus = document.querySelector('[data-selection-status]');

  if (group) {
    const options = [...group.querySelectorAll('[role="radio"]')];
    if (document.querySelector('.feedback-card')) {
      options.forEach((option) => {
        option.disabled = true;
        option.setAttribute('aria-disabled', 'true');
      });
    }
    options.forEach((option) => {
      option.addEventListener('click', () => {
        options.forEach((candidate) => {
          candidate.setAttribute('aria-checked', 'false');
          candidate.tabIndex = -1;
          candidate.classList.remove('is-selected');
          candidate.querySelector('.answer-option__state')?.remove();
        });

        option.setAttribute('aria-checked', 'true');
        option.tabIndex = 0;
        option.classList.add('is-selected');
        option.insertAdjacentHTML('afterbegin', '<span class="answer-option__state" aria-hidden="true">✓</span>');

        if (selectionStatus) selectionStatus.textContent = `${option.getAttribute('aria-label')} selected`;
        if (check) {
          check.disabled = false;
          check.setAttribute('aria-disabled', 'false');
          check.dataset.next = option.dataset.correct === 'true' ? check.dataset.correctPath : check.dataset.incorrectPath;
        }
      });
    });
  }

  check?.addEventListener('click', () => {
    if (!check.disabled && check.dataset.next) window.location.href = check.dataset.next;
  });

  document.querySelector('[data-hint-toggle]')?.addEventListener('click', (event) => {
    const hint = document.querySelector('[data-hint]');
    if (!hint) return;
    const isHidden = hint.hidden;
    hint.hidden = !isHidden;
    event.currentTarget.setAttribute('aria-expanded', String(isHidden));
  });
})();
