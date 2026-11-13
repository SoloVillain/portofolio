(() => {
  "use strict";

  /* ===== 1. HELPER & STATE ===== */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const pad = n => String(n).padStart(2, "0");

  const html         = document.documentElement;
  const canHover     = matchMedia("(hover:hover)").matches;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse        = { x: innerWidth / 2, y: innerHeight / 2 };

  const projects = typeof PROJECTS !== "undefined" ? PROJECTS : [];
  if (!projects.length) console.error("projects.js tidak terbaca atau kosong.");

  let lenis = null;
  const HEADER_OFFSET = 70;

  /* ===== 0. SMOOTH SCROLL ===== */
  function initSmoothScroll(){
    document.addEventListener("click", e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href === "#" || href.startsWith("#/")) return;
      let target;
      try { target = document.querySelector(href); } catch (err) { return; }
      if (!target) return;

      e.preventDefault();

      if (lenis){
        lenis.scrollTo(target, { offset: -HEADER_OFFSET, duration: 1.2 });
      } else {
        const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        window.scrollTo({ top, behavior: "smooth" });
      }
      try { history.replaceState(null, "", href); } catch (err) {}
    });

    if (typeof window.Lenis !== "function") return;

    lenis = new window.Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      smoothWheel: true,
      syncTouch: false,
    });

    function raf(time){
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ===== 2. TEMA ===== */
  function initTheme(){
    const btn = $("#theme");
    function setTheme(mode){
      html.setAttribute("data-theme", mode);
      btn.textContent = mode === "dark" ? "Light" : "Dark";
      try { localStorage.setItem("theme", mode); } catch (e) {}
    }
    let saved = "dark";
    try { saved = localStorage.getItem("theme") || "dark"; } catch (e) {}
    setTheme(saved);
    btn.addEventListener("click", () => {
      setTheme(html.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ===== 3. LOADER ===== */
  function initLoader(onReady){
    const num = $("#loader-num");
    const duration = reduceMotion ? 1 : 1400;
    const start = performance.now();

    function tick(now){
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      num.textContent = Math.round(eased * 100);
      if (p < 1) return requestAnimationFrame(tick);

      document.body.classList.add("loaded");
      setTimeout(() => {
        html.classList.add("ready");
        onReady();
      }, 500);
    }
    requestAnimationFrame(tick);
  }

  /* ===== 4. EFEK MENGETIK ===== */
  function initTyping(){
    const words  = ["Web Developer", "UI/UX Designer", "Gamer", "Creative Coder"];
    const target = $("#typing");
    let wi = 0, ci = 0, deleting = false;

    (function type(){
      const word = words[wi];
      target.textContent = word.substring(0, ci);
      let delay = deleting ? 50 : 110;

      if (!deleting && ci < word.length)      ci++;
      else if (!deleting)                     { deleting = true; delay = 1400; }
      else if (ci > 0)                        ci--;
      else                                    { deleting = false; wi = (wi + 1) % words.length; delay = 300; }

      setTimeout(type, delay);
    })();
  }

  /* ===== 5. MENU MOBILE ===== */
  function initNav(){
    const nav = $("#nav"), burger = $("#burger");

    burger.addEventListener("click", () => {
      nav.classList.toggle("open");
      burger.textContent = nav.classList.contains("open") ? "Close" : "Menu";
    });
    $$("a", nav).forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("open");
      burger.textContent = "Menu";
    }));

    const links = $$("a", nav);
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.remove("active"));
      const a = $('a[href="#' + e.target.id + '"]', nav);
      if (a) a.classList.add("active");
    }), { rootMargin: "-45% 0px -50% 0px" });

    $$("main section[id]").forEach(s => io.observe(s));
  }

  /* ===== 6. DAFTAR PROYEK ===== */
  function renderProjectList(){
    const box = $("#projs");
    if (!box) return;
    box.innerHTML = projects.map((p, i) =>
      '<a class="proj" href="#/work/' + p.id + '"' +
      ' data-img="' + (p.images[0] || "") + '" data-grad="' + p.grad + '">' +
        '<span class="n">' + pad(i + 1) + '</span>' +
        '<h3>' + p.title + '</h3>' +
        '<span class="t">' + p.tags + '</span>' +
        '<span class="y">' + p.year + '</span>' +
        '<span class="ar">↗</span>' +
      '</a>'
    ).join("");
  }

  /* ===== 7. REVEAL & HITUNG ANGKA ===== */
  function initReveal(){
    $$("[data-stagger]").forEach(parent => {
      [...parent.children].forEach((child, i) => child.style.setProperty("--i", i));
    });

    function countUp(el){
      const target = +el.dataset.count;
      const step = Math.max(1, Math.ceil(target / 40));
      let n = 0;
      const timer = setInterval(() => {
        n = Math.min(target, n + step);
        el.textContent = n + (target >= 10 ? "+" : "");
        if (n >= target) clearInterval(timer);
      }, 40);
    }

    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("show");
      $$("[data-count]", e.target).forEach(countUp);
      io.unobserve(e.target);
    }), { threshold: 0.15 });

    $$(".rv, [data-stagger]").forEach(el => io.observe(el));
  }

  /* ===== 8. TOMBOL MAGNETIK ===== */
  function initMagnetic(){
    if (!canHover) return;
    $$(".btn, .tbtn").forEach(el => {
      el.addEventListener("mousemove", e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.3;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.3;
        el.style.transform = "translate(" + x + "px," + y + "px)";
      });
      el.addEventListener("mouseleave", () => el.style.transform = "");
    });
  }

  /* ===== 9. KURSOR & PREVIEW ===== */
  const follow = { cx: mouse.x, cy: mouse.y, px: mouse.x, py: mouse.y };

  function initCursor(){
    if (!canHover) return;
    const cursor  = $("#cursor");
    const preview = $("#preview");

    window.addEventListener("mousemove", e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      cursor.classList.add("on");
    }, { passive: true });
    document.addEventListener("mouseleave", () => cursor.classList.remove("on"));

    const hoverable = "a, button, .row, .chips span, .d-frame";
    document.addEventListener("mouseover", e => {
      if (e.target.closest(hoverable)) cursor.classList.add("big");
    });
    document.addEventListener("mouseout", e => {
      if (e.target.closest(hoverable)) cursor.classList.remove("big");
    });

    $$(".proj").forEach(p => {
      p.addEventListener("mouseenter", () => {
        const img = p.dataset.img ? "url('" + p.dataset.img + "')," : "";
        preview.style.backgroundImage = img + p.dataset.grad;
        preview.classList.add("on");
      });
      p.addEventListener("mouseleave", () => preview.classList.remove("on"));
    });
  }

  /* ===== 10. HALAMAN DETAIL PROYEK ===== */
  function initDetail(){
    const detail  = $("#detail");
    const content = $("#d-content");
    const scroller = $("#d-scroll");
    const counter = $("#d-count");
    const preview = $("#preview");

    let current = null;
    let active  = 0;
    let savedY  = null;
    let frames = [], thumbs = [], track = null, stage = null;
    let autoSlideInterval = null; // Menyimpan ID interval auto-slide

    // Fungsi kontrol Auto-Slide
    function startAutoSlide() {
      stopAutoSlide();
      if (frames.length <= 1) return; // Tidak perlu slide kalau cuma 1 gambar
      autoSlideInterval = setInterval(() => {
        setActive(active + 1);
      }, 4000); // 4000ms = 4 detik
    }
    
    function stopAutoSlide() {
      if (autoSlideInterval) clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }

    function resetAutoSlide() {
      stopAutoSlide();
      startAutoSlide();
    }

    function render(p, index){
      const next   = projects[(index + 1) % projects.length];
      const images = p.images.length ? p.images : [null, null, null];

      const frameHTML = images.map((src, i) =>
        '<figure class="d-frame" data-i="' + i + '">' +
          '<span class="d-ph">' + p.title + '<small>' + pad(i + 1) + '</small></span>' +
          (src ? '<img src="' + src + '" alt="' + p.title + ' tampilan ' + (i + 1) + '" loading="lazy" decoding="async" onerror="this.remove()">' : "") +
        '</figure>'
      ).join("");

      const thumbHTML = images.map((src, i) =>
        '<button class="d-thumb" data-i="' + i + '" aria-label="Lihat gambar ' + (i + 1) + '">' + pad(i + 1) +
          (src ? '<img src="' + src + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : "") +
        '</button>'
      ).join("");

      const links =
        (p.live   ? '<a class="btn fill" href="' + p.live   + '" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>' : "") +
        (p.github ? '<a class="btn line" href="' + p.github + '" target="_blank" rel="noopener noreferrer">GitHub ↗</a>'   : "") ||
        '<span class="d-none">Belum ada link publik.</span>';

      content.style.setProperty("--g", p.grad);
      
      // Tambahkan tombol d-prev dan d-next ke dalam string HTML
      content.innerHTML =
        '<section class="d-stage d-anim" style="--i:0" id="d-stage">' +
          '<button class="d-nav prev" id="d-prev" aria-label="Gambar sebelumnya">←</button>' +
          '<div class="d-track" id="d-track">' + frameHTML + '</div>' +
          '<button class="d-nav next" id="d-next" aria-label="Gambar selanjutnya">→</button>' +
        '</section>' +
        '<section class="d-info d-anim" style="--i:1">' +
          '<div class="d-col"><h4>Project</h4><h2>' + p.title + '</h2><span class="d-year">' + p.year + '</span></div>' +
          '<div class="d-col"><h4>Info</h4><p>' + p.info + '</p><div class="d-stack">' + p.stack.map(s => "<span>" + s + "</span>").join("") + '</div></div>' +
          '<div class="d-col"><h4>Role</h4><ul>' + p.roles.map(r => "<li>" + r + "</li>").join("") + '</ul></div>' +
          '<div class="d-col"><h4>Links</h4><div class="d-links">' + links + '</div></div>' +
        '</section>' +
        '<section class="d-thumbs d-anim" style="--i:2">' + thumbHTML + '</section>' +
        '<a class="d-next d-anim" style="--i:3" href="#/work/' + next.id + '"><span>Next project</span><b>' + next.title + ' →</b></a>';

      stage  = $("#d-stage");
      track  = $("#d-track");
      frames = $$(".d-frame", content);
      thumbs = $$(".d-thumb", content);

      frames.forEach(f => f.addEventListener("click", () => { resetAutoSlide(); setActive(+f.dataset.i); }));
      thumbs.forEach(t => t.addEventListener("click", () => { resetAutoSlide(); setActive(+t.dataset.i); }));
      
      // Pasang event listener tombol panah
      $("#d-prev").addEventListener("click", () => { resetAutoSlide(); setActive(active - 1); });
      $("#d-next").addEventListener("click", () => { resetAutoSlide(); setActive(active + 1); });

      // Pause auto-slide saat mouse hover di area galeri
      stage.addEventListener("mouseenter", stopAutoSlide);
      stage.addEventListener("mouseleave", startAutoSlide);

      enableSwipe();
    }

    function setActive(i, instant){
      // Looping gambar
      if (i < 0) i = frames.length - 1;
      if (i >= frames.length) i = 0;

      active = i;
      frames.forEach((f, n) => f.classList.toggle("active", n === active));
      thumbs.forEach((t, n) => t.classList.toggle("active", n === active));

      const f = frames[active];
      const x = stage.clientWidth / 2 - (f.offsetLeft + f.offsetWidth / 2);
      if (instant) track.style.transition = "none";
      track.style.transform = "translateX(" + x + "px)";
      if (instant) { track.offsetWidth; track.style.transition = ""; }
    }

    function enableSwipe(){
      let startX = null;
      stage.addEventListener("pointerdown", e => { 
        startX = e.clientX; 
        stopAutoSlide(); // Pause saat mulai geser
      });
      stage.addEventListener("pointerup", e => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 50) setActive(active + (dx < 0 ? 1 : -1));
        startX = null;
        startAutoSlide(); // Lanjut lagi setelah geser
      });
    }

    function open(id){
      const index = projects.findIndex(p => p.id === id);
      if (index < 0) return close();

      const wasClosed = !detail.classList.contains("open");
      if (wasClosed) savedY = scrollY;

      current = projects[index];
      render(current, index);
      setActive(0, true);
      counter.textContent = pad(index + 1) + " / " + pad(projects.length);
      scroller.scrollTop = 0;
      preview.classList.remove("on");

      if (lenis) lenis.stop();

      detail.classList.add("open");
      detail.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      if (wasClosed) $("#d-close").focus({ preventScroll: true });

      startAutoSlide(); // Mulai auto slide saat detail dibuka
    }

    function close(){
      if (!detail.classList.contains("open")) return;
      detail.classList.remove("open");
      detail.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      current = null;
      
      stopAutoSlide(); // Matikan interval saat detail ditutup

      if (savedY !== null) {
        if (lenis) lenis.scrollTo(savedY, { immediate: true });
        else window.scrollTo({ top: savedY, behavior: "instant" });
      }
      savedY = null;

      if (lenis) lenis.start();
    }

    function route(){
      const m = location.hash.match(/^#\/work\/([\w-]+)/);
      m ? open(m[1]) : close();
    }
    window.addEventListener("hashchange", route);

    function closeFromUI(){
      try { history.replaceState(null, "", location.pathname + location.search); }
      catch (e) { location.replace("#work"); return; }
      route();
    }
    $("#d-close").addEventListener("click", closeFromUI);

    document.addEventListener("keydown", e => {
      if (!detail.classList.contains("open")) return;
      if (e.key === "Escape")     closeFromUI();
      if (e.key === "ArrowRight") { resetAutoSlide(); setActive(active + 1); }
      if (e.key === "ArrowLeft")  { resetAutoSlide(); setActive(active - 1); }
    });

    window.addEventListener("resize", () => { if (current) setActive(active); });

    function preloadAll(){
      projects.forEach(p => p.images.forEach(src => {
        const im = new Image();
        im.decoding = "async";
        im.src = src;
        if (im.decode) im.decode().catch(() => {});
      }));
    }

    return { route, preloadAll };
  }

  /* ===== 11. LOOP ANIMASI ===== */
  function initLoop(){
    const cursor  = $("#cursor");
    const preview = $("#preview");
    const photo   = $("#photo-wrap");
    const bar     = $("#progress");
    const track   = $("#track");
    const header  = $(".top");

    track.innerHTML += track.innerHTML;
    const marquee = track.getAnimations()[0];

    let lastY = scrollY, speed = 1, rate = 1;
    header.classList.toggle("scrolled", scrollY > 40);

    const PARALLAX = reduceMotion ? 0 : 0.08;

    function frame(){
      if (canHover) {
        follow.cx += (mouse.x - follow.cx) * 0.2;
        follow.cy += (mouse.y - follow.cy) * 0.2;
        follow.px += (mouse.x + 24 - follow.px) * 0.12;
        follow.py += (mouse.y - 115 - follow.py) * 0.12;
        cursor.style.translate  = follow.cx + "px " + follow.cy + "px";
        preview.style.translate = follow.px + "px " + follow.py + "px";
      }

      const y = scrollY;
      if (y !== lastY) {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
        if (PARALLAX) {
          photo.style.transform = "translate3d(0," + (Math.min(y, innerHeight) * PARALLAX) + "px,0)";
        }
        header.classList.toggle("scrolled", y > 40);
      }

      speed += (1 + Math.min(Math.abs(y - lastY) * 0.25, 6) - speed) * 0.08;
      lastY = y;
      if (marquee && Math.abs(speed - rate) > 0.05) {
        rate = Math.abs(speed - 1) < 0.05 ? 1 : speed;
        marquee.playbackRate = rate;
      }

      requestAnimationFrame(frame);
    }
    frame();
  }

  /* ===== 12. FORM KONTAK ===== */
  function initForm(){
    const form = $("#form"), toast = $("#toast");
    form.addEventListener("submit", e => {
      e.preventDefault();
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      })
        .then(r => { if (!r.ok) throw new Error(); toast.textContent = "Pesan terkirim, terima kasih!"; form.reset(); })
        .catch(() => { toast.textContent = "Gagal mengirim. Coba lagi nanti."; });
    });
  }

  /* ===== 13. JALANKAN SEMUANYA ===== */
  const safe = fn => { try { return fn(); } catch (e) { console.error("Error di " + (fn.name || "fungsi") + ":", e); } };

  let detailApi = { route: () => {}, preloadAll: () => {} };

  safe(initSmoothScroll);
  safe(initTheme);
  safe(initNav);
  safe(renderProjectList);
  safe(initReveal);
  safe(initMagnetic);
  safe(initCursor);
  detailApi = safe(initDetail) || detailApi;
  safe(initLoop);
  safe(initForm);

  initLoader(() => {
    safe(initTyping);
    safe(detailApi.route);
    setTimeout(() => safe(detailApi.preloadAll), 800);
  });

})();