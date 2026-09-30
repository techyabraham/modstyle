"""Produce local WOFF2 subsets from official Google Fonts variable TTFs."""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

SOURCE = Path('.font-source')
OUTPUT = Path('src/assets/fonts')
OUTPUT.mkdir(parents=True, exist_ok=True)

LATIN = set(range(0x0000, 0x0100))
LATIN.update(range(0x2000, 0x2070))
LATIN.update({0x0131, 0x0152, 0x0153, 0x20A6, 0x20AC, 0x2122})
EXTENDED = set(range(0x0100, 0x0250))
EXTENDED.update(range(0x1E00, 0x1F00))
EXTENDED.difference_update(LATIN)
FULL = LATIN | EXTENDED | set(range(0x20A0, 0x20D0)) | set(range(0x2100, 0x2150))

def write_subset(name: str, suffix: str, codepoints: set[int]) -> None:
    font = TTFont(SOURCE / f'{name}.ttf')
    options = subset.Options()
    options.layout_features = ['*']
    options.name_IDs = ['*']
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=codepoints)
    subsetter.subset(font)
    if name == 'fraunces':
        font = instantiateVariableFont(font, {
            'WONK': 0,
            # The design system maps Fraunces to weight 600 and SOFT 50.
            # Retain optical sizing, which still varies with rendered text size.
            'wght': 600,
            'opsz': (9, 72),
            'SOFT': 50,
        }, inplace=False)
    else:
        font = instantiateVariableFont(font, {
            'wght': (400, 500, 700),
        }, inplace=False)
    if 0x20A6 in codepoints and 0x20A6 not in font.getBestCmap():
        raise RuntimeError(f'{name} is missing U+20A6 after subsetting')
    axes = {axis.axisTag for axis in font['fvar'].axes}
    expected = {'opsz'} if name == 'fraunces' else {'wght', 'opsz'}
    if axes != expected:
        raise RuntimeError(f'{name} axes: {axes}, expected {expected}')
    font.flavor = 'woff2'
    target = OUTPUT / f'{name}-{suffix}.woff2'
    font.save(target)
    print(f'{target}: {target.stat().st_size:,} bytes, axes {sorted(axes)}')

write_subset('fraunces', 'latin-ng', LATIN)
write_subset('fraunces', 'latin-ext-ng', EXTENDED)
write_subset('inter', 'latin-ng', FULL)
