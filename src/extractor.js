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
    const cleanText = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();

    const title = matchFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = matchFirst(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || matchFirst(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const headings = [...html.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
      .map((match) => stripTags(match[1]))
      .filter(Boolean)
      .slice(0, 12);

    const detectedFields = detectBuyerGuideFields(cleanText);
    const suggestedLinks = extractSuggestedLinks(html, url).slice(0, 18);
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

function matchFirst(text, regex) {
  const match = text.match(regex);
  return match ? stripTags(match[1]) : '';
}

function stripTags(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
    if (!['http:', 'https:'].includes(next.protocol)) continue;
    if (next.hostname.replace(/^www\./, '') !== baseHost) continue;
    next.hash = '';
    const normalized = next.toString().replace(/\/$/, '/');
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    const label = stripTags(labelHtml).replace(/\s+/g, ' ').trim() || next.pathname;
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
  if (/product|products|shop|collection|collections|category|categories|doll|body|torso|silicone|tpe|new|best|sale|light|weight|small|mini|teen|adult/.test(text)) score += 4;
  if (/product|products|shop|collection|collections|category|categories/.test(text)) score += 4;
  if (/shipping|return|refund|warranty|care|clean|faq|support|contact/.test(text)) score += 2;
  if (/blog|privacy|terms|login|account|cart|checkout|wishlist|track|currency|language/.test(text)) score -= 4;
  if (url.pathname === '/' || url.pathname === '') score -= 3;
  if (url.pathname.split('/').filter(Boolean).length >= 2) score += 1;
  return score;
}

function classifyLinkKind(url, label) {
  const text = `${url.pathname} ${label}`.toLowerCase();
  if (/shipping|return|refund|warranty|care|clean|faq|support|contact/.test(text)) return 'support_policy';
  if (/product|products|item|model|doll|body|torso/.test(text) && url.pathname.split('/').filter(Boolean).length >= 2) return 'possible_product';
  if (/shop|collection|collections|category|categories/.test(text)) return 'possible_category';
  return 'possible_internal';
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

function estimateUsefulness(lowerText) {
  const signals = ['weight', 'height', 'tpe', 'silicone', 'shipping', 'return', 'warranty', 'clean', 'maintenance', 'price'];
  const score = signals.filter((signal) => lowerText.includes(signal)).length;
  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

module.exports = { extractUrl, detectBuyerGuideFields, extractSuggestedLinks };