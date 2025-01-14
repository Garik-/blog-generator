import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export function getStyles() {
  const styles = require('../manifest.json');
  return Object.values(styles);
}
