import autoprefixer from 'autoprefixer';
import postcssNested from 'postcss-nested';
import postcssCombineMediaQuery from 'postcss-combine-media-query';

import postcss from 'postcss';

import CleanCss from 'clean-css';

const clean = (opts = {}) => {
  const cleancss = new CleanCss(opts);
  return {
    postcssPlugin: 'clean',
    Once(css, { result }) {
      return new Promise((resolve, reject) => {
        cleancss.minify(css.toString(), (err, min) => {
          if (err) {
            return reject(new Error(err.join('\n')));
          }

          for (const w of min.warnings) {
            result.warn(w);
          }

          result.root = postcss.parse(min.styles);
          resolve();
        });
      });
    },
  };
};

const pluginClean = clean();

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: [postcssCombineMediaQuery, autoprefixer, postcssNested, pluginClean],
};
