import express from 'express';
import getData, { removeFileExtension } from '../data.js';
import { getArticleContent } from './article/article.js';
import { getIndexContent } from './index/index.js';
import { getTagContent } from './tag/tag.js';
import { formatISO } from './format.js';
import { addImage } from '../images.js';

const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  addImage('/sitemap.xml');

  const content = getIndexContent();
  res.render('index', content);
});

router.get('/tag/:tag', function (req, res) {
  try {
    req.params.tag = removeFileExtension(req.params.tag);
    const content = getTagContent(req.params);
    res.render('tag', content);
  } catch (err) {
    console.error(err);
    res.status(404).send(err.message); // TODO: хорошо бы иметь типы ошибок, что бы отличать бизнес логику от не бизнес
  }
});

router.get('/site.webmanifest', function (req, res) {
  const data = getData();
  res.json({
    name: data.siteMetadata.title,
    short_name: data.siteMetadata.title,
    icons: [
      {
        src: '/images/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  });
});

router.get('/sitemap.xml', async function (req, res) {
  const data = await getData();

  const url = (loc, lastmod, priority = '0.80') => {
    res.write(`
<url>
  <loc>${loc}</loc>
  <lastmod>${formatISO(new Date(lastmod))}</lastmod>
  <priority>${priority}</priority>
</url>`);
  };

  res.set('Content-Type', 'text/xml');
  res.write('<?xml version="1.0" encoding="UTF-8"?>\n');
  res.write(`<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  `);

  const { siteUrl } = data.siteMetadata;
  const now = Date.now();

  url(siteUrl, now, '1.00');
  for (const id in data.pages) {
    const { uri, mtimeMs } = data.pages[id];
    url(siteUrl + uri, mtimeMs, '0.80');
  }

  for (const tag in data.tagsURIMap) {
    url(siteUrl + 'tag/' + tag + '.html', now, '0.60');
  }

  res.end('\n</urlset>');
});

router.get('/:article', async function (req, res) {
  try {
    const content = await getArticleContent(req.params);
    res.render('article', content);
  } catch (err) {
    console.error(err);
    res.status(404).send(err.message);
  }
});

export default router;
