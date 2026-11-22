# Vnua Systems

The site for Vnua Systems, Vnua Industries' defense manufacturing work: https://adrielvent.github.io/vnua-systems/

Plain HTML pages, no build step. GitHub Pages serves this folder as-is.

| Page | What's on it |
| --- | --- |
| `index.html` | Home: what Vnua Systems does, why now (with sources), programs, the contract exercise |
| `work.html` | Programs: every product with its real status |
| `datumpane.html`, `vnua-lock.html` | Defense manufacturing programs: spec sheet on the left, the story on the right |
| `contract.html` | HAIAA-27-01, Hofstra AIAA's contract competition after not being selected for DBF |
| `vnua-connect.html`, `vnua-apparel.html` | Other work under Vnua Industries |
| `engineering.html`, `about.html`, `contact.html` | Engineering projects, about, contact |
| `404.html` | Not-found page |

Every page has the same header and footer. If you add a page, copy them from an existing one and put
`aria-current="page"` on its tab. All styles are in `assets/site.css`; the store uses the same file.

Type is Oswald (headings), Source Sans 3 (text) and Cousine (labels), served from `assets/fonts/` under the
SIL Open Font License (license files are next to the fonts).

`assets/site.js` only tightens the header on scroll and fades sections in. It skips the fade when Reduce
Motion is on, and every page works without it.

Facts on the site link to their sources. If you change a fact, change its source too, and update the
"Checked" date in that page's Sources section.
