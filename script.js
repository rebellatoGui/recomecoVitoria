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

function dividirEmLinhas(el) {
  if (!el || el.dataset.split === "done") return [];
  const texto = el.textContent.trim();
  el.dataset.original = texto;
  el.innerHTML = texto
    .split(/\s+/)
    .map((p) => `<span class="palavra">${p}</span>`)
    .join(" ");

  const palavras = [...el.querySelectorAll(".palavra")];
  const linhas = [];
  let topoAtual = null;
  palavras.forEach((palavra) => {
    const topo = Math.round(palavra.offsetTop);
    if (topoAtual === null || topo !== topoAtual) {
      linhas.push([]);
      topoAtual = topo;
    }
    linhas[linhas.length - 1].push(palavra.textContent);
  });

  el.innerHTML = linhas
    .map((linha) => `<span class="line-mask"><span class="line-mask__inner">${linha.join(" ")}</span></span>`)
    .join("");
  el.dataset.split = "done";
  return [...el.querySelectorAll(".line-mask__inner")];
}

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const navLinks = [...document.querySelectorAll(".nav__link")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const temGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

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

  /* ---- Carrossel da estrutura ---- */
  const carrossel = document.querySelector(".carrossel");
  if (carrossel) {
    const trilho = carrossel.querySelector(".carrossel__trilho");
    const slides = [...trilho.children];
    const anterior = carrossel.querySelector('[data-carrossel="anterior"]');
    const proximo = carrossel.querySelector('[data-carrossel="proximo"]');
    const contador = carrossel.querySelector(".carrossel__contador strong");
    const barra = carrossel.querySelector(".carrossel__progresso span");
    const doisDigitos = (n) => String(n).padStart(2, "0");

    const passo = () => slides[0].getBoundingClientRect().width + parseFloat(getComputedStyle(trilho).columnGap || 0);

    const atualizar = () => {
      const maximo = trilho.scrollWidth - trilho.clientWidth;
      const progresso = maximo > 0 ? trilho.scrollLeft / maximo : 1;
      contador.textContent = doisDigitos(Math.round(progresso * (slides.length - 1)) + 1);
      barra.style.transform = `scaleX(${Math.max(1 / slides.length, progresso)})`;
      anterior.disabled = trilho.scrollLeft < 4;
      proximo.disabled = trilho.scrollLeft > maximo - 4;
    };

    anterior.addEventListener("click", () => trilho.scrollBy({ left: -passo() }));
    proximo.addEventListener("click", () => trilho.scrollBy({ left: passo() }));
    trilho.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); trilho.scrollBy({ left: passo() }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); trilho.scrollBy({ left: -passo() }); }
    });
    trilho.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    atualizar();
  }

  const counters = document.querySelectorAll("[data-count]");
  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) {
      el.textContent = prefix + target + suffix;
      return;
    }
    const obj = { v: 0 };
    if (temGsap) {
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => (el.textContent = prefix + Math.round(obj.v) + suffix),
      });
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

  /* ============================================================
     Sem GSAP: IntersectionObserver e transições de CSS
     ============================================================ */
  if (!temGsap) {
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
      reveals.forEach((el) => el.classList.add("is-visible"));
      counters.forEach(runCounter);
    }
    return;
  }

  /* ============================================================
     Camada de motion (GSAP + ScrollTrigger)
     ============================================================ */
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("gsap-ready");
  gsap.defaults({ ease: "power3.out" });

  const heroTitulo = document.querySelector(".hero__title");
  const linhasHero = dividirEmLinhas(heroTitulo);
  const titulosSecao = [...document.querySelectorAll(".section__title")];
  const linhasSecao = titulosSecao.map(dividirEmLinhas);

  gsap.matchMedia().add(
    {
      animar: "(prefers-reduced-motion: no-preference)",
      desktop: "(min-width: 768px)",
    },
    (ctx) => {
      const { animar, desktop } = ctx.conditions;

      /* ---- prefers-reduced-motion ---- */
      if (!animar) {
        gsap.set([".hero__bg", ".hero__inner > *", ".hero__watermark-wrap", ".hero__glow", ".reveal"], { opacity: 1, y: 0, clearProps: "transform" });
        gsap.set(".hero__grain", { opacity: 0.16 });
        counters.forEach(runCounter);
        return;
      }

      /* ---- Abertura do hero ---- */
      const marca = document.querySelector(".hero__watermark");
      const tracos = gsap.utils.toArray(".hero__strokes path");

      tracos.forEach((traco) => {
        const total = traco.getTotalLength();
        gsap.set(traco, { strokeDasharray: total, strokeDashoffset: total, opacity: 0 });
      });

      gsap.set(".hero__title", { opacity: 0 });

      const abertura = gsap.timeline({ defaults: { duration: 1, ease: "power3.out" } });
      abertura
        .fromTo(
          ".hero__bg",
          { opacity: 0, scale: 1.14, clipPath: "inset(18% 0% 0% 0%)" },
          { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 2.1, ease: "expo.out" }
        )
        .fromTo(".hero__overlay", { opacity: 0.62 }, { opacity: 1, duration: 1.3 }, 0.1)
        .fromTo(".hero__glow", { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 2.2, ease: "power2.out" }, 0.25)
        .fromTo(tracos, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.5)
        .to(tracos, { strokeDashoffset: 0, duration: 2.4, stagger: 0.18, ease: "power2.inOut" }, 0.5)
        .fromTo(
          ".hero__watermark-wrap",
          { opacity: 0, x: 90, scale: 1.12 },
          { opacity: 1, x: 0, scale: 1, duration: 2, ease: "expo.out" },
          0.2
        )
        .fromTo(".hero__grain", { opacity: 0 }, { opacity: 0.16, duration: 1.4 }, 0.6)
        .fromTo(".hero .badge", { opacity: 0, y: 18, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9 }, 0.35)
        .fromTo(linhasHero, { yPercent: 118 }, { yPercent: 0, duration: 1.25, stagger: 0.11, ease: "expo.out" }, 0.48)
        .set(".hero__title", { opacity: 1 }, 0.48)
        .fromTo(".hero__actions .btn", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.62)
        .set(".hero__actions", { opacity: 1 }, 0.62)
        .fromTo(".hero__support", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0.8)
        .fromTo(".hero__text", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1 }, 0.88);

      /* ---- Vida contínua ---- */
      gsap.to(marca, { scale: 1.045, duration: 9, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 2.2 });
      gsap.to(marca, { opacity: 0.2, duration: 6.5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 2.6 });
      gsap.to(".hero__glow", { opacity: 0.72, duration: 5.5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 2.4 });
      gsap.to(".hero__grain", {
        x: "+=14",
        y: "+=10",
        duration: 0.5,
        ease: "steps(3)",
        repeat: -1,
        yoyo: true,
      });

      /* ---- Partículas de luz (desktop) ---- */
      const campo = document.querySelector(".hero__particles");
      if (campo && desktop) {
        const quantidade = 16;
        for (let i = 0; i < quantidade; i++) {
          const p = document.createElement("span");
          p.className = "particula";
          const tamanho = gsap.utils.random(3, 9);
          gsap.set(p, {
            width: tamanho,
            height: tamanho,
            left: gsap.utils.random(5, 98) + "%",
            top: gsap.utils.random(10, 92) + "%",
            opacity: 0,
          });
          campo.appendChild(p);

          gsap.to(p, { opacity: gsap.utils.random(0.25, 0.7), duration: 2, delay: 1.2 + i * 0.09 });
          gsap.to(p, {
            y: gsap.utils.random(-90, -34),
            x: gsap.utils.random(-26, 26),
            duration: gsap.utils.random(9, 17),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: i * 0.25,
          });
        }
      }

      /* ---- Hero em camadas na rolagem ---- */
      gsap
        .timeline({
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
        .to(".hero__bg", { yPercent: 16, scale: 1.1, ease: "none" }, 0)
        .to(".hero__glow", { yPercent: 26, ease: "none" }, 0)
        .to(".hero__strokes", { yPercent: 34, opacity: 0.25, ease: "none" }, 0)
        .to(".hero__particles", { yPercent: 46, opacity: 0, ease: "none" }, 0)
        .to(".hero__watermark-wrap", { yPercent: 12, ease: "none" }, 0)
        .to(".hero__inner", { y: -92, opacity: 0, ease: "none" }, 0)
        .to(".hero__vignette", { opacity: 1.6, ease: "none" }, 0);

      /* ---- Trilha que serpenteia o site ---- */
      const trilha = document.querySelector(".trilha");
      if (trilha) {
        const base = trilha.querySelector(".trilha__base");
        const brilho = trilha.querySelector(".trilha__brilho");

        const desenharTrilha = () => {
          const largura = trilha.clientWidth;
          const altura = trilha.clientHeight;
          if (!largura || !altura) return;

          const cicloPx = desktop ? 620 : 460;
          const amplitude = largura * (desktop ? 0.3 : 0.22);
          const meio = largura / 2;
          const passo = 14;

          let d = "";
          for (let y = 0; y <= altura; y += passo) {
            const x = meio + Math.sin((y / cicloPx) * Math.PI * 2) * amplitude;
            d += (d ? " L " : "M ") + x.toFixed(1) + " " + y.toFixed(1);
          }

          trilha.setAttribute("viewBox", `0 0 ${largura} ${altura}`);
          base.setAttribute("d", d);
          brilho.setAttribute("d", d);

          const comprimento = brilho.getTotalLength();
          gsap.set([base, brilho], { strokeDasharray: comprimento });
          gsap.set(base, { strokeDashoffset: 0 });
          return comprimento;
        };

        desenharTrilha();

        gsap.fromTo(
          brilho,
          { strokeDashoffset: () => brilho.getTotalLength() },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: trilha,
              start: "top 80%",
              end: "bottom bottom",
              scrub: 0.8,
              invalidateOnRefresh: true,
              onRefresh: desenharTrilha,
            },
          }
        );
      }

      /* ---- Títulos de seção revelados por máscara ---- */
      titulosSecao.forEach((titulo, i) => {
        const linhas = linhasSecao[i];
        if (!linhas.length) return;
        gsap.fromTo(
          linhas,
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1,
            stagger: 0.08,
            scrollTrigger: { trigger: titulo, start: "top 88%", once: true },
          }
        );
      });

      /* ---- Reveals em cascata ---- */
      const reveals = [...document.querySelectorAll(".reveal")].filter((el) => !el.classList.contains("sobre__media"));
      gsap.set(reveals, { opacity: 0, y: 34 });
      ScrollTrigger.batch(reveals, {
        start: "top 88%",
        once: true,
        onEnter: (lote) =>
          gsap.to(lote, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.11,
            overwrite: true,
          }),
      });

      /* ---- Depoimentos ---- */
      gsap.utils.toArray(".quote").forEach((quote, i) => {
        gsap.fromTo(
          quote,
          { x: i % 2 === 0 ? -26 : 26 },
          {
            x: 0,
            duration: 1.1,
            scrollTrigger: { trigger: quote, start: "top 88%", once: true },
          }
        );
      });

      /* ---- Contadores ---- */
      counters.forEach((c) =>
        ScrollTrigger.create({
          trigger: c,
          start: "top 85%",
          once: true,
          onEnter: () => runCounter(c),
        })
      );

      /* ---- Revelação da foto do Sobre ---- */
      const midiaSobre = document.querySelector(".sobre__media");
      if (midiaSobre) {
        const foto = midiaSobre.querySelector(".sobre__foto");
        const imagem = midiaSobre.querySelector("img");
        const moldura = midiaSobre.querySelector(".sobre__moldura");

        gsap
          .timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: { trigger: midiaSobre, start: "top 78%", once: true },
          })
          .fromTo(
            foto,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4 }
          )
          .fromTo(imagem, { yPercent: 16, scale: 1.08 }, { yPercent: 0, scale: 1, duration: 1.6 }, 0)
          .fromTo(
            moldura,
            { x: 34, y: 34, opacity: 0 },
            { x: 20, y: 20, opacity: 1, duration: 1.2 },
            0.35
          );
      }

      /* ---- Estrutura: bento ---- */
      const itensBento = gsap.utils.toArray(".bento__item");
      if (itensBento.length) {
        const entradaBento = gsap.timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: { trigger: ".bento", start: "top 80%", once: true },
        });
        itensBento.forEach((item, i) => {
          const midia = item.querySelector(".bento__media");
          const legenda = item.querySelector(".bento__legenda");
          const conteudo = item.classList.contains("bento__widget") ? item.children : null;
          const t = i * 0.14;
          entradaBento.fromTo(item, { clipPath: "inset(100% 0% 0% 0% round 16px)" }, { clipPath: "inset(0% 0% 0% 0% round 16px)", duration: 1.3 }, t);
          if (midia) entradaBento.fromTo(midia, { scale: 1.3 }, { scale: 1, duration: 1.8 }, t);
          if (legenda) entradaBento.fromTo(legenda, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, t + 0.5);
          if (conteudo) entradaBento.fromTo(conteudo, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }, t + 0.4);
        });

        if (desktop) {
          gsap.utils.toArray(".bento__media").forEach((midia) => {
            gsap.fromTo(
              midia,
              { yPercent: -5 },
              {
                yPercent: 5,
                ease: "none",
                scrollTrigger: { trigger: midia.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6 },
              }
            );
          });
        }
      }

      /* ---- Estrutura: faixa de comodidades ---- */
      const faixa = document.querySelector(".estrutura__faixa");
      if (faixa) {
        gsap.fromTo(
          ".estrutura__faixa-fundo",
          { yPercent: -10 },
          {
            yPercent: 10,
            ease: "none",
            scrollTrigger: { trigger: faixa, start: "top bottom", end: "bottom top", scrub: 0.6 },
          }
        );
        gsap
          .timeline({ scrollTrigger: { trigger: faixa, start: "top 72%", once: true } })
          .fromTo(".estrutura__faixa-titulo", { opacity: 0, y: 26, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 })
          .fromTo(".comodidade", { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.25)
          .fromTo(".comodidade__icone", { scale: 0.4, rotate: -25 }, { scale: 1, rotate: 0, duration: 0.9, stagger: 0.09, ease: "back.out(2)" }, 0.4);
      }

      /* ---- Estrutura: carrossel ---- */
      if (document.querySelector(".carrossel")) {
        gsap
          .timeline({ scrollTrigger: { trigger: ".carrossel", start: "top 80%", once: true } })
          .fromTo(".carrossel__topo > *", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 })
          .fromTo(".carrossel__slide", { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 1.1, stagger: 0.1, ease: "expo.out" }, 0.15)
          .fromTo(".carrossel__progresso", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.6);
      }

      /* ---- Parallax do rodapé ---- */
      const fundoRodape = document.querySelector(".footer__bg");
      if (fundoRodape) {
        gsap.fromTo(
          fundoRodape,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: 0.6 },
          }
        );
      }

      /* ---- Pulso do WhatsApp ao parar a rolagem ---- */
      const botaoWa = document.querySelector(".whatsapp-float");
      if (botaoWa) {
        let timer;
        const pulsar = () => gsap.fromTo(botaoWa, { scale: 1 }, { scale: 1.12, duration: 0.45, yoyo: true, repeat: 1, ease: "power2.inOut" });
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: () => {
            clearTimeout(timer);
            timer = setTimeout(pulsar, 900);
          },
        });
      }

      return () => {
        gsap.set([".hero__bg", ".hero__inner > *", ".reveal", ".hero__watermark"], { clearProps: "all" });
      };
    }
  );

  window.addEventListener("load", () => ScrollTrigger.refresh());
});
