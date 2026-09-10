/* ============================================================
   Recomeço à Vitória — interações
   ============================================================ */

// Número de WhatsApp (formato internacional, somente dígitos: 55 + DDD + número).
// ATENÇÃO: confirme o número completo com o cliente antes de publicar.
const WHATSAPP = "5554999819588";
const MSG_PADRAO = "Olá! Gostaria de falar com um especialista da Recomeço à Vitória sobre tratamento e internação.";

function abrirWhatsApp(texto) {
  const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto || MSG_PADRAO)}`;
  window.open(url, "_blank", "noopener");
}

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const navLinks = [...document.querySelectorAll(".nav__link")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Menu mobile ---- */
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  navLinks.forEach((link) =>
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---- Sombra no header ao rolar ---- */
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Links de WhatsApp ---- */
  document.querySelectorAll("[data-whatsapp]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      abrirWhatsApp();
    })
  );

  /* ---- Formulário → WhatsApp ---- */
  const form = document.getElementById("contatoForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = form.nome.value.trim();
      const telefone = form.telefone.value.trim();
      const mensagem = form.mensagem.value.trim();
      if (!nome || !telefone) {
        form.reportValidity();
        return;
      }
      const texto =
        `Olá! Meu nome é ${nome}.` +
        `\nTelefone/WhatsApp: ${telefone}.` +
        (mensagem ? `\nMensagem: ${mensagem}` : "") +
        `\n\nGostaria de falar com um coordenador clínico da Recomeço à Vitória.`;
      abrirWhatsApp(texto);
    });
  }

  /* ---- Reveal ao rolar (com stagger por grupo) ---- */
  const reveals = document.querySelectorAll(".reveal");
  reveals.forEach((el) => {
    const group = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.setProperty("--reveal-i", Math.max(0, group.indexOf(el)));
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---- Nav ativa conforme a seção visível ---- */
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = "#" + entry.target.id;
            navLinks.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === id));
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((sec) => spy.observe(sec));
  }

  /* ---- Parallax leve no hero ---- */
  const hero = document.querySelector(".hero");
  const watermark = document.querySelector(".hero__watermark");
  if (hero && !reduceMotion) {
    let ticking = false;
    const applyParallax = () => {
      const y = window.scrollY;
      if (y <= window.innerHeight) {
        hero.style.backgroundPositionY = `calc(50% + ${(y * 0.15).toFixed(1)}px)`;
        if (watermark) watermark.style.transform = `translateY(calc(-50% + ${(y * 0.06).toFixed(1)}px))`;
      }
      ticking = false;
    };
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(applyParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---- Contadores animados nas stats ---- */
  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }
    const dur = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length && "IntersectionObserver" in window) {
    const cObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCounter(e.target);
            cObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cObs.observe(c));
  } else {
    counters.forEach(runCounter);
  }
});
