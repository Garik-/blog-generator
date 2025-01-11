import getData from '../../data.js';
import { formatDate, capitalize } from '../format.js';
import { createTags } from '../tags.js';

export function getTagContent(params) {
  const data = getData();

  if (!data.tags[params.tag]) {
    throw new Error('Tag not found');
  }

  const stories = data.tags[params.tag].map((id) => {
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
      capitalize(params.tag) +
      '  by ' +
      data.siteMetadata.author.name,
  });

  const tags = createTags(data.tags, params.tag);

  return { meta, tags, stories, tag: capitalize(params.tag) };
}
