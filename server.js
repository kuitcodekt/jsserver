const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;
const INJECT_SCRIPT = '<script src="https://jsinjector-phi.vercel.app/injectjs.js"></script>';

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl || !/^https?:\/\//.test(targetUrl)) {
    return res.status(400).send('Invalid or missing "url" parameter.');
  }

  try {
    const { data: html } = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (InjectProxy)'
      }
    });

    const $ = cheerio.load(html);

    if ($('head').length) {
      $('head').append(INJECT_SCRIPT);
    } else if ($('body').length) {
      $('body').prepend(INJECT_SCRIPT);
    } else {
      // fallback if no <head> or <body>
      $('html').append(INJECT_SCRIPT);
    }

    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.send($.html());
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch or inject target page.');
  }
});

app.listen(PORT, () => {
  console.log(`Injecting proxy running at http://localhost:${PORT}`);
});
