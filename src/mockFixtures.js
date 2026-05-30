const fixtures = {
  'mock://vendor-homepage': {
    ok: true,
    targetUrl: 'https://example.com/',
    title: 'Example Vendor',
    description: 'Mock vendor homepage for deterministic discovery testing.',
    headings: ['Example Vendor'],
    detectedFields: { mentionsShipping: true, mentionsReturns: true, ownerExperienceUsefulness: 'medium' },
    suggestedLinks: [
      { url: 'https://example.com/product/model-one', label: 'Model One', kind: 'likely_product' },
      { url: 'https://example.com/product-category/silicone', label: 'Silicone Collection', kind: 'likely_category' },
      { url: 'https://example.com/guide/first-time-buyers', label: 'First-time buyer guide', kind: 'article_guide' }
    ],
    textSample: 'Mock vendor homepage with shipping and returns links.'
  },
  'mock://product-model-one': {
    ok: true,
    targetUrl: 'https://example.com/product/model-one',
    title: 'Model One',
    description: 'Mock silicone product page with useful first-time buyer specs.',
    headings: ['Model One', 'Default Specifications'],
    detectedFields: { mentionsPrice: true, mentionsWeight: true, mentionsHeight: true, mentionsMaterial: true, ownerExperienceUsefulness: 'high' },
    productSpecs: {
      price: '$1,935.00',
      regularPrice: '$2,150.00',
      salePrice: '$1,935.00',
      brand: 'TAYU Doll',
      body: 'TAYU NOVA Series 158cm C Cup',
      head: 'QingZhi',
      collection: 'NOVA Series',
      bodyWeight: '31kg / 68 lbs',
      height: '158cm / 5ft 2in',
      material: 'Silicone',
      imageCandidates: [{ url: 'https://example.com/images/model-one.jpg', label: 'Model One source image' }]
    },
    textSample: 'Mock product page: price, height, weight, material, shipping, and care.'
  },
  'mock://category-silicone': {
    ok: true,
    targetUrl: 'https://example.com/product-category/silicone',
    title: 'Silicone Collection',
    description: 'Mock category page for discovery-only candidate testing.',
    headings: ['Silicone Collection'],
    detectedFields: { mentionsMaterial: true, ownerExperienceUsefulness: 'low' },
    textSample: 'Mock category page. Discovery lead only.'
  },
  'mock://article-first-time-buyers': {
    ok: true,
    targetUrl: 'https://example.com/guide/first-time-buyers',
    title: 'First-time buyer guide',
    description: 'Mock article page that must save evidence without creating a product card.',
    headings: ['First-time buyer guide'],
    detectedFields: { mentionsCare: true, ownerExperienceUsefulness: 'medium' },
    textSample: 'Mock editorial article page.'
  },
  'mock://blocked-access-wall': {
    ok: false,
    targetUrl: 'https://example.com/product/blocked-model',
    status: 'needs_review',
    blocker: 'Mock access wall: JS-heavy or dynamic page',
    message: 'Mock blocked page for narrow access-wall handling.'
  }
};

function getMockFixture(targetUrl) {
  const fixture = fixtures[String(targetUrl || '').trim()];
  return fixture ? { ...fixture, adapter: 'mock_fixture', startedAt: new Date().toISOString(), completedAt: new Date().toISOString() } : null;
}

module.exports = { fixtures, getMockFixture };
