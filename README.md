# Vnua Systems

https://adrielvent.github.io/vnua-systems/

## Editing

The easy way: go to https://app.pagescms.org, sign in with GitHub, and open `AdrielVent/vnua-systems`.
You get forms for the home page, every page, the programs list, the menu and the footer, and you can upload photos.
Saving commits to `main`, and GitHub Pages rebuilds the site in about a minute.

By hand:

| File | What's in it |
| --- | --- |
| `_data/home.yml` | Home page: headline, photo, tiles, the blue contract band, news, the about-me strip |
| `_data/programs.yml` | The Programs list |
| `_data/site.yml` | Name at the top, menu (with dropdowns), footer |
| `pages/*.md` | Every other page. Text is Markdown; the "At a glance" box is `facts` at the top |
| `assets/img/` | Photos |
| `assets/site.css` | The look. The store uses the same file |

## How it's built

GitHub Pages builds it with Jekyll on every push to `main`. Layouts are in `_layouts/` and `_includes/`.
To preview locally: `jekyll serve` (Jekyll 3.10, the version GitHub Pages runs).

Type: Barlow for the name, menu and headings (a DIN-style face like the DIN on Lockheed Martin's 2016 site; Blue Origin uses Barlow today), served from `assets/fonts/` under the SIL Open Font License. Body text is Helvetica/Arial, which is what Lockheed, SpaceX and most big sites used for body text in 2016.
