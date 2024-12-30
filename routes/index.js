import express from 'express';
import createError from 'http-errors';
import { format, differenceInDays, formatDistanceToNow, formatISO } from 'date-fns';
import getData from '../data.js';

const router = express.Router();


function formatDate(dateMs) { 
  const date = new Date(dateMs);
  return format(date, date.getFullYear() === new Date().getFullYear() ? 'MMM d' : 'MMM d, yyyy');
}

/* GET home page. */
router.get('/', function (req, res, next) {
  const data = getData();

  const meta = Object.assign({}, data.siteMetadata, {
    title: data.siteMetadata.title,
    description: data.siteMetadata.description,
  });

  // Сортировка страниц по mtimeMs в порядке убывания
  const sortedPages = Object.values(data.pages).sort((a, b) => b.mtimeMs - a.mtimeMs);


  const items = sortedPages.map(page => {
    return {
      title: page.title,
      uri: page.uri,
      description: page.description,
      tags: page.tags,
      date: formatDate(page.birthtimeMs),
      image: page.image,
    }
  });

  const tags = Object.keys(data.tags);

  res.render('index', { meta, items, tags });
});

router.get('/tag/:tag', function (req, res, next) {
  res.render('tag', {});
});

router.get('/site.webmanifest', function (req, res, next) {
  const data = getData();
  res.json({
    "name": data.siteMetadata.title,
    "short_name": data.siteMetadata.title,
    "icons": [
      {
        "src": "/images/android-chrome-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/images/android-chrome-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ],
    "theme_color": "#ffffff",
    "background_color": "#ffffff",
    "display": "standalone"
  });
})

router.get('/:article', function (req, res, next) {
  const data = getData();

  if (!data.URIMap[req.params.article]) {
    res.status(404).send('Article not found');

    return
  }

  const id =  data.URIMap[req.params.article];
  const article = data.pages[id];

  article.date = formatDate(article.birthtimeMs);

  const meta = Object.assign({}, data.siteMetadata, {
    title: data.siteMetadata.title,
    description: data.siteMetadata.description,
    published_time: formatISO(new Date(article.birthtimeMs)),
    modified_time: formatISO(new Date(article.mtimeMs)),    
  });


  res.render('article', { meta, article });
});

export default router;
