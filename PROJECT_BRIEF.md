# PrintGrid Studio — Project Brief

**Master spec.** Both Claude Design and Claude Code work from this document.
When something changes, edit this file first; everything else follows.

> Status: v0 · started 2026-05-01 · author: Aadharsh

---

## 1 · What PrintGrid Studio is

A small FDM 3D printing studio in Chennai (Hyderabad pickup from late June 2026)
that ships pan-India in four days. Customers upload an STL, see a real price
computed from the actual mesh in under a minute, pay over Razorpay, and track
their order to the door.

**Not a marketplace. Not a SaaS. Not a maker community.** Just a service that
takes a file and ships a printed part.

---

## 2 · Audience

In rough order of importance:

1. **Engineers and hardware builders** (UAV, robotics, IoT, electronics) needing
   functional prototypes and replacement parts.
2. **Product designers and small product companies** doing form-study or pre-
   production parts in low volume (1–50 units).
3. **Hobbyists** with a CAD model and no printer.
4. **Tabletop / cosplay / collectors** for visual-quality FDM parts. (Resin
   crowd is *not* in scope — we're FDM only.)

What they share: they already know what they want. The site's job is to give
them a fast, honest path from file → printed part. Nothing else.

---

## 3 · References (vibe + workflow)

- **[onlyscrews.in](https://onlyscrews.in/)** — focused Indian D2C. Single
  product category. Plain copy. "Anywhere in India in 2 days." Personality
  through specificity, not styling.
- **[jlc3dp.com](https://jlc3dp.com)** — the gold-standard instant-quote
  workflow. Upload → spec → price in 60 seconds → ship in days. Industrial
  manufacturing aesthetic.

We want **OnlyScrews's directness + JLC3DP's instant-quote flow, FDM-only**.

---

## 4 · The one user journey that matters

> A returning engineer with an STL. They land on the homepage, click "Get a
> quote", drop the file, pick PETG and 0.20 mm layer height, see ₹740, click
> Pay, finish UPI in 30 seconds, get a tracking page link. That's it. Total
> time from landing to paid: under 3 minutes.

If a design or code decision makes that journey slower or more confusing, it's
the wrong decision.

---

## 5 · Pages we need (minimum viable)

| Page | Purpose | URL |
|---|---|---|
| Homepage | Convince a first-time visitor in 30 seconds. CTA → quote. | `/` |
| Quote | Upload STL, set parameters, see live price, pay. | `/quote` |
| Materials | The 6 FDM materials with specs and rates. | `/materials` |
| Track | Customer-facing order status by code. | `/orders/<CODE>` |
| About | One-page studio + founder bio. | `/about` |
| Contact | WhatsApp, email, hours. | `/contact` |
| Footer-only | Privacy, Terms, Refund, Shipping. | `/privacy` etc. |

**Not in v1:** portfolio, blog, gallery, account dashboard, customer login.
Add later if the funnel needs them. Don't add to "look complete".

---

## 6 · The studio (real specs to hard-code)

| Spec | Value |
|---|---|
| Brand name | **PrintGrid Studio** |
| Tagline | FDM 3D printing. Quoted live. Printed locally. |
| Location | Chennai (primary) · Hyderabad (pickup from end of June 2026) |
| Shipping | Pan-India. BlueDart / Delhivery. Flat ₹120, free over ₹2,500. |
| Lead time | 3–5 days from payment + 1–5 days transit |
| Build volume | 300 × 300 × 300 mm |
| Layer heights | 0.12 – 0.28 mm |
| Tolerance | ± 0.15 mm typical |
| Min order | ₹199 |
| GST | 18 % shown separately |
| Founder | Aadharsh — UAV engineer, runs studio on the side |
| Email | aadharsh.j10@gmail.com *(personal — set up `hello@printgrid.co.in` once domain DNS is configured)* |
| WhatsApp | +91 75400 23670 *(wa.me link: `https://wa.me/917540023670`)* |
| Domain | **printgrid.co.in** *(owned)* |

### Materials (FDM only — no resin anywhere on the site)

| Material | Rate | Density | Tensile | Max temp | Use |
|---|---|---|---|---|---|
| PLA | ₹3.50/g | 1.24 g/cm³ | 50 MPa | 55 °C | Visual prototypes |
| PLA+ | ₹4.50/g | 1.24 g/cm³ | 65 MPa | 60 °C | Drone parts, brackets |
| PETG | ₹5.00/g | 1.27 g/cm³ | 50 MPa | 75 °C | Outdoor, enclosures |
| ABS | ₹5.50/g | 1.04 g/cm³ | 40 MPa | 95 °C | Jigs, machinable parts |
| TPU 95A | ₹8.50/g | 1.21 g/cm³ | 30 MPa | 80 °C | Flex parts, gaskets |
| PA-CF | ₹22/g | 1.16 g/cm³ | 90 MPa | 130 °C | Engineering parts |

### Pricing model (mandatory — this is the studio's promise)

```
unit_price = (material + machine + setup + finish) × 1.25 margin
material   = effective_volume × density × ₹/g     (effective vol = shell + infill fraction)
machine    = print_time_hours × ₹45/hr
setup      = ₹100 / unique file
finish     = 0 (as-printed) → ₹280 (gloss paint)
quantity discount = 5% @ qty10, 10% @ qty20, 15% @ qty50
order min = ₹199
```

Quote engine MUST compute these from the actual STL mesh — no hardcoded prices,
no email-back-with-quote.

---

## 7 · Visual direction

**Adjectives:** editorial, industrial, technical, restrained, Indian, honest,
no-bullshit. **Not** corporate, not cute, not playful, not gradient-y, not SaaS.

### Typography
- Display + body: **Inter** (variable, weights 400–700)
- Numbers + technical labels: **JetBrains Mono**
- Display: tight tracking (`-0.025em`), weight 600
- Labels: `text-transform: uppercase; letter-spacing: 0.18em`
- Sentence case for body. Title case is forbidden in headlines.

### Color
| Token | Value | Use |
|---|---|---|
| `--ink` | `#0A0A0A` | Body text, primary borders |
| `--paper` | `#FAFAF7` | Background |
| `--paper-warm` | `#F2EFE8` | Alternating sections |
| `--accent` | `#D14620` | CTAs, hot signal, single accent only |
| `--accent-deep` | `#A12F12` | CTA hover |

One ink + one accent. **Two colors total**, plus the warm paper tone. No more.

### Geometry
- Borders: 1 px hairlines, color `--ink-10`
- Radii: 0–4 px max. **Never** rounded-full or rounded-2xl.
- Square-ish CTAs and inputs.
- Section dividers: hairlines, not shadows.
- Grid-paper background motif (32 px) on hero / quote sections.

### Lighting / shadow
- **None.** No drop shadows, no glow, no glassmorphism.
- Hover states change borders or invert fg/bg. Never blur.

### Anti-references — REJECT if Claude Design produces these

- Gradient hero with floating 3D shapes
- Pastel rounded-corner cards
- Stock photos of "diverse team smiling at laptop"
- Sparkles, neon, glow, glassmorphism
- Emoji headlines like "🚀 Print better!"
- Copy like "Empower your creativity with cutting-edge additive manufacturing"
- AI-generated 3D printer images (always look fake / waxy / wrong proportions)
- "Get Started Today" button on a hero
- Big quote marks around testimonials
- Soft drop shadows under cards

If a comp comes back with any of these, push back specifically — name the
anti-pattern, re-prompt with the constraint it violated.

---

## 8 · Tech stack (non-negotiable for v1)

- **Plain HTML + CSS + vanilla JS.** No framework, no build step.
- Hostable on **Hostinger** shared hosting via FTP.
- File structure flat: `/public/index.html`, `/public/quote.html`,
  `/public/styles.css`, `/public/app.js`.
- STL parser runs in the browser (binary + ASCII, signed-tetrahedron volume).
- Quote engine pure JS — same code that previews live runs server-side at
  order time (re-priced authoritatively).
- Razorpay checkout via their hosted modal (no SDK build complexity).
- Backend for orders + payment verification: **Node + Express** on a single
  VPS (or Hostinger Cloud with Node), or **Cloudflare Workers** if simpler.
  Decide when we get there. Don't pre-optimize.
- Database: **Postgres** (Neon free tier) when we need it. Until then, JSON
  files are fine for materials catalog.
- Email: **Resend** for transactional. WhatsApp later via Gupshup or AiSensy.

**Why no React / Next:** for a 6-page site with one interactive screen
(quote engine) the framework tax isn't worth it. Plain JS keeps Claude Code
edits simple and Hostinger deploys instant.

---

## 9 · How we work (handoff workflow)

```
              ┌──────────────────────────────┐
              │   PROJECT_BRIEF.md (this)    │
              │   ← single source of truth   │
              └───────┬──────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
 ┌─────────────────┐         ┌──────────────────┐
 │  Claude Design  │         │   Claude Code    │
 │                 │         │                  │
 │ Visual mockups  │         │ HTML/CSS/JS      │
 │ Hero comps      │         │ Quote engine     │
 │ SVG diagrams    │         │ STL parser       │
 │ Photo direction │         │ Razorpay wiring  │
 └─────────────────┘         └──────────────────┘
        │                           ▲
        ▼                           │
   Mockups → I review → comps go to Claude Code as ref images
```

**Aadharsh's role:** drives both, decides between options, owns the brief.

**My role (this Claude / planning Claude):** keeps the brief honest, writes
new prompts when scope changes, reviews comps and code against the brief,
adjudicates when Design and Code disagree.

---

## 10 · Kickoff prompts

### 10A · For Claude Design — first task

```
You are designing the homepage hero for PrintGrid Studio, an FDM 3D printing
service in Chennai. Read the attached PROJECT_BRIEF.md in full before
designing — especially Section 7 (visual direction) and the anti-references
list.

Deliverable: 3 hero mockup variations (desktop 1440 × 900). Show me a still
PNG of each, no animations yet.

Each variation must include:
- The PrintGrid wordmark + "studio · 3d printing" subtitle
- A primary headline (≤ 12 words) that includes "FDM" and "Chennai" or "India"
- A subhead (≤ 30 words) explaining the live-quote promise
- A primary CTA → "Upload STL · See live price" or equivalent
- A spec strip: build volume, layer heights, tolerance, lead time
- One technical / industrial visual element on the right side (real CAD-style
  line drawing of an extruder, NOT a photorealistic 3D render)

Hard constraints:
- Two colors only: near-black ink #0A0A0A + molten accent #D14620
- Background: warm cream #FAFAF7
- Typography: Inter (display + body) + JetBrains Mono (technical labels)
- Square corners (max 4 px radius). Hairline borders only.
- No drop shadows. No gradients. No glow. No 3D-rendered printer images.
- No emoji. Sentence case for everything except UPPERCASE technical labels.

Reference vibes (in order of importance):
1. onlyscrews.in — focused Indian D2C, plain copy
2. jlc3dp.com — industrial manufacturing aesthetic
3. Vintage HP / Tektronix instrument manuals — title blocks, dimension callouts
4. Bambu Lab product pages — clinical, technical confidence
5. Dieter Rams 10 principles — function first

Return: 3 PNGs + a 1-paragraph rationale per variation explaining what's
different about each (typography weight, layout asymmetry, headline tone, etc).
```

### 10B · For Claude Code — first task

```
You are scaffolding PrintGrid Studio, a static website hosted on Hostinger.
Read the attached PROJECT_BRIEF.md before writing code — especially
Section 8 (tech stack) and Section 5 (pages).

Build the project skeleton — not the full content yet.

Folder structure:
public/
├── index.html          ← homepage (placeholder, just hero scaffold)
├── quote.html          ← quote page (empty for now, just heading + nav)
├── materials.html      ← (empty, just heading)
├── about.html          ← (empty, just heading)
├── contact.html        ← (empty, just heading)
├── styles.css          ← shared design tokens + base layout
└── js/
    └── (empty for now — scripts come in next pass)

styles.css must define the design tokens from Section 7 of the brief:
- :root with --ink, --paper, --paper-warm, --accent, --accent-deep
- Inter + JetBrains Mono via Google Fonts
- A .wrap container (max-width 1200px, padded 24/32 px)
- Base reset, body font, link colors
- Typography classes: .display, .display-2, .eyebrow, .lede, .label
- A .grid12 12-column grid helper
- Hairline borders, no shadows, square corners

index.html must have:
- The status strip (Chennai · Hyderabad late June 2026 · ships pan-India 4 days)
- A header with the PrintGrid wordmark + nav (Materials, How it works,
  Pricing, Contact, Get a quote button)
- A hero with placeholder headline + CTA → quote.html
- A footer with © + privacy/terms/refund links

NO content for the rest of the page yet. We build section by section, get
sign-off, move on. Don't get clever. Don't add JS yet. Don't add a quote
engine yet.

Stack: plain HTML5 + CSS3, no frameworks, no build step. The output should
open by double-clicking index.html in a browser.

When done, list every file you created with line counts, and confirm what's
NOT done so we know what's next.
```

### 10C · After both come back

I'll review:
- Did Claude Design actually follow the anti-reference list? Did it produce
  real CAD-style line work or did it slip in a 3D render?
- Did Claude Code wire up the design tokens correctly? Does the hero layout
  match the chosen Design comp?
- Where do Design and Code disagree? (Almost always in spacing, type sizes,
  and the diagram.) I'll adjudicate.

Then we extend section by section: hero copy → process strip → materials →
pricing → shipping → contact → footer. Each section gets a sign-off before
the next one starts.

Once the homepage is locked, the same loop applies for `/quote` (where the
real interactive work lives — STL parsing, live pricing, Razorpay).

---

## 11 · Open questions

- [x] **Domain confirmed: `printgrid.co.in`** (owned)
- [x] **WhatsApp: +91 75400 23670**
- [x] **Email: `aadharsh.j10@gmail.com`** *(set up `hello@printgrid.co.in` later)*
- [ ] First sample STL to test the quote engine end-to-end *(placeholder OK for now)*
- [ ] Razorpay account — needs setup or already created? *(placeholder OK)*
- [ ] Hostinger DNS — where is `printgrid.co.in` pointing right now? *(placeholder OK; we'll point it at the deploy target later)*
- [ ] Studio photo when ready *(hold off until Hyderabad opens — fine to launch v1 without)*

Answer the unchecked items when you have them; update this file. None of them
block the design/scaffold work.

---

*This brief is a living document. When something changes — pricing, scope,
audience, location — update this file FIRST, then notify Design and Code.*
