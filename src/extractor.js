async function extractUrl(targetUrl) {
  const startedAt = new Date().toISOString();
  let url;
  try {
    url = new URL(targetUrl);
  } catch (error) {
    return {
      ok: false,
      targetUrl,
      status: 'invalid_url',
      message: 'That is not a valid URL. Paste a full URL including https://',
      startedAt,
      completedAt: new Date().toISOString()
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'user-agent': 'SynthBuyerGuideAgent/0.1 internal editorial research tool',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    const html = await response.text();
    const cleanText = htmlToText(html);

    const title = matchFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = matchFirst(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || matchFirst(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
      .map((match) => stripTags(match[1]))
      .filter(Boolean)
      .slice(0, 12);

    const detectedFields = detectBuyerGuideFields(cleanText);
    const suggestedLinks = extractSuggestedLinks(html, url).slice(0, 18);
    const productSpecs = extractProductSpecs({ html, cleanText, title, description, targetUrl: url.toString() });
    const blocker = response.ok ? '' : `HTTP ${response.status} ${response.statusText}`;

    return {
      ok: response.ok,
      targetUrl: url.toString(),
      statusCode: response.status,
      status: response.ok ? 'extracted' : 'needs_review',
      blocker,
      title: title || '(no title found)',
      description: description || '',
      headings,
      suggestedLinks,
      productSpecs,
      detectedFields,
      textSample: cleanText.slice(0, 1800),
      startedAt,
      completedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      ok: false,
      targetUrl: url.toString(),
      status: 'needs_review',
      blocker: error.name === 'AbortError' ? 'Request timed out' : error.message,
      message: 'Extraction failed. This is an access-wall candidate, not a task to dump back on Eli.',
      startedAt,
      completedAt: new Date().toISOString()
    };
  } finally {
    clearTimeout(timeout);
  }
}

function htmlToText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>|<\/li>|<\/div>|<\/h[1-6]>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&#36;|&dollar;/g, '$')
    .replace(/&#165;|&yen;/g, '¥')
    .replace(/&#163;|&pound;/g, '£')
    .replace(/&#8364;|&euro;/g, '€')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchFirst(text, regex) {
  const match = text.match(regex);
  return match ? stripTags(match[1]) : '';
}

function stripTags(value) {
  return htmlToText(String(value || ''));
}

function isJunkLink(url, label = '') {
  const text = `${url.pathname} ${url.search} ${label}`.toLowerCase();
  return /cdn-cgi|email-protection|mailto:|tel:|javascript:|#|wp-json|xmlrpc|feed|rss|my-account|account|login|logout|cart|checkout|wishlist|compare|currency|language|privacy|terms/.test(text);
}

function isArticleGuideLink(url, label = '') {
  const text = `${url.pathname} ${label}`.toLowerCase();
  return /blog|news|guide|article|overview|top-features|features|tutorial|tutorials|factory-videos|videos|pov|feedback/.test(text);
}

function extractSuggestedLinks(html, baseUrl) {
  const anchors = [...html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const seen = new Set();
  const baseHost = baseUrl.hostname.replace(/^www\./, '');
  const scored = [];

  for (const [, href, labelHtml] of anchors) {
    let next;
    try {
      next = new URL(href, baseUrl);
    } catch {
      continue;
    }
    const label = stripTags(labelHtml).replace(/\s+/g, ' ').trim() || next.pathname;
    if (isJunkLink(next, label)) continue;
    if (!['http:', 'https:'].includes(next.protocol)) continue;
    if (next.hostname.replace(/^www\./, '') !== baseHost) continue;
    next.hash = '';
    const normalized = next.toString().replace(/\/$/, '/');
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    const score = scoreLink(next, label);
    if (score <= 0) continue;
    scored.push({ url: normalized, label, score, kind: classifyLinkKind(next, label) });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .map(({ url, label, kind }) => ({ url, label, kind }));
}

function scoreLink(url, label) {
  const text = `${url.pathname} ${label}`.toLowerCase();
  let score = 0;
  if (/product-category|shop|collection|collections|category|categories/.test(text)) score += 7;
  if (/product|products|doll|body|torso|silicone|tpe|new|best|sale|light|weight|small|mini|adult/.test(text)) score += 4;
  if (isArticleGuideLink(url, label)) score -= 3;
  if (/shipping|return|refund|warranty|care|clean|faq|support|contact/.test(text)) score += 2;
  if (/blog|privacy|terms|login|account|cart|checkout|wishlist|track|currency|language|cdn-cgi|email-protection/.test(text)) score -= 8;
  if (url.pathname === '/' || url.pathname === '') score -= 3;
  if (url.pathname.split('/').filter(Boolean).length >= 2) score += 1;
  return score;
}

function classifyLinkKind(url, label) {
  const text = `${url.pathname} ${label}`.toLowerCase();
  if (/shipping|return|refund|warranty|care|clean|faq|support|contact/.test(text)) return 'support_policy';
  if (isArticleGuideLink(url, label)) return 'article_guide';
  if (/product-category|shop|collection|collections|category|categories/.test(text)) return 'likely_category';
  if (/product|products|item|model|doll|body|torso/.test(text) && url.pathname.split('/').filter(Boolean).length >= 2) return 'likely_product';
  return 'unknown';
}

function detectBuyerGuideFields(text) {
  const lower = text.toLowerCase();
  return {
    mentionsPrice: /\$|usd|price|sale|discount/.test(lower),
    mentionsWeight: /weight|kg|lbs|pounds/.test(lower),
    mentionsHeight: /height|cm|feet|inch|inches/.test(lower),
    mentionsMaterial: /tpe|silicone|gel|platinum/.test(lower),
    mentionsShipping: /shipping|delivery|dispatch|lead time/.test(lower),
    mentionsReturns: /return|refund|cancellation|warranty/.test(lower),
    mentionsCare: /clean|care|maintenance|powder|dry/.test(lower),
    ownerExperienceUsefulness: estimateUsefulness(lower)
  };
}

function extractProductSpecs({ html, cleanText, title, description, targetUrl }) {
  const specsText = specWindow(cleanText);
  const priceValues = extractPrices(cleanText);
  const spec = {
    productName: title || '',
    description: description || '',
    regularPrice: priceValues.regularPrice,
    salePrice: priceValues.salePrice,
    price: priceValues.salePrice || priceValues.regularPrice || '',
    brand: extractLabeledValue(specsText, ['Brand']),
    body: extractLabeledValue(specsText, ['Body']),
    head: extractLabeledValue(specsText, ['Head']),
    collection: extractLabeledValue(specsText, ['Collection']),
    bodyWeight: extractLabeledValue(specsText, ['Body weight', 'Weight']),
    height: extractLabeledValue(specsText, ['Height']),
    material: extractMaterial(cleanText, title, description),
    imageCandidates: extractImageCandidates(html, targetUrl).slice(0, 8)
  };
  return Object.fromEntries(Object.entries(spec).filter(([, value]) => Array.isArray(value) ? value.length : Boolean(value)));
}

function specWindow(cleanText) {
  const text = String(cleanText || '');
  const start = text.toLowerCase().indexOf('default specifications');
  if (start >= 0) return text.slice(start, start + 1600);
  return text.slice(0, 2200);
}

function extractLabeledValue(text, labels) {
  const stopLabels = [
    'Brand', 'Body', 'Head', 'Collection', 'Body weight', 'Weight', 'Height', 'Material',
    'Shoulders', 'Arms length', 'Hands length', 'Leg length', 'Thigh girth', 'Calf girth',
    'Bust', 'Under Bust', 'Hips', 'Waist', 'Foot length', 'Anal depth', 'Vaginal depth',
    'Default Specifications', 'Description', 'Add to cart', 'Customize', 'Shipping', 'Reviews'
  ];
  const stop = `(?:${stopLabels.map(escapeRegExp).join('|')})`;
  for (const label of labels) {
    const escaped = escapeRegExp(label);
    const regex = new RegExp(`${escaped}\\s*:?\\s*([^•\\n]+?)(?=\\s+${stop}\\s*:?|$)`, 'i');
    const match = String(text || '').match(regex);
    if (match) return cleanupSpecValue(match[1]);
  }
  return '';
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanupSpecValue(value) {
  return String(value || '')
    .replace(/^[\s:：-]+/, '')
    .replace(/\s+/g, ' ')
    .replace(/(?:Add to cart|Customize|Select options).*$/i, '')
    .trim();
}

function extractPrices(text) {
  const matches = [...String(text || '').matchAll(/(?:[$€£¥]\s*([0-9][0-9,]*(?:\.\d{2})?)|([0-9][0-9,]*(?:\.\d{2})?)\s*[$€£¥])/g)]
    .map((match) => Number(String(match[1] || match[2]).replace(/,/g, '')))
    .filter((value) => Number.isFinite(value) && value > 50);
  const unique = [...new Set(matches)].sort((a, b) => a - b);
  if (!unique.length) return { regularPrice: '', salePrice: '' };
  const format = (value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return {
    salePrice: unique[0] ? format(unique[0]) : '',
    regularPrice: unique.length > 1 ? format(unique[unique.length - 1]) : ''
  };
}

function extractMaterial(...values) {
  const text = values.join(' ').toLowerCase();
  if (/platinum\s+silicone/.test(text)) return 'Platinum silicone';
  if (/silicone/.test(text)) return 'Silicone';
  if (/\btpe\b/.test(text)) return 'TPE';
  return '';
}

function extractImageCandidates(html, targetUrl) {
  const candidates = [];
  const add = (raw, label = '') => {
    if (!raw) return;
    try {
      const absolute = new URL(raw, targetUrl).toString();
      if (!/^https?:/i.test(absolute)) return;
      if (/logo|icon|avatar|sprite|placeholder|data:image/i.test(absolute)) return;
      if (!candidates.some((item) => item.url === absolute)) candidates.push({ url: absolute, label });
    } catch {}
  };
  for (const match of String(html || '').matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi)) add(match[1], 'og:image');
  for (const match of String(html || '').matchAll(/<img[^>]+(?:src|data-src|data-large_image)=["']([^"']+)["'][^>]*>/gi)) {
    const tag = match[0];
    const alt = matchFirst(tag, /alt=["']([^"']*)["']/i);
    add(match[1], alt || 'product image');
  }
  return candidates;
}

function estimateUsefulness(lowerText) {
  const signals = ['weight', 'height', 'tpe', 'silicone', 'shipping', 'return', 'warranty', 'clean', 'maintenance', 'price'];
  const score = signals.filter((signal) => lowerText.includes(signal)).length;
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

module.exports = { extractUrl, detectBuyerGuideFields, extractSuggestedLinks, extractProductSpecs };
