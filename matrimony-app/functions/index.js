const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

admin.initializeApp();

const HOSTING_ORIGIN = 'https://matrimony-mobile-app-8541d.web.app';
const DEFAULT_IMAGE = `${HOSTING_ORIGIN}/assets/lotus-logo.png`;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function extractPhone(pathname) {
  const match = String(pathname || '').match(/\/share\/profile\/([^/?#]+)/i);
  return match?.[1]?.replace(/\D/g, '') ?? '';
}

function pickImageUrl(data) {
  const candidates = [
    data?.primaryPhotoUrl,
    ...(Array.isArray(data?.approvedPhotoUrls) ? data.approvedPhotoUrls : []),
    ...(Array.isArray(data?.photoUrls) ? data.photoUrls : []),
    data?.listing?.image,
    data?.biodata?.profilePhotoUrls,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string') {
      continue;
    }

    const trimmed = candidate.trim();
    if (trimmed.startsWith('https://')) {
      return trimmed;
    }

    const firstHttps = trimmed
      .split('|')
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith('https://'));
    if (firstHttps) {
      return firstHttps;
    }
  }

  return DEFAULT_IMAGE;
}

exports.profileShare = onRequest({ region: 'asia-south1' }, async (req, res) => {
  const phone = extractPhone(req.path);
  if (!phone) {
    res.status(404).send('Profile not found');
    return;
  }

  const profilePageUrl = `${HOSTING_ORIGIN}/admin/view-profile/${phone}`;
  let title = 'Ayya Matrimony Profile';
  let imageUrl = DEFAULT_IMAGE;

  try {
    const snapshot = await admin
      .firestore()
      .collection('profiles')
      .doc(`phone_${phone}`)
      .get();

    if (snapshot.exists) {
      const data = snapshot.data() || {};
      title = data.fullName || data.biodata?.fullName || data.listing?.name || title;
      imageUrl = pickImageUrl(data);
    }
  } catch {
    // Fall back to defaults when Firestore is unavailable.
  }

  const safeTitle = escapeHtml(title);
  const safeImage = escapeHtml(imageUrl);
  const safeProfileUrl = escapeHtml(profilePageUrl);
  const safeShareUrl = escapeHtml(`${HOSTING_ORIGIN}/share/profile/${phone}`);

  res.set('Cache-Control', 'public, max-age=300');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle} - Ayya Matrimony</title>
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Ayya Matrimony" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="View matrimony profile on Ayya Matrimony" />
    <meta property="og:url" content="${safeShareUrl}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:secure_url" content="${safeImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:image" content="${safeImage}" />
    <meta http-equiv="refresh" content="0;url=${safeProfileUrl}" />
  </head>
  <body>
    <p><a href="${safeProfileUrl}">Open profile</a></p>
  </body>
</html>`);
});
