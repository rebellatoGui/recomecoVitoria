---
name: site-conventions
description: Design tokens and section patterns for the recomecoVitoria static site (colors, radius scale, badge/card/grid usage, WhatsApp CTA rules)
user-invocable: false
---

# recomecoVitoria — Site Conventions

Single-page static site (`index.html` + `style.css` + `script.js`, no build step). Read this before editing markup or styles so new work matches what already exists instead of drifting.

## Design tokens (`style.css:5-28`)

All colors, radii and shadows are CSS custom properties on `:root` — never hardcode a hex value or px radius, reuse the variable.

- Color scale: `--verde-escuro` (darkest, header/CTA backgrounds), `--verde-medio` (primary accent, buttons/icons), `--verde-claro`, `--verde-texto` (body copy), `--verde-preto`, `--creme`, `--off-white` (page background), `--verde-palido` (light icon-chip backgrounds), `--branco`, `--vermelho` (reserved, currently unused — don't introduce a second accent color), `--borda` (hairlines/borders).
- Fonts: `--font-serif` (Spectral, used for large display numbers/headings like `.cta__title`, `.stat__num`), `--font-sans` (Manrope, default body/UI), `--font-display` (Special Gothic Expanded One, rare/decorative — check usage before reaching for it).
- Radius: `--radius` (16px, standard for cards/images/gallery), `--radius-sm` (12px, buttons). The one exception is `.form` at 20px (pre-existing, not part of the scale — don't propagate 20px elsewhere).
- Shadows: `--shadow` / `--shadow-sm`, both tinted green (not pure black) — keep any new shadow tinted the same way.

**One accent color rule**: `--verde-medio` is the only accent used for CTAs/icons/links across the whole page. Don't introduce a second accent (e.g. don't use `--vermelho` for anything user-facing without an explicit reason — it's unused today).

## Section pattern

Every content section follows this shape (see `#diferenciais`, `#tratamentos`, `#equipe`, `#estrutura`, `#depoimentos` in `index.html`):

```html
<section class="section <name>" id="<anchor>">
  <div class="container">
    <div class="section__head reveal">
      <span class="badge">Eyebrow curto</span>
      <h2 class="section__title">Título da seção</h2>
      <p class="section__subtitle">Uma frase de apoio.</p>
    </div>
    <div class="grid grid--3"> <!-- or grid--4, grid--2 -->
      <article class="card card--feature reveal"> ... </article>
    </div>
  </div>
</section>
```

- `.reveal` on every direct child that should fade/slide in on scroll — `script.js` computes stagger index automatically from `.parentElement.children`, no manual delay needed.
- Nav anchors (`#topo`, `#sobre`, `#tratamentos`, `#equipe`, `#estrutura`, `#contato`) are referenced from both the header nav and the footer nav — if you rename a section `id`, update both.
- Icons are inline SVG using the shared `.icon` class (stroke-based, `currentColor`, 18px) — see `.card__icon`. Don't add an icon library or new SVG style; match the existing hand-drawn stroke icons already in the file.

## WhatsApp CTA convention

Every WhatsApp entry point uses `data-whatsapp` + a real `href="#"` (or `tel:`), never a raw `https://wa.me/...` link in markup — `script.js` intercepts the click and builds the deep link centrally (see `abrirWhatsApp()`). If you add a new WhatsApp button, copy this pattern rather than hardcoding the URL again.

## Contact/CTA section (`#contato`)

As of the latest redesign: no lead-capture form. The right-side card (`.form`) is a WhatsApp-first panel (icon → title → subtitle → one primary button → a short supporting-facts list), and the left side (`.cta__content`) carries the phone quick-dial. Keep these two **non-duplicate in intent** — left = call, right = chat. Don't re-add a phone button to the right card or a WhatsApp link to the left column.

## Footer

Three columns only (`--footer__inner` grid: brand / nav / contacts). The old fourth "Selo de Qualidade" column (ANVISA/CRM badges) was removed — don't re-add trust badges/seals without the user asking; it read as generic AI-slop trust theater on a page that already carries real CRM/COREN numbers in the Equipe section.

## What NOT to add without being asked

- A second accent color, a new icon library, a new font.
- Trust badges/seals/certification stamps in the footer.
- A contact form (explicitly removed as a UX decision, not an oversight).
