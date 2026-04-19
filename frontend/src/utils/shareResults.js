function toBase64Url(value) {
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value) {
  const normalized = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');

  return decodeURIComponent(escape(atob(normalized)));
}

export function buildSharedResultsToken(payload) {
  return toBase64Url(JSON.stringify(payload));
}

export function parseSharedResultsToken(token) {
  return JSON.parse(fromBase64Url(token));
}
