# Documentation

Two documents. The PRD covers the **site**; the brief covers the **person**.

| File | Purpose |
|---|---|
| `PORTFOLIO_PRD.pdf` | Product requirements — architecture, decisions, outstanding work. Read this first. |
| `ABOUT_JAHID.pdf` | Personal and professional brief — background, journey, skills, honest assessment. |
| `PORTFOLIO_PRD.html` | Source for the PRD. Edit this, then re-render. |
| `ABOUT_JAHID.html` | Source for the brief. Edit this, then re-render. |
| `render-prd.mjs` | Regenerates either PDF from its HTML. |

## Regenerating the PDFs

Requires Playwright's Chromium.

```bash
npm install --no-save playwright

SRC=docs/PORTFOLIO_PRD.html OUT=docs/PORTFOLIO_PRD.pdf \
  LABEL="Portfolio PRD — Md. Jahid Hasan Raihan" node docs/render-prd.mjs

SRC=docs/ABOUT_JAHID.html OUT=docs/ABOUT_JAHID.pdf \
  LABEL="Md. Jahid Hasan Raihan — Personal & Professional Brief" node docs/render-prd.mjs
```

On Windows PowerShell:

```powershell
$env:SRC="docs\PORTFOLIO_PRD.html"; $env:OUT="docs\PORTFOLIO_PRD.pdf"
$env:LABEL="Portfolio PRD — Md. Jahid Hasan Raihan"; node docs\render-prd.mjs
```

`LABEL` sets the running footer. It defaults to the PRD's label, so always pass
it when rendering the brief.

## Keeping these current

Re-verify against the repository — not against the previous revision — whenever
the database or hosting choice, the test counts, the routes, the five projects,
or any authenticity rule changes.

- **PRD** — sections 03 (authenticity), 13 (outstanding work) and 14 (decision
  log) go stale fastest. Test counts in §11 should be re-derived from the test
  files, never copied forward. Record what changed in §16.
- **Brief** — sections 07 (honest assessment) and 08.2 (outstanding items) are
  the ones that move.

Both documents follow one rule: **nothing is invented**. Missing information is
marked outstanding and asked about, never guessed.
