// Default content for the JustBeHumanA template. Stored Lander.content rows
// shallow-merge over this object section-by-section. Edit values here to change
// the seed copy; per-lander overrides happen through the editor.

export const DEFAULT_CONTENT = {
  masthead: {
    volLabel: 'b. quarterly · vol. iv',
    logoLeft: 'b',
    logoDot: '.',
    domain: 'theblife.com',
  },
  hero: {
    caption: 'Issue 04 · Spring 2026 · The Humani-T',
    poemLines: [
      { text: 'just' },
      { text: 'be', italic: true, color: 'var(--b-sage)' },
      { text: 'human.', indent: 80 },
    ],
    body: "Three words, soft-printed on the chest. A small thing to wear in a year that's asking large questions of all of us.",
    heroVariantId: 'maroon',
    photoBriefs: [
      { bg: '#A8786E', variantId: 'maroon', label: 'One person on a stoop, golden hour, Maroon tee. Eyes off-camera, half-smile.', sub: 'hero portrait · frame a' },
      { bg: '#8C6E60', variantId: 'slate', label: 'Same person, mid-step, looking at someone off-frame. The shirt softening into the body.', sub: 'hero portrait · frame b' },
    ],
    plateLabel: '8 colors · XS – XXL',
    photoCaption: 'soft-printed, tri-blend, made to last',
    pageNumber: '$29',
    plateNumeral: 'no. 01',
  },
  why: {
    chapter: 'Chapter Two',
    headline: 'A shirt for people thinking carefully',
    headlineEm: ' about what comes next.',
    dropCap: 'W',
    paragraphs: [
      "e wrote three words on a Tuesday and kept them for a year. The phrase didn't get smarter. It got truer.",
      'The shirt is a small action — a way of telling the room, and yourself, that the human part of the conversation still belongs to humans. Not a cause. A reminder.',
    ],
    variantId: 'mauve',
    callout: '"a quiet weight."',
  },
  detail: {
    caption: 'Detail · Plate ii',
    paragraph: 'The print is laid down soft — it moves with the fabric and softens in the wash, never stiff to the touch.',
    variantId: 'slate',
    bigWord: 'soft.',
    subWord: 'One print, laid\ndown quietly.',
  },
  worn: {
    chapter: 'Chapter Four · Worn',
    headline: 'People we know.',
    pageNumber: 'p. 22',
    variantId: 'maroon',
    photoBriefs: [
      { bg: '#C8B8A0', h: 300, variantId: 'slate', label: 'Two friends on a stoop, mid-laugh. Slate tee.', sub: 'lifestyle · to be shot' },
      { bg: '#A89886', h: 260, variantId: 'cream', label: 'Hand-off — folded shirt, passed.', sub: 'lifestyle · to be shot' },
    ],
    quote: 'The shirt does its quiet work. The room is the loud part.',
  },
  variants: {
    captionLeft: 'Eight colors',
    headline: 'Chosen, not offered.',
    captionRight: 'Sizes xs–xxl',
  },
  specs: {
    caption: 'Notes from the pattern room',
    headline: 'Six things',
    headlineEm: ' worth knowing',
    items: [
      ['i.',   'Combed cotton',   '100% Airlume combed and ring-spun on solids; 52/48 cotton-poly on heathers.'],
      ['ii.',  'Pre-shrunk',      'fabric washed before sewing — fit holds after laundering.'],
      ['iii.', 'Light + soft',    '4.2 oz./yd.² (142 g/m²), 30 singles — drapes, doesn\'t cling.'],
      ['iv.',  'Side-seamed',     'tailored shape that doesn\'t twist on the body.'],
      ['v.',   'Tear-away label', 'no scratchy tag at the neck.'],
      ['vi.',  'Shoulder taping', 'clean shoulder-to-shoulder finish that holds its line.'],
    ],
  },
  close: {
    caption: 'Coda',
    poemLines: [
      { text: 'Wear it,' },
      { text: 'mean it.', italic: true, color: 'var(--b-sage)' },
    ],
    body: "It's a small thing. Small things, worn by enough people, stop being small.",
    sticky: {
      name: 'just be human.',
      sizeLabel: '8 colors · XS – XXL',
      price: '$38',
      salePrice: '$29',
      cta: 'Buy',
      variantId: 'maroon',
    },
  },
  footer: {
    left: 'fin.',
    center: 'p. 32 / 32',
    right: 'printed quietly',
  },
}
