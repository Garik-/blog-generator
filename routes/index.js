import express from 'express';
import { format, formatISO } from 'date-fns';
import getData from '../data.js';
import { getImageDimensions } from './api.js';

const router = express.Router();

function formatDate(dateMs) {
  const date = new Date(dateMs);
  return format(
    date,
    date.getFullYear() === new Date().getFullYear() ? 'MMM d' : 'MMM d, yyyy'
  );
}

/* GET home page. */
router.get('/', function (req, res) {
  const data = getData();

  const meta = Object.assign({}, data.siteMetadata, {
    title: data.siteMetadata.title,
    description: data.siteMetadata.description,
  });

  // Сортировка страниц по mtimeMs в порядке убывания
  const sortedPages = Object.values(data.pages).sort(
    (a, b) => b.mtimeMs - a.mtimeMs
  );

  const items = sortedPages.map((page) => {
    return {
      title: page.title,
      uri: page.uri,
      description: page.description,
      tags: page.tags,
      date: formatDate(page.birthtimeMs),
      image: page.image,
    };
  });

  const tags = Object.keys(data.tags);

  res.render('index', { meta, items, tags });
});

router.get('/tag/:tag', function (req, res) {
  res.render('tag', {});
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

function createSrcset(
  file,
  format = '',
  sizes = [640, 720, 750, 768, 828, 1100, 1400]
) {
  return sizes
    .map((size) => {
      const formattedPath = format ? `format:${format}/` : '';
      return `/v1/resize:fit:${size}/${formattedPath}${file} ${size}w`;
    })
    .join(', ');
}

async function replaceImages(context) {
  const regex = /<\p>!\[\[([^\]]+)\]\]<\/p>/gm;
  const match = context.matchAll(regex);
  const sizes =
    '(min-resolution: 4dppx) and (max-width: 700px) 50vw, (-webkit-min-device-pixel-ratio: 4) and (max-width: 700px) 50vw, (min-resolution: 3dppx) and (max-width: 700px) 67vw, (-webkit-min-device-pixel-ratio: 3) and (max-width: 700px) 65vw, (min-resolution: 2.5dppx) and (max-width: 700px) 80vw, (-webkit-min-device-pixel-ratio: 2.5) and (max-width: 700px) 80vw, (min-resolution: 2dppx) and (max-width: 700px) 100vw, (-webkit-min-device-pixel-ratio: 2) and (max-width: 700px) 100vw, 700px';

  for (const m of match) {
    const [src, file] = m;

    const dimensions = await getImageDimensions(file, 1400);

    const figure = `
<figure><div>
  <picture>
      <source srcset="${createSrcset(file, 'webp')}" sizes="${sizes}" type="image/webp">
      <source srcset="${createSrcset(file, 'webp')}" sizes="${sizes}">
      <img alt="" width="${dimensions.width}" height="${dimensions.height}" loading="lazy" role="presentation" src="/v1/resize:fit:1400/${file}">
  </picture></div>
</figure>
`;

    context = context.replace(src, figure);
  }
  return context;
}

router.get('/:article', async function (req, res) {
  const data = getData();

  if (!data.URIMap[req.params.article]) {
    res.status(404).send('Article not found');

    return;
  }

  const id = data.URIMap[req.params.article];
  const article = data.pages[id];

  article.date = formatDate(article.birthtimeMs);
  article.content = await replaceImages(article.content);

  const meta = Object.assign({}, data.siteMetadata, {
    title: data.siteMetadata.title,
    description: data.siteMetadata.description,
    published_time: formatISO(new Date(article.birthtimeMs)),
    modified_time: formatISO(new Date(article.mtimeMs)),
  });

  res.render('article', { meta, article });
});

export default router;
