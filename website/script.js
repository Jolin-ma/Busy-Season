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

  /* ---- Video sound toggles -----------------------------------------
     The clips autoplay muted because no browser allows anything else, so
     this button is the only route to sound. Only one clip is ever audible:
     unmuting one mutes the others, otherwise the samples talk over each
     other on the way down the page. Tapping the video itself does the same
     as the button (§6: "tap for sound"). */
  const soundToggles = document.querySelectorAll("[data-sound-toggle]");

  soundToggles.forEach((button) => {
    const video = button.parentElement.querySelector("video");
    if (!video) return;

    const setMuted = (muted) => {
      video.muted = muted;
      button.setAttribute("aria-pressed", String(!muted));
      button.setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
    };

    setMuted(true);

    button.addEventListener("click", () => {
      const turningOn = video.muted;

      if (turningOn) {
        soundToggles.forEach((other) => {
          if (other !== button) other.dispatchEvent(new CustomEvent("sound:mute"));
        });
      }

      setMuted(!turningOn);

      /* A tab-switch or an offscreen scroll can leave the clip paused; the
         click is a user gesture, so this is the one moment we can reliably
         start it again. */
      if (turningOn && video.paused) video.play().catch(() => {});
    });

    video.style.cursor = "pointer";
    video.addEventListener("click", () => button.click());

    button.addEventListener("sound:mute", () => setMuted(true));
  });

  /* ---- Play sample videos only while they're on screen --------------
     Videos marked data-autoplay-visible ship with preload="none" and a
     poster, so nothing downloads until the card scrolls into view (§8.6:
     fast on mobile data). They pause again when scrolled away. Reduced
     motion keeps them on the poster frame until someone taps for sound. */
  const lazyVideos = document.querySelectorAll("video[data-autoplay-visible]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (lazyVideos.length && "IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            target.play().catch(() => {});
          } else if (!target.paused) {
            target.pause();
          }
        });
      },
      { threshold: 0.35 }
    );

    lazyVideos.forEach((video) => observer.observe(video));
  }

  /* ---- Current year in the footer ---------------------------------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---- Contact form ------------------------------------------------
     Posts to Formspree (the endpoint is the form's data-endpoint), which
     stores the enquiry and emails it on. On success the form is replaced by
     the inline success notice; the page never navigates.

     If the endpoint fails for any reason, the error path falls back to a
     pre-filled mailto rather than dropping the enquiry. */
  const form = document.querySelector("[data-contact-form]");

  if (form) {
    const status = document.querySelector("[data-contact-status]");
    const errorBox = document.querySelector("[data-contact-error]");
    const mailtoLink = document.querySelector("[data-contact-mailto]");
    const submit = form.querySelector('button[type="submit"]');
    const inbox = form.dataset.inbox || "info@busyseason.ca";
    const endpoint = form.dataset.endpoint;

    const readFields = () => {
      const data = new FormData(form);
      const get = (key) => String(data.get(key) || "").trim();
      return {
        name: get("name"),
        agency: get("agency"),
        email: get("email"),
        accounts: get("accounts"),
        needs: get("needs"),
        company_website: get("company_website"), // honeypot
      };
    };

    const subjectFor = (f) => `Sample enquiry — ${f.agency || "new agency"}`;

    const composeMailto = (f) => {
      const body = [
        `Name: ${f.name}`,
        `Agency: ${f.agency}`,
        `Email: ${f.email}`,
        `Home service accounts: ${f.accounts || "—"}`,
        "",
        "What we need:",
        f.needs || "—",
      ].join("\n");

      return (
        `mailto:${inbox}?subject=${encodeURIComponent(subjectFor(f))}` +
        `&body=${encodeURIComponent(body)}`
      );
    };

    const showError = (message, fields) => {
      if (mailtoLink) mailtoLink.href = composeMailto(fields);
      if (errorBox) {
        const slot = errorBox.querySelector("[data-contact-error-message]");
        if (slot && message) slot.textContent = message;
        errorBox.hidden = false;
        errorBox.focus();
      }
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      /* No explicit validation here: the browser gates the submit event on the
         required fields already (the form isn't novalidate), so reaching this
         line means name/agency/email are filled and the email parses. */
      const fields = readFields();

      /* Honeypot filled: a bot. Show success and send nothing. */
      if (fields.company_website) {
        form.hidden = true;
        if (status) status.hidden = false;
        return;
      }

      if (errorBox) errorBox.hidden = true;
      if (submit) {
        submit.disabled = true;
        submit.dataset.label = submit.textContent;
        submit.textContent = "Sending…";
      }

      try {
        const { company_website, ...enquiry } = fields;
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            ...enquiry,
            _replyto: fields.email,
            _subject: subjectFor(fields),
          }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const first = payload.errors && payload.errors[0];
          throw new Error((first && first.message) || "");
        }

        form.hidden = true;
        if (status) {
          status.hidden = false;
          status.focus();
        }
        return;
      } catch (err) {
        showError((err && err.message) || "", fields);
      } finally {
        if (submit) {
          submit.disabled = false;
          if (submit.dataset.label) submit.textContent = submit.dataset.label;
        }
      }
    });
  }
});
