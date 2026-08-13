document.addEventListener("DOMContentLoaded", () => {
  /* ---- Mobile nav -------------------------------------------------- */
  const header = document.querySelector("[data-site-header]");
  const toggle = document.querySelector("[data-nav-toggle]");

  if (header && toggle) {
    const setOpen = (open) => {
      header.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => {
      setOpen(!header.classList.contains("open"));
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && header.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---- Current year in the footer ---------------------------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---- Quote form --------------------------------------------------
     There is no form backend for this site (it deploys as static files
     to Vercel — see repo CLAUDE.md). Rather than fake a success state
     that silently drops a lead, submitting composes a pre-filled email
     in the visitor's mail client and tells them plainly that it did.
     Swap this for a real endpoint (Formspree, a Vercel function, etc.)
     when one exists — the field names below are already the payload. */
  const form = document.querySelector("[data-quote-form]");

  if (form) {
    const status = document.querySelector("[data-quote-status]");
    const inbox = form.dataset.inbox || "hello@legacylinkstudio.com";

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const get = (key) => String(data.get(key) || "").trim();

      const subject = `Quote request — ${get("business") || "new enquiry"}`;
      const body = [
        `Business: ${get("business")}`,
        `Contact name: ${get("name")}`,
        `Email: ${get("email")}`,
        `Phone: ${get("phone") || "—"}`,
        `Location: ${get("location") || "—"}`,
        `Interested in: ${get("package") || "not sure yet"}`,
        "",
        "What they need:",
        get("details") || "—",
      ].join("\n");

      window.location.href =
        `mailto:${inbox}?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      if (status) {
        status.hidden = false;
        status.focus();
      }
    });
  }
});
