import getData from '../../data.js';
import { formatDate } from '../format.js';
import { createTags } from '../tags.js';

export function getTagContent(params) {
  const data = getData();

  if (!data.tags[params.tag]) {
    throw new Error('Tag not found');
  }

  const pages = data.tags[params.tag].map((id) => {
    const page = data.pages[id];
    return {
      title: page.title,
      uri: page.uri,
      description: page.description,
      tags: page.tags,
      date: formatDate(page.birthtimeMs),
      image: page.image,
    };
  });

  const meta = Object.assign({}, data.siteMetadata, {
    title: params.tag,
  });

  const tags = createTags(data.tags, params.tag);

  return { meta, tags, pages };
}
