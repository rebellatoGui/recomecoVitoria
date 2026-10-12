const CLINICAS_PARCEIRAS = [
  {
    slug: "villa-grano",
    nome: "Villa Grano",
    nomeDestaque: "Libertà",
    nomeCurto: "Villa Grano",
    selo: "Centro Terapêutico",
    frase: "Acreditamos que cuidar vai além do diagnóstico.",
    texto: "Um acompanhamento construído através da escuta, do acolhimento e de uma abordagem individualizada para cada história, em uma casa cercada de jardins no interior gaúcho.",
    local: "Gentil · RS",
    endereco: "Rua Dionísio Batistella, 60 — Gentil, RS",
    mapa: "https://www.google.com/maps/search/?api=1&query=Rua+Dion%C3%ADsio+Batistella+60+Gentil+RS",
    capa: {
      src: "assets/parceiras/villa-grano/entrada-logo.webp",
      alt: "Placa iluminada da Villa Grano Libertà na fachada da clínica, ao entardecer",
      largura: 936,
      altura: 1400,
    },
  },
];

(() => {
  const ICONE_LOCAL =
    '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  const ICONE_SETA =
    '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg>';

  const escapar = (texto) =>
    String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const montarCard = (clinica, variante) => {
    const resumo = variante === "resumo";
    const idNome = `${clinica.slug}-nome`;
    const extra = resumo
      ? `<div class="parceira__acoes">
          <a class="btn parceira__conhecer" href="parceiras.html#${clinica.slug}">Conhecer a ${escapar(clinica.nomeCurto)} ${ICONE_SETA}</a>
        </div>`
      : `<ul class="parceira__dados">
          <li>${ICONE_LOCAL}<a href="${escapar(clinica.mapa)}" target="_blank" rel="noopener">${escapar(clinica.endereco)}</a></li>
        </ul>`;

    return `<article class="parceira${resumo ? " parceira--resumo" : ""}" id="${resumo ? "" : clinica.slug}" aria-labelledby="${idNome}">
      <div class="parceira__destaque">
        <figure class="parceira__capa">
          <img src="${escapar(clinica.capa.src)}" alt="${escapar(clinica.capa.alt)}" loading="lazy" width="${clinica.capa.largura}" height="${clinica.capa.altura}" />
          <figcaption class="parceira__local">${ICONE_LOCAL} ${escapar(clinica.local)}</figcaption>
        </figure>
        <div class="parceira__info">
          <span class="parceira__selo">${escapar(clinica.selo)}</span>
          <${resumo ? "h3" : "h2"} class="parceira__nome" id="${idNome}">${escapar(clinica.nome)} <em>${escapar(clinica.nomeDestaque)}</em></${resumo ? "h3" : "h2"}>
          <blockquote class="parceira__frase">“${escapar(clinica.frase)}”</blockquote>
          <p class="parceira__texto">${escapar(clinica.texto)}</p>
          ${extra}
        </div>
      </div>
    </article>`.replace(' id=""', "");
  };

  document.querySelectorAll("[data-parceiras]").forEach((alvo) => {
    alvo.outerHTML = CLINICAS_PARCEIRAS.map((clinica) => montarCard(clinica, alvo.dataset.parceiras)).join("");
  });
})();
