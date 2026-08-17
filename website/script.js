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
     Posts to /api/quote (a Vercel serverless function in website/api/),
     which emails the lead via Resend. On success the form is replaced by
     the inline success notice; the page never navigates.

     If the endpoint fails for any reason, the error path falls back to the
     old mailto behaviour rather than dropping the lead — a visitor who
     bothered to fill this in should never leave with nothing. */
  const form = document.querySelector("[data-quote-form]");

  if (form) {
    const status = document.querySelector("[data-quote-status]");
    const errorBox = document.querySelector("[data-quote-error]");
    const mailtoLink = document.querySelector("[data-quote-mailto]");
    const submit = form.querySelector('button[type="submit"]');
    const inbox = form.dataset.inbox || "info@legacylinkstudio.com";

    const readFields = () => {
      const data = new FormData(form);
      const get = (key) => String(data.get(key) || "").trim();
      return {
        business: get("business"),
        name: get("name"),
        email: get("email"),
        phone: get("phone"),
        service: get("service"),
        details: get("details"),
        company_website: get("company_website"), // honeypot
      };
    };

    const composeMailto = (f) => {
      const subject = `Sample ad request — ${f.business || "new enquiry"}`;
      const body = [
        `Business: ${f.business}`,
        `Contact name: ${f.name}`,
        `Email: ${f.email}`,
        `Phone: ${f.phone || "—"}`,
        `What they do: ${f.service || "—"}`,
        "",
        "Anything else:",
        f.details || "—",
      ].join("\n");

      return (
        `mailto:${inbox}?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`
      );
    };

    const showError = (message, fields) => {
      if (mailtoLink) mailtoLink.href = composeMailto(fields);
      if (errorBox) {
        const slot = errorBox.querySelector("[data-quote-error-message]");
        if (slot && message) slot.textContent = message;
        errorBox.hidden = false;
        errorBox.focus();
      }
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      /* No explicit validation here: the browser gates the submit event on the
         required fields already (the form isn't novalidate), so reaching this
         line means business/name/email are filled and the email parses. The
         endpoint re-checks anyway, since it's reachable directly. */
      const fields = readFields();

      if (errorBox) errorBox.hidden = true;
      if (submit) {
        submit.disabled = true;
        submit.dataset.label = submit.textContent;
        submit.textContent = "Sending…";
      }

      try {
        const response = await fetch("/api/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error === "server" ? "" : payload.error || "");
        }

        form.hidden = true;
        if (status) {
          status.hidden = false;
          status.focus();
        }
        return;
      } catch (err) {
        showError(
          err && err.message && err.message !== "server" ? err.message : "",
          fields,
        );
      } finally {
        if (submit) {
          submit.disabled = false;
          if (submit.dataset.label) submit.textContent = submit.dataset.label;
        }
      }
    });
  }
});
