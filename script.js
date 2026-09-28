/* ============================================================
   Recomeço à Vitória — interações
   ============================================================ */

// Número de WhatsApp (formato internacional, somente dígitos: 55 + DDD + número).
// ATENÇÃO: confirme o número completo com o cliente antes de publicar.
const WHATSAPP = "5554999819588";
const MSG_PADRAO = "Olá! Vim pelo site da Recomeço à Vitória e gostaria de mais informações.";

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
  // Seções fora do menu apontam para o item mais próximo do assunto; null desmarca tudo.
  const secaoParaLink = {
    hero: "#topo",
    estrutura: "#estrutura",
    parceiras: "parceiras.html",
    diferenciais: null,
    sobre: null,
    tratamentos: "#tratamentos",
    jornada: "#tratamentos",
    equipe: "#equipe",
    depoimentos: null,
    duvidas: "#duvidas",
    contato: "#contato",
  };
  const secoesMapeadas = Object.keys(secaoParaLink).map((id) => document.getElementById(id)).filter(Boolean);
  if (secoesMapeadas.length && !document.body.classList.contains("pagina-parceiras")) {
    let pendente = false;
    const marcar = () => {
      pendente = false;
      const linha = window.innerHeight * 0.4;
      let atualId = secoesMapeadas[0].id;
      secoesMapeadas.forEach((sec) => {
        if (sec.getBoundingClientRect().top <= linha) atualId = sec.id;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) atualId = "contato";
      const alvo = secaoParaLink[atualId];
      navLinks.forEach((l) => {
        const ativo = l.getAttribute("href") === alvo;
        l.classList.toggle("is-active", ativo);
        if (ativo) l.setAttribute("aria-current", "location");
        else l.removeAttribute("aria-current");
      });
    };
    window.addEventListener("scroll", () => {
      if (!pendente) { pendente = true; requestAnimationFrame(marcar); }
    }, { passive: true });
    window.addEventListener("resize", marcar);
    marcar();
  }

  /* ---- Fundo vivo da estrutura: pólen flutuando na luz ---- */
  const canvasNatureza = document.querySelector(".natureza__canvas");
  if (canvasNatureza) {
    const ctx = canvasNatureza.getContext("2d");
    const cores = ["212, 175, 98", "73, 150, 91", "245, 214, 140"];
    let particulas = [];
    let largura = 0;
    let altura = 0;
    let rodando = false;

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = canvasNatureza.clientWidth;
      altura = canvasNatureza.clientHeight;
      canvasNatureza.width = largura * dpr;
      canvasNatureza.height = altura * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const quantidade = Math.round(Math.min(70, (largura * altura) / 26000));
      particulas = Array.from({ length: quantidade }, () => ({
        x: Math.random() * largura,
        y: Math.random() * altura,
        r: 1 + Math.random() * 2.6,
        vy: -(0.12 + Math.random() * 0.3),
        fase: Math.random() * Math.PI * 2,
        amplitude: 0.2 + Math.random() * 0.5,
        cor: cores[Math.floor(Math.random() * cores.length)],
        alfa: 0.25 + Math.random() * 0.5,
      }));
    };

    const desenhar = (t) => {
      ctx.clearRect(0, 0, largura, altura);
      particulas.forEach((p) => {
        const brilho = p.alfa * (0.6 + 0.4 * Math.sin(t / 900 + p.fase));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(${p.cor}, ${brilho})`);
        g.addColorStop(1, `rgba(${p.cor}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const quadro = (t) => {
      if (!rodando) return;
      particulas.forEach((p) => {
        p.y += p.vy;
        p.x += Math.sin(t / 2400 + p.fase) * p.amplitude;
        if (p.y < -20) { p.y = altura + 20; p.x = Math.random() * largura; }
      });
      desenhar(t);
      requestAnimationFrame(quadro);
    };

    medir();
    window.addEventListener("resize", medir);
    if (reduceMotion || !("IntersectionObserver" in window)) {
      desenhar(0);
    } else {
      new IntersectionObserver(([entry]) => {
        const antes = rodando;
        rodando = entry.isIntersecting;
        if (rodando && !antes) requestAnimationFrame(quadro);
      }).observe(canvasNatureza);
    }
  }

  /* ---- Vitrine da estrutura ---- */
  const vitrine = document.querySelector("[data-vitrine]");
  if (vitrine) {
    const fotos = [...vitrine.querySelectorAll(".vitrine__foto")];
    const minis = [...vitrine.querySelectorAll(".vitrine__mini")];
    const ambiente = vitrine.querySelector(".vitrine__ambiente");
    const contador = vitrine.querySelector(".vitrine__contador strong");
    const titulo = vitrine.querySelector(".vitrine__titulo");
    const texto = vitrine.querySelector(".vitrine__texto");
    const barra = vitrine.querySelector(".vitrine__progresso span");
    const trilhoMinis = vitrine.querySelector(".vitrine__miniaturas");
    const DURACAO = 6500;
    let atual = 0;
    let inicio = 0;
    let pausado = false;
    let visivel = false;

    const trocarTexto = () => {
      const mini = minis[atual];
      contador.textContent = String(atual + 1).padStart(2, "0");
      titulo.textContent = mini.dataset.titulo;
      texto.textContent = mini.dataset.texto;
    };

    const ir = (indice) => {
      const novo = (indice + fotos.length) % fotos.length;
      if (novo === atual) return;
      fotos[atual].classList.remove("is-ativa");
      minis[atual].classList.remove("is-ativa");
      minis[atual].removeAttribute("aria-current");
      atual = novo;
      fotos[atual].classList.add("is-ativa");
      minis[atual].classList.add("is-ativa");
      minis[atual].setAttribute("aria-current", "true");

      const mini = minis[atual];
      if (trilhoMinis.scrollWidth > trilhoMinis.clientWidth) {
        trilhoMinis.scrollTo({ left: mini.parentElement.offsetLeft - 20, behavior: "smooth" });
      }

      if (temGsap && !reduceMotion) {
        gsap.timeline()
          .to(ambiente, { opacity: 0, y: -12, duration: 0.25, ease: "power2.in", onComplete: trocarTexto })
          .fromTo(ambiente, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" });
      } else {
        trocarTexto();
      }
      inicio = performance.now();
    };

    minis.forEach((mini, i) => mini.addEventListener("click", () => ir(i)));
    vitrine.querySelector('[data-vitrine-acao="anterior"]').addEventListener("click", () => ir(atual - 1));
    vitrine.querySelector('[data-vitrine-acao="proximo"]').addEventListener("click", () => ir(atual + 1));
    vitrine.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") ir(atual + 1);
      if (e.key === "ArrowLeft") ir(atual - 1);
    });

    if (!reduceMotion) {
      vitrine.addEventListener("pointerenter", () => (pausado = true));
      vitrine.addEventListener("pointerleave", () => { pausado = false; inicio = performance.now() - parseFloat(barra.dataset.p || 0) * DURACAO; });
      vitrine.addEventListener("focusin", () => (pausado = true));
      vitrine.addEventListener("focusout", () => (pausado = false));

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
          visivel = entry.isIntersecting;
          if (visivel) inicio = performance.now() - parseFloat(barra.dataset.p || 0) * DURACAO;
        }, { threshold: 0.35 }).observe(vitrine);
      }

      const tique = (agora) => {
        if (visivel && !pausado) {
          const p = Math.min((agora - inicio) / DURACAO, 1);
          barra.dataset.p = p;
          barra.style.transform = `scaleX(${p})`;
          if (p >= 1) ir(atual + 1);
        }
        requestAnimationFrame(tique);
      };
      requestAnimationFrame(tique);
    } else {
      barra.parentElement.hidden = true;
    }
  }

  /* ---- Galeria das clínicas parceiras ---- */
  const galeria = document.querySelector("[data-galeria]");
  if (galeria) {
    const fotos = [...galeria.querySelectorAll("button.galeria__foto")];
    const lightbox = galeria.querySelector(".lightbox");
    const imgGrande = lightbox.querySelector("img");
    const legenda = lightbox.querySelector(".lightbox__legenda");
    const contador = lightbox.querySelector(".lightbox__contador");
    let atual = 0;

    const mostrar = (indice) => {
      atual = (indice + fotos.length) % fotos.length;
      const img = fotos[atual].querySelector("img");
      imgGrande.src = img.src;
      imgGrande.alt = img.alt;
      legenda.textContent = fotos[atual].querySelector("span").textContent;
      contador.textContent = `${atual + 1} / ${fotos.length}`;
      if (temGsap && !reduceMotion) gsap.fromTo(imgGrande, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" });
    };

    fotos.forEach((foto, i) =>
      foto.addEventListener("click", () => {
        mostrar(i);
        lightbox.showModal();
      })
    );
    lightbox.addEventListener("click", (e) => {
      const acao = e.target.closest("[data-lightbox]")?.dataset.lightbox;
      if (acao === "fechar" || e.target === lightbox) lightbox.close();
      if (acao === "anterior") mostrar(atual - 1);
      if (acao === "proximo") mostrar(atual + 1);
    });
    lightbox.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") mostrar(atual + 1);
      if (e.key === "ArrowLeft") mostrar(atual - 1);
    });

    const linksCapitulo = [...document.querySelectorAll(".capitulos__link")];
    if ("IntersectionObserver" in window && linksCapitulo.length) {
      const espiao = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            linksCapitulo.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id));
          }),
        { rootMargin: "-40% 0px -55% 0px" }
      );
      galeria.querySelectorAll(".capitulo").forEach((c) => espiao.observe(c));
    }
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

      const temHero = !!document.querySelector(".hero");

      if (temHero) {
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
      }

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

      /* ---- Estrutura: vitrine ---- */
      if (vitrine) {
        gsap
          .timeline({ defaults: { ease: "expo.out" }, scrollTrigger: { trigger: vitrine, start: "top 78%", once: true } })
          .fromTo(vitrine, { clipPath: "inset(10% 5% 0% 5% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: 1.5 })
          .fromTo(".vitrine__palco", { scale: 1.12 }, { scale: 1, duration: 2 }, 0)
          .fromTo(".vitrine__info > *", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out" }, 0.35)
          .fromTo(".vitrine__miniaturas li", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: "power3.out" }, 0.6);
      }

      /* ---- Jornada do tratamento ---- */
      const jornada = document.querySelector(".jornada");
      if (jornada) {
        const passos = gsap.utils.toArray(".jornada__passo");
        const cartoes = gsap.utils.toArray(".jornada__cartao");
        const anel = jornada.querySelector(".jornada__anel-progresso");
        const circunferencia = 2 * Math.PI * 92;

        if (desktop && window.innerWidth > 860) {
          let ativo = 0;
          ScrollTrigger.create({
            trigger: jornada,
            start: "top top+=" + (document.querySelector(".header").offsetHeight || 0),
            end: "+=" + cartoes.length * 70 + "%",
            pin: true,
            scrub: true,
            onUpdate: (self) => {
              anel.style.strokeDashoffset = circunferencia * (1 - self.progress);
              const indice = Math.min(cartoes.length - 1, Math.floor(self.progress * cartoes.length));
              if (indice === ativo) return;
              ativo = indice;
              cartoes.forEach((c, i) => c.classList.toggle("is-ativo", i === indice));
              passos.forEach((p, i) => {
                p.classList.toggle("is-ativo", i === indice);
                p.classList.toggle("is-feito", i < indice);
              });
            },
          });
        } else {
          gsap.fromTo(
            cartoes,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, scrollTrigger: { trigger: ".jornada__palco", start: "top 85%", once: true } }
          );
        }
      }

      /* ---- Botões magnéticos ---- */
      if (desktop && window.matchMedia("(pointer: fine)").matches) {
        document.querySelectorAll(".btn").forEach((botao) => {
          const x = gsap.quickTo(botao, "x", { duration: 0.5, ease: "power3.out" });
          const y = gsap.quickTo(botao, "y", { duration: 0.5, ease: "power3.out" });
          botao.addEventListener("pointermove", (e) => {
            const r = botao.getBoundingClientRect();
            x((e.clientX - (r.left + r.width / 2)) * 0.22);
            y((e.clientY - (r.top + r.height / 2)) * 0.35);
          });
          botao.addEventListener("pointerleave", () => {
            gsap.to(botao, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)", overwrite: true });
          });
        });
      }

      /* ---- Clínicas parceiras ---- */
      const parceira = document.querySelector(".parceira");
      if (parceira) {
        const info = parceira.querySelectorAll(".parceira__info > *");
        gsap
          .timeline({ defaults: { ease: "expo.out" }, scrollTrigger: { trigger: parceira, start: "top 78%", once: true } })
          .fromTo(parceira, { clipPath: "inset(12% 6% 0% 6% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 24px)", duration: 1.5 })
          .fromTo(".parceira__capa img", { scale: 1.25 }, { scale: 1, duration: 2 }, 0)
          .fromTo(".parceira__local", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9 }, 0.7)
          .fromTo(info, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out" }, 0.35)
          .fromTo(".parceira__avatar", { scale: 0.4, rotate: -30 }, { scale: 1, rotate: 0, duration: 0.9, ease: "back.out(2)" }, 0.9);

        if (desktop) {
          gsap.fromTo(
            ".parceira__capa img",
            { yPercent: -4 },
            { yPercent: 4, ease: "none", scrollTrigger: { trigger: ".parceira__destaque", start: "top bottom", end: "bottom top", scrub: 0.6 } }
          );
        }
      }

      const posts = document.querySelector(".parceira-posts");
      if (posts) {
        gsap
          .timeline({ defaults: { ease: "expo.out" }, scrollTrigger: { trigger: posts, start: "top 82%", once: true } })
          .fromTo(".parceira-post", { clipPath: "inset(100% 0% 0% 0% round 20px)" }, { clipPath: "inset(0% 0% 0% 0% round 20px)", duration: 1.3, stagger: 0.16 })
          .fromTo(".parceira-post img", { scale: 1.25 }, { scale: 1, duration: 1.8, stagger: 0.16, clearProps: "transform" }, 0)
          .fromTo(".parceira-convite > *", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" }, 0.25);
      }

      /* ---- Página de parceiras ---- */
      if (document.querySelector(".pagina-topo")) {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .fromTo(".pagina-topo__fundo", { scale: 1.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 2 })
          .fromTo(".pagina-topo__inner > *", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, 0.2);
        gsap.to(".pagina-topo__fundo", { yPercent: 12, ease: "none", scrollTrigger: { trigger: ".pagina-topo", start: "top top", end: "bottom top", scrub: 0.6 } });
      }

      gsap.utils.toArray(".capitulo").forEach((capitulo) => {
        const itens = capitulo.querySelectorAll(".galeria__item");
        gsap
          .timeline({ defaults: { ease: "expo.out" }, scrollTrigger: { trigger: capitulo, start: "top 78%", once: true } })
          .fromTo(capitulo.querySelectorAll(".capitulo__intro > *"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08 })
          .fromTo(itens, { clipPath: "inset(100% 0% 0% 0% round 16px)" }, { clipPath: "inset(0% 0% 0% 0% round 16px)", duration: 1.2, stagger: 0.07 }, 0.1)
          .fromTo(capitulo.querySelectorAll(".galeria__foto img"), { scale: 1.3 }, { scale: 1, duration: 1.6, stagger: 0.07, clearProps: "transform" }, 0.1);
      });

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
