import { translit } from '../data.js';

export function createTag(tag, selectedTag = '') {
  const uri = translit(tag);

  return {
    link: `/tag/${uri}.html`,
    name: tag,
    isSelected: tag === selectedTag,
  };
}

export function createTags(tags, selectedTag = '') {
  return Object.keys(tags)
    .sort((a, b) => tags[b].length - tags[a].length)
    .map((tag) => createTag(tag, selectedTag));
}
