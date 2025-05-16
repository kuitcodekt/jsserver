import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  const targetUrl = req.query.url;

  if (!targetUrl || !/^https?:\/\//.test(targetUrl)) {
    return res.status(400).send('Missing or invalid "url" parameter');
  }

  try {
    const { data: html } = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (InjectProxy)'
      }
    });

    const $ = cheerio.load(html);
    const injectScript = '<script src="https://jsinjector-phi.vercel.app/injectjs.js"></script>';

    if ($('head').length) {
      $('head').append(injectScript);
    } else {
      $('html').append(injectScript);
    }

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200).send($.html());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Failed to fetch or inject target page.');
  }
}
