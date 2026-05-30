function normalizeProductSpecs(productSpecs = {}) {
  return {
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
    imageCandidates: Array.isArray(productSpecs.imageCandidates) ? productSpecs.imageCandidates : []
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

module.exports = { candidateDefaults, candidateKind, normalizeProductSpecs };
