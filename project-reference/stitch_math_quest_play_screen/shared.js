(() => {
  document.documentElement.lang ||= "en";

  const prismPoses = {
    ready: {
      mouth: "M62 94 Q80 109 98 94",
      leftArm: "M35 83 Q18 79 15 62",
      rightArm: "M125 82 Q145 68 140 49",
      extra: '<path d="M142 42v-8m-4 4h8" stroke="#F97316" stroke-width="4" stroke-linecap="round"/>',
    },
    leading: {
      mouth: "M64 94 Q80 105 96 94",
      leftArm: "M35 84 Q20 90 13 103",
      rightArm: "M125 80 Q145 70 153 57",
      extra: '<circle cx="153" cy="55" r="4" fill="#F97316"/>',
    },
    thinking: {
      mouth: "M70 98 Q80 92 90 98",
      leftArm: "M35 86 Q22 94 22 108",
      rightArm: "M125 86 Q112 96 109 108",
      extra: '<circle cx="137" cy="34" r="4" fill="#0E7490"/><circle cx="148" cy="23" r="6" fill="#A5F3FC" stroke="#0E7490" stroke-width="2"/>',
    },
    celebrate: {
      mouth: "M62 91 Q80 116 98 91",
      leftArm: "M36 80 Q14 65 20 43",
      rightArm: "M124 80 Q147 65 141 42",
      extra: '<path d="m24 30 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Zm118-8 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="#F97316"/>',
    },
    support: {
      mouth: "M66 95 Q80 104 94 95",
      leftArm: "M35 84 Q18 88 13 101",
      rightArm: "M125 84 Q142 88 147 101",
      extra: '<path d="M80 23v-8m-4 4h8" stroke="#A5F3FC" stroke-width="3" stroke-linecap="round"/>',
    },
    checking: {
      mouth: "M70 98 H90",
      leftArm: "M35 86 Q24 96 25 111",
      rightArm: "M125 86 Q136 96 135 111",
      extra: '<path class="prism-scan" d="M49 78h62" stroke="#A5F3FC" stroke-width="3" stroke-linecap="round"/>',
    },
    victory: {
      mouth: "M60 90 Q80 118 100 90",
      leftArm: "M36 79 Q13 59 22 36",
      rightArm: "M124 79 Q147 59 138 36",
      extra: '<path d="m58 30 8-15 14 12 14-12 8 15-7 12H65l-7-12Z" fill="#F97316" stroke="#7C2D12" stroke-width="3" stroke-linejoin="round"/>',
    },
  };

  let prismId = 0;
  document.querySelectorAll("[data-prism]").forEach((host) => {
    const pose = prismPoses[host.dataset.prism] || prismPoses.ready;
    const gradientId = `prism-shell-${++prismId}`;
    const happyEyes = ["celebrate", "victory"].includes(host.dataset.prism);
    const eyes = happyEyes
      ? '<path d="M57 76q7-8 14 0M89 76q7-8 14 0" fill="none" stroke="#A5F3FC" stroke-width="5" stroke-linecap="round"/>'
      : '<ellipse cx="64" cy="75" rx="6" ry="7" fill="#A5F3FC"/><ellipse cx="96" cy="75" rx="6" ry="7" fill="#A5F3FC"/><circle cx="62" cy="72" r="2" fill="#fff"/><circle cx="94" cy="72" r="2" fill="#fff"/>';
    host.innerHTML = `<svg class="prism-character" viewBox="0 0 160 160" aria-hidden="true" focusable="false">
      <defs><linearGradient id="${gradientId}" x1="28" y1="22" x2="132" y2="138" gradientUnits="userSpaceOnUse"><stop stop-color="#A5F3FC"/><stop offset=".45" stop-color="#6366F1"/><stop offset="1" stop-color="#3730A3"/></linearGradient></defs>
      <ellipse cx="80" cy="143" rx="40" ry="7" fill="#3730A3" opacity=".16"/>
      <path d="${pose.leftArm}" fill="none" stroke="#3730A3" stroke-width="9" stroke-linecap="round"/>
      <path d="${pose.rightArm}" fill="none" stroke="#3730A3" stroke-width="9" stroke-linecap="round"/>
      <circle cx="15" cy="62" r="6" fill="#A5F3FC" stroke="#3730A3" stroke-width="4"/>
      <circle cx="140" cy="49" r="6" fill="#A5F3FC" stroke="#3730A3" stroke-width="4"/>
      <path d="M80 8 129 35l17 54-34 48H48L14 89l17-54L80 8Z" fill="url(#${gradientId})" stroke="#3730A3" stroke-width="6" stroke-linejoin="round"/>
      <path d="M80 8 78 137 31 35 80 8Z" fill="#fff" opacity=".2"/>
      <path d="m80 8 49 27-17 102-34-1L80 8Z" fill="#312E81" opacity=".18"/>
      <path d="M31 35h98M14 89h132" fill="none" stroke="#fff" stroke-width="2" opacity=".25"/>
      <rect x="42" y="52" width="76" height="57" rx="25" fill="#111827" stroke="#C7D2FE" stroke-width="4"/>
      ${eyes}
      <path d="${pose.mouth}" fill="none" stroke="#A5F3FC" stroke-width="5" stroke-linecap="round"/>
      <path d="M58 137v8m44-8v8" stroke="#3730A3" stroke-width="7" stroke-linecap="round"/>
      ${pose.extra}
    </svg>`;
  });

  document.querySelectorAll(".material-symbols-outlined, .material-symbols-rounded").forEach((icon) => {
    if (!icon.hasAttribute("aria-label")) icon.setAttribute("aria-hidden", "true");
  });

  document.querySelectorAll('[role="radiogroup"]').forEach((group) => {
    const radios = [...group.querySelectorAll('[role="radio"]')];
    if (!radios.length) return;

    const selected = radios.find((radio) => radio.getAttribute("aria-checked") === "true");
    radios.forEach((radio) => (radio.tabIndex = radio === (selected || radios[0]) ? 0 : -1));

    group.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const current = radios.indexOf(document.activeElement);
      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      const next = radios[(Math.max(current, 0) + direction + radios.length) % radios.length];
      next.focus();
      next.click();
    });
  });

  const announcement = document.querySelector("[data-cw-announcement]");
  if (announcement) {
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    requestAnimationFrame(() => announcement.focus());
  }

  document.querySelectorAll("[data-requires-inputs]").forEach((button) => {
    const inputs = button.dataset.requiresInputs
      .split(",")
      .map((id) => document.getElementById(id.trim()))
      .filter(Boolean);
    const update = () => {
      const ready = inputs.length > 0 && inputs.every((input) => input.value.trim() !== "");
      button.disabled = !ready;
      button.setAttribute("aria-disabled", String(!ready));
    };
    inputs.forEach((input) => input.addEventListener("input", update));
    update();
  });

  document.querySelectorAll('input[type="file"][data-next]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.files?.length) window.location.href = input.dataset.next;
    });
  });
})();
