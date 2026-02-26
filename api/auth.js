export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing OAuth code');
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error || !data.access_token) {
      return res.status(400).send('GitHub OAuth failed: ' + (data.error_description || data.error));
    }

    const host = req.headers.host;
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUrl = `${protocol}://${host}/?token=${data.access_token}`;
    res.redirect(302, redirectUrl);

  } catch (err) {
    console.error('OAuth error:', err);
    res.status(500).send('Internal server error during OAuth');
  }
}
