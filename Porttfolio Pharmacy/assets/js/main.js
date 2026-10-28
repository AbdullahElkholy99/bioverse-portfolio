/**
 * Bioverse — site behaviour
 * Vanilla JS, no dependencies. All motion is optional and respects reduced motion.
 */

/* Replace with your Formspree form ID, e.g. https://formspree.io/f/abcdwxyz */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/FORMSPREE_ID';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Theme ---------------------------------------------------------------- */
  const themeToggle = document.getElementById('theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#0b141b' : '#f3efe6');
    if (persist) {
      try { localStorage.setItem('bioverse-theme', theme); } catch (e) { /* private mode */ }
    }
  }

  applyTheme(root.getAttribute('data-theme') || 'light', false);

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });

  /* Mobile navigation ---------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');
  const navLinks = siteNav.querySelectorAll('a');
  const mobileNav = window.matchMedia('(max-width: 900px)');
  const pageMain = document.getElementById('main');
  const pageFooter = document.querySelector('.footer');

  function setPageInert(isInert) {
    [pageMain, pageFooter].forEach(element => {
      if (!element) return;
      if (isInert) element.setAttribute('inert', '');
      else element.removeAttribute('inert');
    });
  }

  function syncNavInert() {
    if (mobileNav.matches && !siteNav.classList.contains('is-open')) {
      siteNav.setAttribute('inert', '');
    } else {
      siteNav.removeAttribute('inert');
    }
  }

  function setNav(open, moveFocus) {
    siteNav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open && mobileNav.matches);
    syncNavInert();
    setPageInert(open && mobileNav.matches);
    if (open && moveFocus) {
      const first = siteNav.querySelector('a');
      if (first) requestAnimationFrame(() => first.focus());
    }
  }

  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') !== 'true';
    setNav(open, open);
  });

  navLinks.forEach(link => link.addEventListener('click', () => setNav(false)));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setNav(false);
      navToggle.focus();
    }
  });

  mobileNav.addEventListener('change', () => setNav(false));
  syncNavInert();

  /* Header & back-to-top ------------------------------------------------ */
  const header = document.getElementById('site-header');
  const toTop = document.getElementById('to-top');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    toTop.classList.toggle('is-visible', window.scrollY > 720);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });

  /* Reveal on scroll ----------------------------------------------------- */
  const revealItems = document.querySelectorAll('[data-reveal]');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-in'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealItems.forEach(item => revealObserver.observe(item));
  }

  /* Counters ------------------------------------------------------------- */
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  const numberFormat = new Intl.NumberFormat('en-US');

  function setCounterFinal(counter) {
    counter.textContent = numberFormat.format(Number(counter.dataset.count));
  }

  function runCounter(counter) {
    if (reduceMotion.matches) {
      setCounterFinal(counter);
      return;
    }

    const target = Number(counter.dataset.count);
    const duration = 1400;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = numberFormat.format(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(frame);
      else setCounterFinal(counter);
    }

    requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (reduceMotion.matches) {
      counters.forEach(setCounterFinal);
    } else if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(counter => {
        counter.textContent = '0';
        counterObserver.observe(counter);
      });

      // Safety net: never leave a zero on screen if the observer is skipped.
      window.setTimeout(() => counters.forEach(setCounterFinal), 6000);
    }
  }

  /* Product catalogue ---------------------------------------------------- */
  const products = [
    {
      id: 'bivacet-20',
      name: 'Bivacet 20 mg',
      code: 'BV-101',
      category: 'Metabolic',
      form: 'Film-coated tablet',
      region: 'EU',
      year: 2023,
      status: 'Authorised',
      indication: 'Type 2 diabetes in adults, as add-on therapy',
      description: 'A once-daily oral DPP-4 inhibitor for adults whose HbA1c remains above target on metformin alone.',
      trial: 'BIV-301 · Phase III, n=1,204 · 48-week primary endpoint met',
      storage: 'Store below 30 °C in the original blister.',
      updated: 'March 2026'
    },
    {
      id: 'bivacet-40',
      name: 'Bivacet 40 mg',
      code: 'BV-101',
      category: 'Metabolic',
      form: 'Film-coated tablet',
      region: 'EU',
      year: 2024,
      status: 'Authorised',
      indication: 'Type 2 diabetes in adults with renal impairment',
      description: 'The higher-strength presentation, indicated where dose adjustment for renal function is required.',
      trial: 'BIV-302 · Phase III, n=486 · 24-week primary endpoint met',
      storage: 'Store below 30 °C in the original blister.',
      updated: 'January 2026'
    },
    {
      id: 'renovia-5',
      name: 'Renovia 5 mg',
      code: 'BV-118',
      category: 'Metabolic',
      form: 'Hard capsule',
      region: 'CH',
      year: 2021,
      status: 'Authorised',
      indication: 'Chronic kidney disease in adults with type 2 diabetes',
      description: 'A selective SGLT2 inhibitor developed for patients who cannot tolerate standard first-line therapy.',
      trial: 'REN-204 · Phase III, n=742 · 36-week eGFR endpoint met',
      storage: 'Store below 25 °C, protected from moisture.',
      updated: 'November 2025'
    },
    {
      id: 'immunexa-10',
      name: 'Immunexa 10 mg',
      code: 'BV-204',
      category: 'Immunology',
      form: 'Subcutaneous injection',
      region: 'EU',
      year: 2022,
      status: 'Authorised',
      indication: 'Moderate-to-severe psoriatic arthritis',
      description: 'A humanised monoclonal antibody dosed every four weeks for adults with inadequate response to methotrexate.',
      trial: 'IMM-201 · Phase III, n=612 · ACR20 at week 24 met',
      storage: 'Refrigerate at 2–8 °C. Do not freeze.',
      updated: 'June 2026'
    },
    {
      id: 'immunexa-25',
      name: 'Immunexa 25 mg',
      code: 'BV-204',
      category: 'Immunology',
      form: 'Subcutaneous injection',
      region: 'EU',
      year: 2023,
      status: 'Authorised',
      indication: 'Moderate-to-severe plaque psoriasis',
      description: 'A higher-strength pen for patients transitioning from the 10 mg presentation under clinical supervision.',
      trial: 'IMM-205 · Phase III, n=388 · PASI 90 at week 16 met',
      storage: 'Refrigerate at 2–8 °C. Do not freeze.',
      updated: 'June 2026'
    },
    {
      id: 'onvexa-50',
      name: 'Onvexa 50 mg',
      code: 'BV-311',
      category: 'Oncology',
      form: 'Intravenous infusion',
      region: 'US',
      year: 2025,
      status: 'Authorised',
      indication: 'Advanced solid tumours with a confirmed biomarker',
      description: 'A selective kinase inhibitor given every three weeks; companion diagnostic required before initiation.',
      trial: 'ONV-102 · Phase I/II, n=214 · ORR 31% at data cut-off',
      storage: 'Store at 20–25 °C. Protect from light.',
      updated: 'September 2026'
    },
    {
      id: 'onvexa-100',
      name: 'Onvexa 100 mg',
      code: 'BV-311',
      category: 'Oncology',
      form: 'Intravenous infusion',
      region: 'US',
      year: 2026,
      status: 'Authorised',
      indication: 'Advanced solid tumours, weight-based dosing',
      description: 'The 100 mg vial supports weight-based dosing for patients above 80 kg.',
      trial: 'ONV-102 · Phase I/II, n=214 · ORR 31% at data cut-off',
      storage: 'Store at 20–25 °C. Protect from light.',
      updated: 'September 2026'
    },
    {
      id: 'fabrone-35',
      name: 'Fabrone 35 mg',
      code: 'BV-402',
      category: 'Rare disease',
      form: 'Hard capsule',
      region: 'CH',
      year: 2020,
      status: 'Authorised',
      indication: 'Fabry disease in adults',
      description: 'An oral chaperone therapy for patients with amenable GLA variants, taken twice daily with water.',
      trial: 'FAB-105 · Phase II, n=68 · plasma Lyso-Gb3 reduction at 12 months',
      storage: 'Store below 25 °C in the original container.',
      updated: 'February 2026'
    },
    {
      id: 'calciwave-500',
      name: 'Calciwave 500 mg',
      code: 'BV-155',
      category: 'Supportive care',
      form: 'Oral powder, sachet',
      region: 'EU',
      year: 2018,
      status: 'Authorised',
      indication: 'Phosphate control in adults on dialysis',
      description: 'A calcium-free phosphate binder mixed with water and taken with meals.',
      trial: 'SUP-110 · Phase III, n=340 · serum phosphate endpoint met',
      storage: 'Store below 25 °C, protected from moisture.',
      updated: 'August 2025'
    }
  ];

  const catalog = document.getElementById('catalog');
  const catalogCount = document.getElementById('catalog-count');
  const catalogEmpty = document.getElementById('catalog-empty');
  const catalogReset = document.getElementById('catalog-reset');
  const searchInput = document.getElementById('product-search');
  const sortSelect = document.getElementById('product-sort');
  const chips = Array.from(document.querySelectorAll('.chip'));
  let activeCategory = 'all';
  let query = '';

  function matches(product) {
    const inCategory = activeCategory === 'all' || product.category === activeCategory;
    const haystack = `${product.name} ${product.code} ${product.category} ${product.indication}`.toLowerCase();
    return inCategory && haystack.includes(query);
  }

  function sortProducts(items) {
    const sort = sortSelect.value;
    const byName = (a, b) => a.name.localeCompare(b.name, 'en', { numeric: true });
    return items.slice().sort((a, b) => {
      if (sort === 'newest') return b.year - a.year || byName(a, b);
      if (sort === 'area') return a.category.localeCompare(b.category) || byName(a, b);
      return byName(a, b);
    });
  }

  function rowMarkup(product) {
    return `
      <li class="catalog-row">
        <div class="catalog-row__name">
          <h3>${product.name}</h3>
          <p>${product.code} · ${product.form}</p>
        </div>
        <div class="catalog-row__meta">
          <p class="catalog-row__cat">${product.category}</p>
          <p class="catalog-row__year">${product.region} ${product.year}</p>
          <p><span class="badge">${product.status}</span></p>
        </div>
        <div class="catalog-row__action">
          <button class="row-link" type="button" data-product="${product.id}">
            Details
            <svg class="icon" aria-hidden="true"><use href="#i-arrow-up-right"></use></svg>
          </button>
        </div>
      </li>`;
  }

  function renderCatalog() {
    const results = sortProducts(products.filter(matches));
    catalog.innerHTML = results.map(rowMarkup).join('');
    catalogEmpty.hidden = results.length !== 0;
    catalogCount.textContent = `${results.length} ${results.length === 1 ? 'product' : 'products'}`;
  }

  let searchTimer;
  searchInput.addEventListener('input', event => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      query = event.target.value.trim().toLowerCase();
      renderCatalog();
    }, 120);
  });

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      activeCategory = chip.dataset.category;
      chips.forEach(other => other.setAttribute('aria-pressed', String(other === chip)));
      renderCatalog();
    });
  });

  sortSelect.addEventListener('change', renderCatalog);

  catalogReset.addEventListener('click', () => {
    searchInput.value = '';
    query = '';
    activeCategory = 'all';
    chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.category === 'all')));
    renderCatalog();
    searchInput.focus();
  });

  renderCatalog();

  /* Product dialog ------------------------------------------------------- */
  const dialog = document.getElementById('product-dialog');
  const dialogBody = document.getElementById('dialog-body');
  const dialogClose = document.getElementById('dialog-close');
  let dialogTrigger = null;

  function dialogMarkup(product) {
    return `
      <div class="dialog__grid">
        <div class="dialog__main">
          <h2>${product.name}</h2>
          <p class="dialog__meta">
            <span>${product.code}</span>
            <span>${product.category}</span>
            <span>${product.region} · ${product.year}</span>
          </p>
          <p class="dialog__description">${product.description}</p>

          <h3>Indication</h3>
          <p>${product.indication}</p>

          <h3>Formulation &amp; storage</h3>
          <p>${product.form}. ${product.storage}</p>

          <h3>Key trial</h3>
          <p>${product.trial}</p>

          <p class="dialog__notice">
            Prescribing information is approved per market. Summary of product characteristics available on request.
            <a href="#">Download the SmPC (PDF)</a> · <a href="#">Report an adverse event</a>.
          </p>
        </div>

        <aside class="dialog__side" aria-label="Product facts">
          <dl>
            <div><dt>Status</dt><dd>${product.status}</dd></div>
            <div><dt>Form</dt><dd>${product.form}</dd></div>
            <div><dt>First authorisation</dt><dd>${product.region}, ${product.year}</dd></div>
            <div><dt>Last reviewed</dt><dd>${product.updated}</dd></div>
            <div><dt>Marketing authorisation</dt><dd>Bioverse AG, Basel</dd></div>
          </dl>
        </aside>
      </div>`;
  }

  function openProduct(id, trigger) {
    const product = products.find(item => item.id === id);
    if (!product) return;

    dialogTrigger = trigger;
    dialogBody.innerHTML = dialogMarkup(product);
    document.getElementById('dialog-title').textContent = product.name;
    dialog.showModal();
    root.classList.add('dialog-open');
    dialogClose.focus();
  }

  function closeProduct() {
    dialog.close();
  }

  catalog.addEventListener('click', event => {
    const button = event.target.closest('[data-product]');
    if (button) openProduct(button.dataset.product, button);
  });

  dialogClose.addEventListener('click', closeProduct);

  // Click outside the panel closes; clicks inside the panel do not.
  dialog.addEventListener('click', event => {
    if (event.target === dialog) closeProduct();
  });

  dialog.addEventListener('close', () => {
    root.classList.remove('dialog-open');
    if (dialogTrigger) dialogTrigger.focus();
    dialogTrigger = null;
  });

  // Native <dialog> traps focus; this keeps Tab contained in older engines too.
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusables = Array.from(
      dialog.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(element => element.offsetParent !== null);

    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* Contact form --------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitButton = document.getElementById('contact-submit');
  const submitLabel = submitButton.querySelector('span');

  const fields = {
    name: {
      input: document.getElementById('name'),
      validate: value => value.trim().length >= 2 || 'Enter your full name.'
    },
    email: {
      input: document.getElementById('email'),
      validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) || 'Enter a valid work email.'
    },
    topic: {
      input: document.getElementById('topic'),
      validate: value => value !== '' || 'Choose a topic so we can route your message.'
    },
    message: {
      input: document.getElementById('message'),
      validate: value => value.trim().length >= 20 || 'Add a little more detail (at least 20 characters).'
    }
  };

  function setFieldError(input, message) {
    const error = document.getElementById(`${input.id}-error`);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (!error) return;
    error.textContent = message;
    error.hidden = !message;
  }

  function validateField(input) {
    const rule = Object.values(fields).find(field => field.input === input);
    if (!rule) return true;
    const message = rule.validate(input.value);
    const isValid = message === true;
    setFieldError(input, isValid ? '' : message);
    return isValid;
  }

  Object.values(fields).forEach(field => {
    field.input.addEventListener('blur', () => validateField(field.input));
    field.input.addEventListener('input', () => {
      if (field.input.getAttribute('aria-invalid') === 'true') validateField(field.input);
    });
    if (field.input.tagName === 'SELECT') {
      field.input.addEventListener('change', () => validateField(field.input));
    }
  });

  function showStatus(message, state) {
    formStatus.textContent = message;
    formStatus.dataset.state = state;
    formStatus.classList.add('is-visible');
  }

  async function sendForm(formData) {
    if (FORMSPREE_ENDPOINT.includes('FORMSPREE_ID')) {
      await new Promise(resolve => window.setTimeout(resolve, 900));
      return;
    }

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) throw new Error(`Form endpoint returned ${response.status}`);
  }

  contactForm.addEventListener('submit', async event => {
    event.preventDefault();

    const invalid = [];
    Object.values(fields).forEach(field => {
      if (!validateField(field.input)) invalid.push(field.input);
    });

    if (invalid.length) {
      showStatus(`Please check ${invalid.length === 1 ? 'one field' : `${invalid.length} fields`} and try again.`, 'error');
      invalid[0].focus();
      return;
    }

    // Honeypot: answer as if sent, but discard quietly.
    if (contactForm.querySelector('[name="_gotcha"]').value) {
      showStatus('Thank you. Your message has been received.', 'success');
      contactForm.reset();
      return;
    }

    submitButton.setAttribute('aria-busy', 'true');
    submitButton.disabled = true;
    submitLabel.textContent = 'Sending…';
    formStatus.classList.remove('is-visible');

    try {
      await sendForm(new FormData(contactForm));
      showStatus('Thank you. Your message is with our medical information team; we reply within two working days.', 'success');
      contactForm.reset();
      Object.values(fields).forEach(field => setFieldError(field.input, ''));
    } catch (error) {
      showStatus('We could not send the form. Email hello@bioverse.ch and we will pick it up from there.', 'error');
    } finally {
      submitButton.removeAttribute('aria-busy');
      submitButton.disabled = false;
      submitLabel.textContent = 'Send message';
    }
  });

  /* Newsletter ----------------------------------------------------------- */
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  const newsletterStatus = document.getElementById('newsletter-status');
  const newsletterButton = document.getElementById('newsletter-submit');

  newsletterForm.addEventListener('submit', async event => {
    event.preventDefault();
    const email = newsletterEmail.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      newsletterStatus.textContent = 'Enter a valid email address.';
      newsletterEmail.focus();
      return;
    }

    newsletterButton.disabled = true;
    newsletterStatus.textContent = 'Subscribing…';

    await new Promise(resolve => window.setTimeout(resolve, 700));

    newsletterStatus.textContent = 'You are on the list. Check your inbox to confirm.';
    newsletterForm.reset();
    newsletterButton.disabled = false;
  });

  /* Footer year ---------------------------------------------------------- */
  document.getElementById('year').textContent = new Date().getFullYear();
});
