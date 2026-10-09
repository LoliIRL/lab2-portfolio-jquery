/* =====================================================
   Лаба №3 — jQuery-динамика + темы
   Автор: Киселев Максим, ФИТ-241
   ===================================================== */
$(function () {

  /* ---------- 0. ТЕМЫ ---------- */
  const $html = $('html');
  const $themeToggle = $('[data-theme-toggle]');

  function getInitialTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  function applyTheme(theme) {
    $html.attr('data-theme', theme);
    $themeToggle.text(theme === 'dark' ? '🌙' : '☀️');
  }

  applyTheme(getInitialTheme());

  $themeToggle.on('click', function () {
    const next = $html.attr('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });


  /* ---------- 1. БУРГЕР-МЕНЮ ---------- */
  $('[data-burger]').on('click', function (e) {
    e.preventDefault();
    $('[data-nav]').stop(true, true).slideToggle(200, function () {
      $(this).toggleClass('nav--open', $(this).is(':visible'));
    });
  });

  $('[data-nav] a').on('click', function () {
    if ($(window).width() <= 767) {
      $('[data-nav]').removeClass('nav--open').slideUp(200);
    }
  });

  $(window).on('resize', function () {
    if ($(window).width() >= 768) {
      $('[data-nav]').removeClass('nav--open').removeAttr('style');
    }
  });


  /* ---------- 2. ПЛАВНЫЙ СКРОЛЛ ---------- */
  $('a[href^="#"]').on('click', function (e) {
    const hash = this.hash;
    if (!hash || hash === '#') return;
    const $target = $(hash);
    if ($target.length) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: $target.offset().top - 70 }, 500);
    }
  });


  /* ---------- 3. АКТИВНЫЙ ПУНКТ МЕНЮ ---------- */
  const $sections = $('section[id]');
  const $navLinks = $('[data-nav] a');

  function updateActiveLink() {
    const scrollPos = $(window).scrollTop() + 120;
    let currentId = '';
    $sections.each(function () {
      if ($(this).offset().top <= scrollPos) currentId = $(this).attr('id');
    });
    $navLinks.removeClass('nav__link--active')
      .filter('[href="#' + currentId + '"]').addClass('nav__link--active');
  }
  $(window).on('scroll', updateActiveLink);
  updateActiveLink();


  /* ---------- 4. КНОПКА ВВЕРХ ---------- */
  const $toTop = $('[data-to-top]');
  $(window).on('scroll', function () {
    if ($(window).scrollTop() > 400) $toTop.stop(true, true).fadeIn(200);
    else $toTop.stop(true, true).fadeOut(200);
  });
  $toTop.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 600);
  });


  /* ---------- 5. МОДАЛКА ---------- */
  const $modal = $('[data-modal]');
  function openModal(title, text) {
    $('#modalTitle').text(title);
    $('#modalText').text(text);
    $modal.addClass('modal--open').attr('aria-hidden', 'false');
  }
  function closeModal() {
    $modal.removeClass('modal--open').attr('aria-hidden', 'true');
  }
  $modal.on('click', '[data-modal-close]', closeModal);
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });


  /* ---------- 6. ГАЛЕРЕЯ ---------- */
  function renderPortfolio(items) {
    const $grid = $('[data-portfolio-grid]').empty();
    $.each(items, function (i, item) {
      const $card = $(
        '<article class="card" tabindex="0">' +
          '<div class="card__thumb"></div>' +
          '<h3 class="card__title"></h3>' +
          '<p class="card__text"></p>' +
        '</article>'
      );
      $card.find('.card__thumb').text(item.icon || '🎮');
      $card.find('.card__title').text(item.title || '');
      $card.find('.card__text').text(item.description || '');

      $card.on('click', function () { openModal(item.title, item.description); });
      $card.on('keypress', function (e) {
        if (e.key === 'Enter') openModal(item.title, item.description);
      });

      $grid.append($card);
      $card.hide().delay(i * 100).fadeIn(400);
    });
  }

  $.getJSON('data/portfolio.json')
    .done(function (items) { renderPortfolio(items); })
    .fail(function () {
      const fallback = [
        { title: 'Лаба №1', description: 'Страница-визитка в стиле Pac-Man.', icon: '👻' },
        { title: 'Лаба №2', description: 'Динамика на jQuery: галерея, модалки, слайдер.', icon: '🍒' },
        { title: 'Лаба №3', description: 'Рефакторинг стилей на Sass + тёмная тема.', icon: '🎨' },
        { title: 'Лаба №4', description: 'Калькулятор на JavaScript.', icon: '⭐' },
        { title: 'Пет-проект', description: 'ToDo-лист с LocalStorage.', icon: '📋' },
        { title: 'Курсовая', description: 'Веб-интерфейс системы учёта заявок.', icon: '📊' }
      ];
      renderPortfolio(fallback);
    });


  /* ---------- 7. ФОРМА ---------- */
  const $form = $('[data-contact-form]');
  const $status = $('[data-form-status]');

  function setError(field, msg) {
    const $f = $('[name="' + field + '"]').closest('.form__field');
    $f.addClass('form__field--invalid');
    $f.find('.form__error').text(msg || '');
  }
  function clearError(field) {
    const $f = $('[name="' + field + '"]').closest('.form__field');
    $f.removeClass('form__field--invalid');
    $f.find('.form__error').text('');
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function validateForm() {
    let ok = true;
    const name = $('#fieldName').val().trim();
    const email = $('#fieldEmail').val().trim();
    const msg = $('#fieldMessage').val().trim();

    if (name.length < 2) { setError('name', 'Минимум 2 символа'); ok = false; } else clearError('name');
    if (!isEmail(email))  { setError('email', 'Некорректный email'); ok = false; } else clearError('email');
    if (msg.length < 5)   { setError('message', 'Минимум 5 символов'); ok = false; } else clearError('message');
    return ok;
  }

  $form.on('input', 'input, textarea', function () {
    clearError($(this).attr('name'));
  });

  $form.on('submit', function (e) {
    e.preventDefault();
    $status.removeClass('form__status--success form__status--error').text('');

    if (!validateForm()) {
      $status.addClass('form__status--error').text('⚠ Проверьте поля формы');
      return;
    }

    const $submit = $form.find('button[type="submit"]');
    $submit.prop('disabled', true).text('Отправка…');
    $status.text('Отправляем данные…');

    $.ajax({
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'POST',
      dataType: 'json',
      data: {
        name: $('#fieldName').val().trim(),
        email: $('#fieldEmail').val().trim(),
        message: $('#fieldMessage').val().trim()
      }
    })
      .done(function (res) {
        $status.addClass('form__status--success').text('✔ Сообщение отправлено! ID: ' + res.id);
        $form[0].reset();
        bumpScore(500);
      })
      .fail(function () {
        $status.addClass('form__status--error').text('✖ Ошибка отправки. Попробуйте позже.');
      })
      .always(function () {
        $submit.prop('disabled', false).text('▶ Отправить');
      });
  });


  /* ---------- 8. КАРУСЕЛЬ ---------- */
  const $track = $('[data-carousel-track]');
  const $slides = $track.children('.skill');
  let idx = 0;
  let perView = getPerView();
  let timer = null;

  function getPerView() {
    const w = $(window).width();
    if (w >= 1024) return 3;
    if (w >= 768)  return 2;
    return 1;
  }
  function maxIndex() { return Math.max(0, $slides.length - perView); }
  function goTo(i) {
    idx = Math.max(0, Math.min(i, maxIndex()));
    const step = 100 / perView;
    $track.css('transform', 'translateX(' + (-idx * step) + '%)');
  }
  function next() { goTo(idx + 1 > maxIndex() ? 0 : idx + 1); }
  function prev() { goTo(idx - 1 < 0 ? maxIndex() : idx - 1); }

  $('[data-carousel-next]').on('click', function () { next(); resetTimer(); });
  $('[data-carousel-prev]').on('click', function () { prev(); resetTimer(); });

  function startTimer() { timer = setInterval(next, 3500); }
  function resetTimer() { clearInterval(timer); startTimer(); }

  $(window).on('resize', function () {
    perView = getPerView();
    goTo(0);
  });

  startTimer();


  /* ---------- 9. СЧЁТЧИК ---------- */
  let score = 0;
  function bumpScore(add) {
    score += add;
    $('#score').text(String(score).padStart(6, '0'));
  }
  bumpScore(100);

});