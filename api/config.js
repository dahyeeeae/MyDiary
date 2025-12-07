export default function handler(req, res) {
  const cfg = {
    apiKey: process.env.FB_API_KEY,
    authDomain: process.env.FB_AUTH_DOMAIN,
    projectId: process.env.FB_PROJECT_ID,
    storageBucket: process.env.FB_STORAGE_BUCKET,
    appId: process.env.FB_APP_ID,
  };

  // 필수값 점검(선택)
  for (const [k, v] of Object.entries(cfg)) {
    if (!v) {
      return res.status(500).json({ error: `Missing env: ${k}` });
    }
  }

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).send(JSON.stringify(cfg));
}
