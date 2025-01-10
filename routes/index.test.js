import { createSrcset } from './index.js';

describe('createSrcset', () => {
  it('should generate srcset with default sizes and no format', () => {
    const file = 'image.jpg';
    const expected = [
      '/v1/resize:fit:640/image.jpg 640w',
      '/v1/resize:fit:720/image.jpg 720w',
      '/v1/resize:fit:750/image.jpg 750w',
      '/v1/resize:fit:768/image.jpg 768w',
      '/v1/resize:fit:828/image.jpg 828w',
      '/v1/resize:fit:1100/image.jpg 1100w',
      '/v1/resize:fit:1400/image.jpg 1400w',
    ].join(', ');

    const result = createSrcset(file);
    expect(result).toBe(expected);
  });

  it('should generate srcset with custom sizes and no format', () => {
    const file = 'image.jpg';
    const sizes = [300, 600, 900];
    const expected = [
      '/v1/resize:fit:300/image.jpg 300w',
      '/v1/resize:fit:600/image.jpg 600w',
      '/v1/resize:fit:900/image.jpg 900w',
    ].join(', ');

    const result = createSrcset(file, '', sizes);
    expect(result).toBe(expected);
  });

  it('should generate srcset with default sizes and webp format', () => {
    const file = 'image.jpg';
    const format = 'webp';
    const expected = [
      '/v1/resize:fit:640/format:webp/image.jpg 640w',
      '/v1/resize:fit:720/format:webp/image.jpg 720w',
      '/v1/resize:fit:750/format:webp/image.jpg 750w',
      '/v1/resize:fit:768/format:webp/image.jpg 768w',
      '/v1/resize:fit:828/format:webp/image.jpg 828w',
      '/v1/resize:fit:1100/format:webp/image.jpg 1100w',
      '/v1/resize:fit:1400/format:webp/image.jpg 1400w',
    ].join(', ');

    const result = createSrcset(file, format);
    expect(result).toBe(expected);
  });

  it('should generate srcset with custom sizes and webp format', () => {
    const file = 'image.jpg';
    const format = 'webp';
    const sizes = [300, 600, 900];
    const expected = [
      '/v1/resize:fit:300/format:webp/image.jpg 300w',
      '/v1/resize:fit:600/format:webp/image.jpg 600w',
      '/v1/resize:fit:900/format:webp/image.jpg 900w',
    ].join(', ');

    const result = createSrcset(file, format, sizes);
    expect(result).toBe(expected);
  });
});
