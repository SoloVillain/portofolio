/* =====================================================
   DAFTAR ISI
   1. Helper & state
   2. Tema gelap / terang
   3. Loader
   4. Efek mengetik
   5. Menu mobile & menu aktif
   6. Daftar proyek (dibuat dari projects.js)
   7. Reveal saat scroll + hitung angka
   8. Tombol magnetik
   9. Kursor & preview proyek
  10. Halaman detail proyek
  11. Loop animasi (parallax, progress, marquee)
  12. Form kontak
  13. Jalankan semuanya
   ===================================================== */

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

  // data dari projects.js (kalau file itu tidak terbaca, halaman tetap jalan)
  const projects = typeof PROJECTS !== "undefined" ? PROJECTS : [];
  if (!projects.length) console.error("projects.js tidak terbaca atau kosong. Pastikan file ada di folder yang sama dengan index.html.");


  /* ===== 2. TEMA GELAP / TERANG ===== */
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
      const eased = 1 - Math.pow(1 - p, 3);          // melambat di akhir
      num.textContent = Math.round(eased * 100);
      if (p < 1) return requestAnimationFrame(tick);

      document.body.classList.add("loaded");         // loader naik ke atas
      setTimeout(() => {
        html.classList.add("ready");                 // animasi hero dimulai
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


  /* ===== 5. MENU MOBILE & MENU AKTIF ===== */
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

    // tandai menu sesuai section yang sedang terlihat
    const links = $$("a", nav);
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.remove("active"));
      const a = $('a[href="#' + e.target.id + '"]', nav);
      if (a) a.classList.add("active");
    }), { rootMargin: "-45% 0px -50% 0px" });

    $$("main section[id]").forEach(s => io.observe(s));
  }


  /* ===== 6. DAFTAR PROYEK (dibuat dari projects.js) ===== */
  function renderProjectList(){
    const box = $("#projs");
    if (!box) return console.error("Elemen #projs tidak ada. Pastikan index.html adalah versi terbaru.");
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


  /* ===== 7. REVEAL SAAT SCROLL + HITUNG ANGKA ===== */
  function initReveal(){
    // beri nomor urut ke anak-anak agar munculnya bergantian
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


  /* ===== 9. KURSOR & PREVIEW PROYEK ===== */
  const follow = { cx: mouse.x, cy: mouse.y, px: mouse.x, py: mouse.y };

  function initCursor(){
    if (!canHover) return;
    const cursor  = $("#cursor");
    const preview = $("#preview");

    window.addEventListener("mousemove", e => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      cursor.classList.add("on");
    });
    document.addEventListener("mouseleave", () => cursor.classList.remove("on"));

    // kursor membesar di atas elemen yang bisa diklik
    // (delegasi event, jadi elemen detail yang dibuat belakangan ikut terdeteksi)
    const hoverable = "a, button, .row, .chips span, .d-frame";
    document.addEventListener("mouseover", e => {
      if (e.target.closest(hoverable)) cursor.classList.add("big");
    });
    document.addEventListener("mouseout", e => {
      if (e.target.closest(hoverable)) cursor.classList.remove("big");
    });

    // preview gambar saat hover baris proyek
    $$(".proj").forEach(p => {
      p.addEventListener("mouseenter", () => {
        const img = p.dataset.img ? "url('" + p.dataset.img + "')," : "";
        preview.style.backgroundImage = img + p.dataset.grad;
        preview.classList.add("on");
      });
      p.addEventListener("mouseleave", () => preview.classList.remove("on"));
    });
  }


  /* ===== 10. HALAMAN DETAIL PROYEK =====
     Alamatnya memakai hash:  #/work/stockin
     - klik baris proyek  -> hash berubah -> detail terbuka
     - tombol Back browser / Esc / Close -> detail tertutup
     - link detail bisa dibagikan, langsung membuka proyeknya */
  function initDetail(){
    const detail  = $("#detail");
    const content = $("#d-content");
    const scroller = $("#d-scroll");
    const counter = $("#d-count");
    const preview = $("#preview");

    let current = null;      // proyek yang sedang terbuka
    let active  = 0;         // gambar yang sedang di tengah galeri
    let savedY  = null;      // posisi scroll halaman sebelum detail dibuka
    let frames = [], thumbs = [], track = null, stage = null;

    /* -- membuat isi halaman detail -- */
    function render(p, index){
      const next   = projects[(index + 1) % projects.length];
      const images = p.images.length ? p.images : [null, null, null];   // tanpa gambar -> 3 placeholder

      const frameHTML = images.map((src, i) =>
        '<figure class="d-frame" data-i="' + i + '">' +
          '<span class="d-ph">' + p.title + '<small>' + pad(i + 1) + '</small></span>' +
          (src ? '<img src="' + src + '" alt="' + p.title + ' tampilan ' + (i + 1) + '" decoding="async" onerror="this.remove()">' : "") +
        '</figure>'
      ).join("");

      const thumbHTML = images.map((src, i) =>
        '<button class="d-thumb" data-i="' + i + '" aria-label="Lihat gambar ' + (i + 1) + '">' + pad(i + 1) +
          (src ? '<img src="' + src + '" alt="" decoding="async" onerror="this.remove()">' : "") +
        '</button>'
      ).join("");

      const links =
        (p.live   ? '<a class="btn fill" href="' + p.live   + '" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>' : "") +
        (p.github ? '<a class="btn line" href="' + p.github + '" target="_blank" rel="noopener noreferrer">GitHub ↗</a>'   : "") ||
        '<span class="d-none">Belum ada link publik.</span>';

      content.style.setProperty("--g", p.grad);
      content.innerHTML =
        '<section class="d-stage d-anim" style="--i:0" id="d-stage"><div class="d-track" id="d-track">' + frameHTML + '</div></section>' +
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

      frames.forEach(f => f.addEventListener("click", () => setActive(+f.dataset.i)));
      thumbs.forEach(t => t.addEventListener("click", () => setActive(+t.dataset.i)));
      enableSwipe();
    }

    /* -- menaruh gambar pilihan di tengah galeri -- */
    function setActive(i, instant){
      active = Math.max(0, Math.min(frames.length - 1, i));
      frames.forEach((f, n) => f.classList.toggle("active", n === active));
      thumbs.forEach((t, n) => t.classList.toggle("active", n === active));

      const f = frames[active];
      const x = stage.clientWidth / 2 - (f.offsetLeft + f.offsetWidth / 2);
      if (instant) track.style.transition = "none";     // penempatan awal tanpa animasi
      track.style.transform = "translateX(" + x + "px)";
      if (instant) { track.offsetWidth; track.style.transition = ""; }
    }

    /* -- geser kiri/kanan dengan jari atau mouse -- */
    function enableSwipe(){
      let startX = null;
      stage.addEventListener("pointerdown", e => { startX = e.clientX; });
      stage.addEventListener("pointerup", e => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 50) setActive(active + (dx < 0 ? 1 : -1));
        startX = null;
      });
    }

    /* -- buka / tutup -- */
    function open(id){
      const index = projects.findIndex(p => p.id === id);
      if (index < 0) return close();

      const wasClosed = !detail.classList.contains("open");
      if (wasClosed) savedY = scrollY;

      current = projects[index];
      render(current, index);                 // isi dibuat dulu selagi lapisan masih di luar layar
      setActive(0, true);
      counter.textContent = pad(index + 1) + " / " + pad(projects.length);
      scroller.scrollTop = 0;
      preview.classList.remove("on");

      detail.classList.add("open");           // baru digeser masuk
      detail.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      if (wasClosed) $("#d-close").focus({ preventScroll: true });
    }

    function close(){
      if (!detail.classList.contains("open")) return;
      detail.classList.remove("open");
      detail.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      current = null;

      // kembalikan posisi scroll seperti sebelum detail dibuka
      if (savedY !== null) scrollTo({ top: savedY, behavior: "instant" });
      savedY = null;
    }

    /* -- router: hash di URL menentukan buka atau tutup -- */
    function route(){
      const m = location.hash.match(/^#\/work\/([\w-]+)/);
      m ? open(m[1]) : close();
    }
    window.addEventListener("hashchange", route);

    // tutup lewat tombol / Esc: hapus hash dari URL tanpa memicu lompatan scroll
    function closeFromUI(){
      try { history.replaceState(null, "", location.pathname + location.search); }
      catch (e) { location.replace("#work"); return; }
      route();
    }
    $("#d-close").addEventListener("click", closeFromUI);

    /* -- keyboard -- */
    document.addEventListener("keydown", e => {
      if (!detail.classList.contains("open")) return;
      if (e.key === "Escape")     closeFromUI();
      if (e.key === "ArrowRight") setActive(active + 1);
      if (e.key === "ArrowLeft")  setActive(active - 1);
    });

    window.addEventListener("resize", () => { if (current) setActive(active); });

    /* -- pramuat & decode semua gambar proyek di waktu senggang -- */
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


  /* ===== 11. LOOP ANIMASI (parallax, progress, marquee) ===== */
  function initLoop(){
    const cursor  = $("#cursor");
    const preview = $("#preview");
    const photo   = $("#photo-wrap");
    const bar     = $("#progress");
    const track   = $("#track");
    const header  = $(".top");

    // gandakan isi marquee supaya looping mulus
    track.innerHTML += track.innerHTML;
    const marquee = track.getAnimations()[0];
    let lastY = scrollY, speed = 1, rate = 1;
    header.classList.toggle("scrolled", scrollY > 40);

    function frame(){
      // kursor & preview mengikuti mouse dengan gerak "menyusul"
      follow.cx += (mouse.x - follow.cx) * 0.2;
      follow.cy += (mouse.y - follow.cy) * 0.2;
      follow.px += (mouse.x + 24 - follow.px) * 0.12;
      follow.py += (mouse.y - 115 - follow.py) * 0.12;
      // pakai properti "translate" (bukan transform) supaya tidak bentrok dengan "scale" di CSS
      cursor.style.translate  = follow.cx + "px " + follow.cy + "px";
      preview.style.translate = follow.px + "px " + follow.py + "px";

      // progress bar, parallax foto, header: hanya diperbarui saat halaman benar-benar di-scroll
      const y = scrollY;
      if (y !== lastY) {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
        photo.style.setProperty("--py", Math.min(y, innerHeight) * 0.08 + "px");
        header.classList.toggle("scrolled", y > 40);
      }

      // marquee ngebut saat scroll cepat, lalu pelan lagi
      // (kecepatan baru hanya dipasang kalau berubah cukup jauh, supaya animasinya tidak tersentak)
      speed += (1 + Math.min(Math.abs(y - lastY) * 0.25, 6) - speed) * 0.08;
      lastY = y;
      if (marquee && Math.abs(speed - rate) > 0.02) {
        rate = Math.abs(speed - 1) < 0.02 ? 1 : speed;
        marquee.playbackRate = rate;
      }

      requestAnimationFrame(frame);
    }
    frame();
  }


  /* ===== 12. FORM KONTAK (Netlify Forms) ===== */
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


  /* ===== 13. JALANKAN SEMUANYA =====
     Setiap langkah dibungkus safe(): kalau satu bagian error,
     pesannya muncul di Console (F12) tapi bagian lain dan loader
     tetap jalan, jadi halaman tidak pernah macet di 0%. */
  const safe = fn => { try { return fn(); } catch (e) { console.error("Error di " + (fn.name || "fungsi") + ":", e); } };

  let detailApi = { route: () => {}, preloadAll: () => {} };

  safe(initTheme);
  safe(initNav);
  safe(renderProjectList);      // harus sebelum reveal & kursor, karena membuat elemennya
  safe(initReveal);
  safe(initMagnetic);
  safe(initCursor);
  detailApi = safe(initDetail) || detailApi;
  safe(initLoop);
  safe(initForm);

  initLoader(() => {
    safe(initTyping);           // mengetik baru mulai setelah loader selesai
    safe(detailApi.route);      // kalau URL langsung berisi #/work/..., buka detailnya
    setTimeout(() => safe(detailApi.preloadAll), 800);   // pramuat gambar proyek
  });

})();