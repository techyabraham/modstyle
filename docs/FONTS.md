# Self-hosted fonts

The committed WOFF2 files cover Latin, Latin Extended and U+20A6 (₦). Fraunces is split into a small Latin/₦ file used by the main page and a Latin Extended file loaded only when needed. Inter uses one file. Fraunces retains the `wght`, `opsz` and `SOFT` axes; `WONK` is fixed at its default. Inter retains `wght` and `opsz`. The files are covered by the adjoining OFL licences.

Sources: [Fraunces](https://github.com/google/fonts/tree/main/ofl/fraunces) and [Inter](https://github.com/google/fonts/tree/main/ofl/inter), from the official Google Fonts repository. Download the normal variable TTFs as `.font-source/fraunces.ttf` and `.font-source/inter.ttf`, then run:

```sh
python -m pip install fonttools brotli
python scripts/subset-fonts.py
```

The source TTFs are ignored after subsetting. The generated WOFF2s are checked into the site so ordinary installs and builds require no Python or external font service. The browser test inspects the actual font used for all seven glyphs in `₦40,000` and rejects system fallback. Font metadata is also checked by the subsetting script.
