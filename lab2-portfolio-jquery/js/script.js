/* =====================================================
   Лаба №2 — jQuery-динамика
   Автор: Киселев Максим, ФИТ-241
   ===================================================== */
$(function () {

  /* ---------- 1. ВЫПАДАЮЩЕЕ МЕНЮ (бургер) ---------- */
  $('#burger').on('click', function (e) {
    e.preventDefault();
    $('#nav').stop(true, true).slideToggle(200, function () {
      // после анимации выставляем флаг is-open
      if ($(this).is(':visible')) {
        $(this).addClass('is-open');
      } else {
        $(this).removeClass('is-open');
      }
    });
  });

  // На мобилке клик по ссылке — закрываем меню
  $('#nav a').on('click', function () {
    if ($(window).width() <= 767) {
      $('#nav').removeClass('is-open').slideUp(200);
    }
  });

  // При изменении размера окна — сбрасываем состояние
  $(window).on('resize', function () {
    if ($(window).width() >= 768) {
      $('#nav').removeClass('is-open').removeAttr('style');
    }
  });


  /* ---------- 2. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ ---------- */
  $('a[href^="#"]').on('click', function (e) {
    const hash = this.hash;
    if (!hash || hash === '#') return;
    const $target = $(hash);
    if ($target.length) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: $target.offset().top - 70 }, 500);
    }
  });


  /* ---------- 3. ПОДСВЕТКА АКТИВНОГО ПУНКТА МЕНЮ ---------- */
  const $sections = $('section[id]');
  const $navLinks = $('#nav a');

  function updateActiveLink() {
    const scrollPos = $(window).scrollTop() + 120;
    let currentId = '';
    $sections.each(function () {
      if ($(this).offset().top <= scrollPos) currentId = $(this).attr('id');
    });
    $navLinks.removeClass('is-active')
      .filter('[href="#' + currentId + '"]').addClass('is-active');
  }
  $(window).on('scroll', updateActiveLink);
  updateActiveLink();


  /* ---------- 4. КНОПКА "ВВЕРХ" ---------- */
  const $toTop = $('#toTop');
  $(window).on('scroll', function () {
    if ($(window).scrollTop() > 400) $toTop.stop(true, true).fadeIn(200);
    else $toTop.stop(true, true).fadeOut(200);
  });
  $toTop.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 600);
  });


  /* ---------- 5. МОДАЛЬНОЕ ОКНО ---------- */
  const $modal = $('#modal');
  function openModal(title, text) {
    $('#modalTitle').text(title);
    $('#modalText').text(text);
    $modal.addClass('is-open').attr('aria-hidden', 'false');
  }
  function closeModal() {
    $modal.removeClass('is-open').attr('aria-hidden', 'true');
  }
  $modal.on('click', '[data-close]', closeModal);
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });


  /* ---------- 6. ГАЛЕРЕЯ ИЗ portfolio.json ---------- */
  function renderPortfolio(items) {
    const $grid = $('#portfolioGrid').empty();
    $.each(items, function (i, item) {
      const $card = $(
        '<article class="card" tabindex="0">' +
          '<div class="thumb"></div>' +
          '<h3></h3>' +
          '<p></p>' +
        '</article>'
      );
      $card.find('.thumb').text(item.icon || '🎮');
      $card.find('h3').text(item.title || '');
      $card.find('p').text(item.description || '');

      $card.on('click', function () {
        openModal(item.title, item.description);
      });
      $card.on('keypress', function (e) {
        if (e.key === 'Enter') openModal(item.title, item.description);
      });

      $grid.append($card);
      $card.hide().delay(i * 100).fadeIn(400);
    });
  }

  $.getJSON('data/portfolio.json')
    .done(function (items) {
      renderPortfolio(items);
    })
    .fail(function () {
      const fallback = [
        { title: 'Лаба №1', description: 'Страница-визитка в стиле Pac-Man.', icon: '👻' },
        { title: 'Лаба №2', description: 'Динамика на jQuery: галерея, модалки, слайдер.', icon: '🍒' },
        { title: 'Лаба №3', description: 'Калькулятор на JavaScript.', icon: '⭐' },
        { title: 'Пет-проект', description: 'ToDo-лист с LocalStorage.', icon: '📋' },
        { title: 'Пет-проект', description: 'Погода через OpenWeather API.', icon: '🌤️' },
        { title: 'Курсовая', description: 'Веб-интерфейс системы учёта заявок.', icon: '📊' }
      ];
      renderPortfolio(fallback);
      console.warn('portfolio.json не загрузился — использован фолбэк.');
    });


  /* ---------- 7. ФОРМА + ВАЛИДАЦИЯ + $.ajax ---------- */
  const $form = $('#contactForm');
  const $status = $('#formStatus');

  function setError(field, msg) {
    const $f = $('[name="' + field + '"]').closest('.form__field');
    $f.addClass('is-invalid');
    $f.find('.form__error').text(msg || '');
  }
  function clearError(field) {
    const $f = $('[name="' + field + '"]').closest('.form__field');
    $f.removeClass('is-invalid');
    $f.find('.form__error').text('');
  }
  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function validateForm() {
    let ok = true;
    const name = $('#fieldName').val().trim();
    const email = $('#fieldEmail').val().trim();
    const msg = $('#fieldMessage').val().trim();

    if (name.length < 2) { setError('name', 'Минимум 2 символа'); ok = false; }
    else clearError('name');

    if (!isEmail(email)) { setError('email', 'Некорректный email'); ok = false; }
    else clearError('email');

    if (msg.length < 5) { setError('message', 'Минимум 5 символов'); ok = false; }
    else clearError('message');

    return ok;
  }

  $form.on('input', 'input, textarea', function () {
    clearError($(this).attr('name'));
  });

  $form.on('submit', function (e) {
    e.preventDefault();
    $status.removeClass('is-success is-error').text('');

    if (!validateForm()) {
      $status.addClass('is-error').text('⚠ Проверьте поля формы');
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
        $status.addClass('is-success').text('✔ Сообщение отправлено! ID: ' + res.id);
        $form[0].reset();
        bumpScore(500);
      })
      .fail(function () {
        $status.addClass('is-error').text('✖ Ошибка отправки. Попробуйте позже.');
      })
      .always(function () {
        $submit.prop('disabled', false).text('▶ Отправить');
      });
  });


  /* ---------- 8. КАРУСЕЛЬ НАВЫКОВ ---------- */
  const $track = $('#skillTrack');
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
  function maxIndex() {
    return Math.max(0, $slides.length - perView);
  }
  function goTo(i) {
    idx = Math.max(0, Math.min(i, maxIndex()));
    const step = 100 / perView;
    $track.css('transform', 'translateX(' + (-idx * step) + '%)');
  }
  function next() { goTo(idx + 1 > maxIndex() ? 0 : idx + 1); }
  function prev() { goTo(idx - 1 < 0 ? maxIndex() : idx - 1); }

  $('#nextSkill').on('click', function () { next(); resetTimer(); });
  $('#prevSkill').on('click', function () { prev(); resetTimer(); });

  function startTimer() { timer = setInterval(next, 3500); }
  function resetTimer() { clearInterval(timer); startTimer(); }

  $(window).on('resize', function () {
    perView = getPerView();
    goTo(0);
  });

  startTimer();


  /* ---------- 9. СЧЁТЧИК ОЧКОВ ---------- */
  let score = 0;
  function bumpScore(add) {
    score += add;
    $('#score').text(String(score).padStart(6, '0'));
  }
  bumpScore(100);

});