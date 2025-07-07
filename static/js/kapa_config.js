/**
 * Extracts the user ID from the Google Analytics device ID.
 * @example `GA1.1.xxxxxxxxxx.xxxxxxxxxx => xxxxxxxxxx-xxxxxxxxxx`
 * @link https://support.google.com/analytics/answer/11397207
 */
function extractGoogleAnalyticsUserIdFromCookie(gaCookie) {
  if (gaCookie) {
    // Remove the Google Analytics tracker from the device ID.
    const userIdParts = gaCookie.split('.').slice(-2);
    if (userIdParts.length === 2) {
      return userIdParts.join('-');
    }
  }
  return undefined;
};

function getBrowserCookie(cookieName) {
  // In React Native environments, `document.cookie` doesn't exist.
  if (typeof document !== 'object' || typeof document.cookie !== 'string') {
    return undefined;
  }
  const name = cookieName + '=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.startsWith(name)) {
      return c.substring(name.length);
    }
  }
  return undefined;
};

function getGoogleAnalyticsUserIdFromBrowserCookie(cookieName) {
  const browserCookie = getBrowserCookie(cookieName);
  return browserCookie ? extractGoogleAnalyticsUserIdFromCookie(browserCookie) : undefined;
};

// make sure the cookie is available when the script first loads, i.e. when the user first visits the website
const ga_cookie_id = getGoogleAnalyticsUserIdFromBrowserCookie('_ga');

window.kapaSettings = { user: { uniqueClientId: ga_cookie_id } };
