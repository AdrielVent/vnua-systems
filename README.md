# Vnua Systems

The hub for Vnua Industries: https://adrielvent.github.io/vnua-systems/

Plain HTML pages, no build step. GitHub Pages serves this folder as-is.

| Page | What's on it |
| --- | --- |
| `index.html` | Home: intro, the cube, and what's going on right now |
| `work.html` | Every product, with status |
| `vnua-connect.html`, `vnua-lock.html`, `datumpane.html`, `vnua-apparel.html` | One page per product: facts on the left, the story on the right |
| `engineering.html` | Engineering projects (full write-ups live in the portfolio repo) |
| `about.html`, `contact.html` | About and contact |
| `404.html` | Not-found page |

Every page has the same header and tabs. If you add a page, copy the header from an existing one and put
`aria-current="page"` on its tab. All styles are in `assets/site.css`.

Type is Tinos (the free Times New Roman) with Cousine for labels, served from `assets/fonts/`
under the SIL Open Font License (license files are next to the fonts).

The cube (`assets/cube.js`) uses three.js r160 from jsDelivr. It renders only while visible and respects
Reduce Motion. If WebGL or the script fails, the cube stays hidden and the rest of the page is unaffected.
