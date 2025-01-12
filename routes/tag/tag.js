import getData, { getTagByURI } from '../../data.js';
import { formatDate } from '../format.js';
import { createTags } from '../tags.js';

export function getTagContent(params) {
  const data = getData();
  const tag = getTagByURI(params.tag);

  if (!tag || !data.tags[tag]) {
    throw new Error('Tag not found');
  }

  const stories = data.tags[tag].map((id) => {
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
    title:
      'The most insightful stories about ' +
      tag +
      '  by ' +
      data.siteMetadata.author.name,
  });

  const tags = createTags(data.tags, tag);

  return { meta, tags, stories, tag };
}
