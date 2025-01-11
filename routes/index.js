import express from 'express';
import getData from '../data.js';
import { getArticleContent } from './article/article.js';
import { getIndexContent } from './index/index.js';
import { getTagContent } from './tag/tag.js';

const router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  const content = getIndexContent();
  res.render('index', content);
});

router.get('/tag/:tag', function (req, res) {
  try {
    const content = getTagContent(req.params);
    res.render('tag', content);
  } catch (err) {
    res.status(404).send(err.message);
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

router.get('/:article', async function (req, res) {
  try {
    const content = await getArticleContent(req.params);
    res.render('article', content);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

export default router;
