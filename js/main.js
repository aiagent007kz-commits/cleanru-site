/* ===== CLEANRU — Shared site JS (v2: Glass + Modal + Lime) ===== */
(function () {
  'use strict';

  // --- Inject floating order button + modal markup ---
  function injectGlobalUI() {
    if (!document.querySelector('.floating-order')) {
      const btn = document.createElement('button');
      btn.className = 'floating-order';
      btn.type = 'button';
      btn.id = 'open-order-modal';
      btn.textContent = 'ЗАКАЗАТЬ';
      document.body.appendChild(btn);
    }
    if (!document.querySelector('.modal-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'order-modal';
      overlay.innerHTML = `
        <div class="modal glass" role="dialog" aria-modal="true" aria-labelledby="order-modal-title">
          <button class="modal-close" aria-label="Закрыть">✕</button>
          <h3 id="order-modal-title">Быстрый заказ</h3>
          <p>Оставьте контакты — менеджер перезвонит за 15 минут.</p>
          <form data-form="order" id="modal-order-form">
            <div class="form-group">
              <label for="m-name">Имя</label>
              <input type="text" id="m-name" name="name" class="form-control" placeholder="Как к вам обращаться?" required />
            </div>
            <div class="form-group">
              <label for="m-phone">Телефон</label>
              <input type="tel" id="m-phone" name="phone" class="form-control" placeholder="+7 (___) ___-__-__" required />
            </div>
            <div class="form-group">
              <label for="m-service">Тип услуги</label>
              <select id="m-service" name="service" class="form-control">
                <option>Поддерживающая уборка</option>
                <option>Генеральная уборка</option>
                <option>Уборка после ремонта</option>
                <option>Офисная уборка</option>
                <option>Мытьё окон</option>
                <option>Химчистка мебели</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top: 6px;">Отправить заявку</button>
          </form>
        </div>
      `;
      document.body.appendChild(overlay);
    }
  }
  injectGlobalUI();

  const modal = document.getElementById('order-modal');
  const openBtn = document.getElementById('open-order-modal');

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close')) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // --- Mobile nav toggle ---
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }

  // --- Highlight active nav link ---
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // --- Reveal on scroll ---
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // --- Toast helper ---
  window.showToast = function (msg, type = 'success') {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = 'toast ' + (type === 'error' ? 'error' : '');
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 3800);
  };

  // --- Generic order form handler ---
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-form="order"]');
    if (!form) return;
    e.preventDefault();
    const name = form.querySelector('[name="name"]')?.value.trim();
    const phone = form.querySelector('[name="phone"]')?.value.trim();
    if (!name || !phone) {
      showToast('Заполните имя и телефон', 'error');
      return;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      showToast('Укажите корректный телефон', 'error');
      return;
    }
    form.reset();
    if (modal.classList.contains('open')) closeModal();
    showToast('Спасибо! Менеджер свяжется в течение 15 минут.');
  });

  // --- Before/after sliders ---
  document.querySelectorAll('.before-after').forEach(initBeforeAfter);

  function initBeforeAfter(el) {
    const after = el.querySelector('.ba-after');
    const line = el.querySelector('.ba-slider-line');
    const handle = el.querySelector('.ba-handle');
    if (!after || !line) return;

    let active = false;
    const setPos = (clientX) => {
      const rect = el.getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      after.style.clipPath = `inset(0 0 0 ${pct}%)`;
      line.style.left = pct + '%';
      if (handle) handle.style.left = pct + '%';
    };

    const start = (x) => { active = true; setPos(x); };
    const move = (x) => { if (active) setPos(x); };
    const end = () => { active = false; };

    el.addEventListener('mousedown', e => start(e.clientX));
    window.addEventListener('mousemove', e => move(e.clientX));
    window.addEventListener('mouseup', end);

    el.addEventListener('touchstart', e => start(e.touches[0].clientX), { passive: true });
    el.addEventListener('touchmove', e => move(e.touches[0].clientX), { passive: true });
    el.addEventListener('touchend', end);
  }

  // --- Accordion ---
  document.querySelectorAll('.acc-head').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.acc-item').classList.toggle('open');
    });
  });

  // --- Phone input mask ---
  document.addEventListener('input', (e) => {
    const inp = e.target;
    if (!(inp instanceof HTMLInputElement) || inp.type !== 'tel') return;
    let v = inp.value.replace(/\D/g, '').slice(0, 11);
    if (v.startsWith('8')) v = '7' + v.slice(1);
    let out = '+7';
    if (v.length > 1) out += ' (' + v.slice(1, 4);
    if (v.length >= 4) out += ') ' + v.slice(4, 7);
    if (v.length >= 7) out += '-' + v.slice(7, 9);
    if (v.length >= 9) out += '-' + v.slice(9, 11);
    inp.value = out;
  });

  // --- Header hide on scroll down, show on scroll up ---
  const header = document.querySelector('.site-header');
  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!header) return;
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > 80 && y > lastY) {
          header.style.transform = 'translateY(-120%)';
        } else {
          header.style.transform = 'translateY(0)';
        }
        header.style.transition = 'transform .35s cubic-bezier(.4, 0, .2, 1)';
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  });

  // --- Parallax tilt on hero visual (subtle) ---
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual && window.matchMedia('(min-width: 900px)').matches) {
    heroVisual.style.transition = 'transform .4s cubic-bezier(.4, 0, .2, 1)';
    heroVisual.style.transformStyle = 'preserve-3d';
    const parent = heroVisual.parentElement;
    parent.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroVisual.style.transform =
        `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
    });
    parent.addEventListener('mouseleave', () => {
      heroVisual.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
    });
  }
})();
