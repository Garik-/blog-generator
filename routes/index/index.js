import { createTags } from '../tags.js';
import { formatDate } from '../format.js';
import getData from '../../data.js';

export function getIndexContent() {
  const data = getData();

  const meta = Object.assign({}, data.siteMetadata, {
    title: data.siteMetadata.title,
    description: data.siteMetadata.description,
  });

  // Сортировка страниц по birthtimeMs в порядке убывания
  const sortedPages = Object.values(data.pages).sort(
    (a, b) => b.birthtimeMs - a.birthtimeMs
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

  const tags = createTags(data.tags);

  return { meta, items, tags };
}
