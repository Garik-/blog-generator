import { createTags } from '../tags.js';
import { formatDate } from '../format.js';
import getData from '../../data.js';
import { getStyles } from '../styles.js';

export function getIndexContent() {
  const data = getData();

  const meta = Object.assign({}, data.siteMetadata, {
    title: data.siteMetadata.title,
    description: data.siteMetadata.description,
  });

  // Сортировка страниц по birthtimeMs в порядке убывания
  const sortedPages = Object.values(data.pages)
    .sort((a, b) => b.birthtimeMs - a.birthtimeMs)
    .sort((x, y) => {
      // eslint-disable-next-line sonarjs/no-nested-conditional
      return x.pinned === y.pinned ? 0 : x.pinned ? -1 : 1;
    });

  const styles = getStyles();

  const items = sortedPages.map((page) => {
    return {
      title: page.title,
      uri: page.uri,
      description: page.description,
      tags: page.tags,
      date: formatDate(page.birthtimeMs),
      image: page.image,
      pinned: page.pinned,
    };
  });

  const tags = createTags(data.tags).slice(0, 7);

  return { meta, items, tags, styles };
}
