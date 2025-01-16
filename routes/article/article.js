import getData from '../../data.js';
import { formatDate, formatISO } from '../format.js';
import { createTag } from '../tags.js';
import { getImageDimensions } from '../api.js'; // TODO: циклическая зависимость надо вытащить их
import { addImage } from '../../images.js';
import { getStyles } from '../styles.js';

function createImageURL(file, size, format) {
  const formattedPath = format ? `format:${format}/` : '';
  const imageURL = `/v1/resize:fit:${size}/${formattedPath}${file}`;

  addImage(imageURL);
  return imageURL;
}

export function createSrcset(
  file,
  format = '',
  sizes = [640, 720, 750, 768, 828, 1100, 1400]
) {
  return sizes
    .map((size) => {
      return createImageURL(file, size, format) + ` ${size}w`;
    })
    .join(', ');
}

function replaceHr(context) {
  const regex = /<hr>/gm;
  return context.replace(
    regex,
    '<div class="separator"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>'
  );
}

function replaceHighlights(context) {
  const regex = /==(.*?)==/gm;
  const matches = context.match(regex);
  if (matches) {
    matches.forEach((match) => {
      const highlightedText = match.slice(2, -2); // Remove the '==' from both ends
      context = context.replace(match, `<mark>${highlightedText}</mark>`);
    });
  }
  return context;
}

async function replaceImages(context) {
  const regex = /<\p>!\[\[([^\]]+)\]\]\n?(.*?)<\/p>/gm;
  const match = context.matchAll(regex);
  const sizes =
    '(min-resolution: 4dppx) and (max-width: 700px) 50vw, (-webkit-min-device-pixel-ratio: 4) and (max-width: 700px) 50vw, (min-resolution: 3dppx) and (max-width: 700px) 67vw, (-webkit-min-device-pixel-ratio: 3) and (max-width: 700px) 65vw, (min-resolution: 2.5dppx) and (max-width: 700px) 80vw, (-webkit-min-device-pixel-ratio: 2.5) and (max-width: 700px) 80vw, (min-resolution: 2dppx) and (max-width: 700px) 100vw, (-webkit-min-device-pixel-ratio: 2) and (max-width: 700px) 100vw, 700px';

  for (const m of match) {
    const [src, file, caption] = m;

    const dimensions = await getImageDimensions(file, 1400);

    const figure = `
  <figure>
    <picture>
        <source srcset="${createSrcset(file, 'webp')}" sizes="${sizes}" type="image/webp">
        <source srcset="${createSrcset(file)}" sizes="${sizes}">
        <img alt="" width="${dimensions.width}" height="${dimensions.height}" loading="lazy" role="presentation" src="/v1/resize:fit:1400/${file}">
    </picture>
    ${caption ? `<figcaption>${caption}</figcaption>` : ''}
  </figure>
  `;

    addImage(`/v1/resize:fit:1400/${file}`);
    addImage(`/v1/resize:fit:1200/${file}`); // og image

    context = context.replace(src, figure);
  }
  return context;
}

export async function getArticleContent(params) {
  const data = getData();

  if (!data.URIMap[params.article]) {
    throw new Error('Article not found');
  }

  const id = data.URIMap[params.article];
  const article = { ...data.pages[id] }; // copy object

  article.date = formatDate(article.birthtimeMs);
  article.content = await replaceImages(article.content);
  article.content = replaceHr(article.content);
  article.content = replaceHighlights(article.content);

  if (article['tags'] && article.tags.length > 0) {
    article.tags = article.tags.map(createTag);
  }

  const meta = Object.assign({}, data.siteMetadata, {
    title: data.siteMetadata.title,
    description: data.siteMetadata.description,
    published_time: formatISO(new Date(article.birthtimeMs)),
    modified_time: formatISO(new Date(article.mtimeMs)),
  });

  const og = {
    title: article.title,
    description: article.description,
    url: meta.siteUrl + article.uri,
    site_name: meta.title,
    type: 'article',
  };

  const ld = {
    '@context': 'http://schema.org', //eslint-disable-line
    '@type': 'NewsArticle',
    url: og.url,
    dateCreated: meta.published_time,
    datePublished: meta.published_time,
    dateModified: meta.modified_time,
    headline: og.title,
    name: og.title,
    description: og.description,
    identifier: id,
    author: {
      '@type': 'Person',
      name: meta.author.name,
      url: meta.siteUrl,
    },
    creator: [meta.author.name],
    mainEntityOfPage: og.url,
  };

  if (article.image) {
    og.image = meta.siteUrl + 'v1/resize:fit:1200/' + article.image;
    ld.image = [meta.siteUrl + 'v1/resize:fit:1200/' + article.image];
  }

  return { meta, og, ld: JSON.stringify(ld), article, styles: getStyles() };
}
