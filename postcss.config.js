import autoprefixer from 'autoprefixer';
import postcssNested from 'postcss-nested';
import postcssCombineMediaQuery from 'postcss-combine-media-query';

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: [postcssCombineMediaQuery, autoprefixer, postcssNested],
};
