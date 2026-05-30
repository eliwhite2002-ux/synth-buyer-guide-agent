function canonicalUrl(value) {
  try {
    const url = new URL(value || '');
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return String(value || '').trim();
  }
}

function imageUrl(image) {
  return typeof image === 'string' ? image : (image?.url || image?.src || image?.href || '');
}

function isUsableImageUrl(value, productUrl = '') {
  try {
    const image = new URL(value, productUrl);
    const normalized = canonicalUrl(image.toString());
    if (!['http:', 'https:'].includes(image.protocol)) return false;
    if (!normalized || normalized === canonicalUrl(productUrl)) return false;
    if (/logo|icon|avatar|sprite|placeholder|tracking|pixel/i.test(normalized)) return false;
    return /\.(?:avif|gif|jpe?g|png|webp)(?:$|[?#])/i.test(normalized)
      || /(?:image|images|img|media|uploads|cdn|gallery|product-images?)[/-]/i.test(image.pathname)
      || /[?&](?:format|fm|ext)=(?:avif|gif|jpe?g|png|webp)(?:&|$)/i.test(image.search);
  } catch {
    return false;
  }
}

function sanitizeImageCandidates(imageCandidates = [], productUrl = '') {
  const seen = new Set();
  return (Array.isArray(imageCandidates) ? imageCandidates : []).flatMap((image) => {
    const value = imageUrl(image);
    if (!isUsableImageUrl(value, productUrl)) return [];
    const url = new URL(value, productUrl).toString();
    if (seen.has(url)) return [];
    seen.add(url);
    return [{ url, label: typeof image === 'string' ? 'product image' : (image.label || image.alt || image.title || 'product image') }];
  });
}

function materialGroup(material = '') {
  const value = String(material).toLowerCase();
  if (value.includes('hybrid')) return 'Hybrid';
  if (value.includes('silicone')) return 'Silicone';
  if (value.includes('tpe')) return 'TPE';
  return 'Unknown';
}

function numericMeasurement(value = '', unit) {
  const match = String(value).match(new RegExp(`([0-9]+(?:\\.[0-9]+)?)\\s*${unit}`, 'i'));
  return match ? Number(match[1]) : null;
}

function classifySize(height = '') {
  const cm = numericMeasurement(height, 'cm');
  if (!cm) return 'unknown';
  if (cm < 145) return 'compact';
  if (cm >= 165) return 'large';
  return 'standard';
}

function classifyWeight(weight = '') {
  const kg = numericMeasurement(weight, 'kg');
  const lbs = numericMeasurement(weight, 'lbs?');
  const normalizedKg = kg || (lbs ? lbs * 0.453592 : null);
  if (!normalizedKg) return 'unknown';
  if (normalizedKg < 28) return 'lightweight';
  if (normalizedKg >= 40) return 'heavy';
  return 'manageable';
}

function missingGuideFields(specs) {
  return ['price', 'height', 'weight', 'material'].filter((field) => !specs[field] || specs[field] === 'Unknown');
}

function normalizeProductSpecs(productSpecs = {}, productUrl = '') {
  const specs = {
    productName: productSpecs.productName || '',
    price: productSpecs.price || '',
    regularPrice: productSpecs.regularPrice || '',
    salePrice: productSpecs.salePrice || '',
    brand: productSpecs.brand || '',
    body: productSpecs.body || '',
    head: productSpecs.head || '',
    collection: productSpecs.collection || '',
    material: productSpecs.material || 'Unknown',
    height: productSpecs.height || '',
    weight: productSpecs.bodyWeight || productSpecs.weight || '',
    productSpecs,
    imageCandidates: sanitizeImageCandidates(productSpecs.imageCandidates, productUrl)
  };
  const missing = missingGuideFields(specs);
  return {
    ...specs,
    materialGroup: materialGroup(specs.material),
    sizeClass: classifySize(specs.height),
    weightClass: classifyWeight(specs.weight),
    missingGuideFields: missing,
    guideReadiness: missing.length ? 'missing_core_specs' : 'core_specs_ready'
  };
}

function candidateKind(linkType) {
  return linkType === 'likely_category' ? 'category_candidate' : 'product_candidate';
}

function candidateDefaults(linkType) {
  return {
    candidateKind: candidateKind(linkType),
    reviewOnly: true,
    queueStatus: 'candidate_created',
    reviewStatus: 'needs_review',
    recommendationStatus: 'not_recommended',
    mediaRights: 'unknown',
    imageRights: 'unknown'
  };
}

module.exports = { candidateDefaults, candidateKind, classifySize, classifyWeight, isUsableImageUrl, materialGroup, normalizeProductSpecs, sanitizeImageCandidates };
