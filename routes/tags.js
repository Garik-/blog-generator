export function createTag(tag, selectedTag = '') {
  return {
    link: `/tag/${tag}`,
    name: tag.charAt(0).toUpperCase() + tag.slice(1),
    isSelected: tag === selectedTag,
  };
}

export function createTags(tags, selectedTag = '') {
  return Object.keys(tags)
    .sort((a, b) => tags[b].length - tags[a].length)
    .map((tag) => createTag(tag, selectedTag));
}
