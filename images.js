let imageURLs;

export function addImage(url) {
  if (!imageURLs) {
    imageURLs = new Set();
    console.log('--- CREATE images imageURLs');
  }
  imageURLs.add(url);
}

export function getImages() {
  return imageURLs;
}
