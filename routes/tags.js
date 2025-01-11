import { capitalize } from './format.js';

export function createTag(tag, selectedTag = '') {
  return {
    link: `/tag/${tag}.html`,
    name: capitalize(tag),
    isSelected: tag === selectedTag,
  };
}

export function createTags(tags, selectedTag = '') {
  return Object.keys(tags)
    .sort((a, b) => tags[b].length - tags[a].length)
    .map((tag) => createTag(tag, selectedTag));
}
