---
name: add-section
description: Scaffold a new content section for the recomecoVitoria landing page, matching the existing section/badge/card/grid pattern
disable-model-invocation: true
---

# Add a new section to recomecoVitoria

User-invoked only (`/add-section`). Ask the user for: section name/id, eyebrow badge text, title, subtitle, number of items and whether they're cards (feature/treatment style) or a plain grid (photos/gallery style) — then scaffold using the pattern below. Read the `site-conventions` skill first for the token/pattern reference.

## Steps

1. Pick an `id` (lowercase, no accents, matches how it'll be linked from nav if needed).
2. Insert the new `<section>` in `index.html` in the right place in `<main>` — ask the user where it should sit relative to existing sections if not obvious.
3. Use this skeleton, substituting real copy (never lorem ipsum — ask the user for real content if they haven't given it):

```html
<!-- ===================== <SECTION NAME UPPERCASE> ===================== -->
<section class="section <slug>" id="<slug>">
  <div class="container">
    <div class="section__head reveal">
      <span class="badge">Eyebrow curto</span>
      <h2 class="section__title">Título da seção</h2>
      <p class="section__subtitle">Uma frase de apoio, sem enrolação.</p>
    </div>
    <div class="grid grid--3">
      <article class="card card--feature reveal">
        <span class="card__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><!-- stroke icon --></svg></span>
        <h3 class="card__title">Título do item</h3>
        <p class="card__text">Descrição curta e concreta.</p>
      </article>
      <!-- repeat one <article> per item -->
    </div>
  </div>
</section>
```

4. If the section needs its own layout (not a card grid — e.g. a gallery or a two-column split), model it on the closest existing section (`#estrutura` for a photo gallery, `#sobre` for a two-column text+image split, `#depoimentos` for a 2-up quote grid) rather than inventing new CSS class names.
5. Add matching CSS under a clearly commented block in `style.css` (`/* ===== SECTION NAME ===== */`), reusing the existing custom properties — no new colors, no new radius values.
6. If the section should be reachable from navigation, add the anchor link to **both** the header `<nav id="nav">` and the footer `<nav class="footer__col">` — they must stay in sync.
7. Every direct child of `.container`/`.grid` that should animate in gets the `reveal` class — no manual stagger delay needed, `script.js` handles it.
8. Icons: hand-draw a simple stroke SVG matching the existing `.icon` style (stroke `currentColor`, no fill, rounded caps) — don't pull in an icon library for one new glyph.

## After scaffolding

Remind the user to check the section in the browser (localhost) at both desktop and mobile width before considering it done — this project has no build/test step, so the browser is the only verification.
