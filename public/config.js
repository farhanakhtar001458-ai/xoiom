// Xoiom runtime configuration.
// This file loads before the app bundle — edit it, commit and push.
//
// • When the Express backend serves the site (npm start): leave apiBase as "".
// • When the site is hosted on GitHub Pages and the API is hosted elsewhere
//   (Render / Railway / Fly.io), point apiBase at your deployed API, for example:
//       window.XOIOM.apiBase = "https://your-api.onrender.com/api";
//
// Without a reachable API the site still works — it falls back to the
// built-in content and the contact form opens your mail app instead.
window.XOIOM = window.XOIOM || {};
window.XOIOM.apiBase = "";
