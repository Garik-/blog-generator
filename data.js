import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import yaml from 'js-yaml';

import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkGfm from 'remark-gfm';
import { unified } from 'unified';
import rehypeHighlight from 'rehype-highlight';
import readingTime from 'reading-time';
import strip from 'strip-markdown';
import rehypeExternalLinks from 'rehype-external-links';
import { remark } from 'remark';

// Получение __dirname в ES6 модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, 'data');
const DESCRIPTION_MAX_LENGTH = 150;

const siteMetadata = {
  title: 'Igor Riakhovskii',
  author: {
    name: 'Igor Riakhovskii',
    summary:
      'In commercial development since 2005. At the moment, I am engaged in product development of cloud systems in the role of Technical Lead',
    firstName: 'Igor',
    lastName: 'Riakhovskii',
    username: 'garikdjan',
  },
  description: 'My thoughts notes and publications are collected here',
  siteUrl: 'https://gariktalksabout.tech/',
  social: {
    telegram: 'https://telegram.me/garikdjan',
    github: 'https://github.com/Garik-',
    habr: 'https://habr.com/ru/users/Gariks/',
    linkedin: 'https://www.linkedin.com/in/igor-riakhovskii-459b96196/',
  },
};

export function translit(word) {
  var converter = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'c',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ь: '',
    ы: 'y',
    ъ: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  };

  word = word.toLowerCase();

  var answer = '';
  for (var i = 0; i < word.length; ++i) {
    if (converter[word[i]] == undefined) {
      answer += word[i];
    } else {
      answer += converter[word[i]];
    }
  }

  answer = answer.replace(/[^0-9a-z-]/g, '-');
  answer = answer.replace(/-+/g, '-');
  answer = answer.replace(/(^-)|(-$)/g, '');
  return answer;
}

export function removeFileExtension(filename) {
  return filename.replace(/\.[^/.]+$/, '');
}

function truncateDescription(description, maxLength = DESCRIPTION_MAX_LENGTH) {
  if (description.length <= maxLength) {
    return description;
  }

  let truncated = description.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > 0) {
    truncated = truncated.substring(0, lastSpaceIndex);
  }

  return truncated + '...';
}

function extractFileFromTemplate(str) {
  const regex = /!\[\[([^\]]+)\]\]/m;
  const match = str.match(regex);
  if (match) {
    return match[1];
  }
  return null;
}

function extractDescription(str) {
  const lines = str.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (
      trimmedLine &&
      !trimmedLine.startsWith('![[') &&
      !trimmedLine.startsWith('#')
    ) {
      return trimmedLine;
    }
  }
  return str;
}

const markdown = unified()
  .use(remarkParse)
  .use(remarkGfm)
  // .use(remarkPrism)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeSlug)
  .use(rehypeExternalLinks, {
    rel: ['noopener', 'ugc', 'nofollow'],
    target: '_blank',
  })
  .use(rehypeHighlight)
  .use(rehypeStringify);

const markdownStrip = remark().use(strip);

async function parseFileContent(filePath) {
  const data = await fs.readFile(filePath, { encoding: 'utf8' });
  const attributesRegex = /---\n([\s\S]*?)\n---/m;

  let content = data;
  let parsedAttributes = {};

  const attributes = data.match(attributesRegex);
  if (attributes) {
    content = data.replace(attributes[0], '').trim();
    parsedAttributes = yaml.load(attributes[1]);
  }

  let description = extractDescription(content);
  description = await markdownStrip.process(description); //remove markdown formatting
  description = truncateDescription(String(description));

  const image = extractFileFromTemplate(content);

  return {
    ...parsedAttributes,
    content,
    description,
    image,
  };
}

async function getData() {
  const data = {
    pages: {},
    tags: {},
    URIMap: {},
    tagsURIMap: {},
    siteMetadata,
  };

  const files = await fs.readdir(DATA_PATH);
  for (const file of files) {
    const filePath = path.join(DATA_PATH, file);
    const stats = await fs.stat(filePath);
    const title = removeFileExtension(file);

    const { tags, content, description, image, url, pinned } =
      await parseFileContent(filePath);

    const uri = translit(url || title) + '.html';
    if (data.URIMap[uri]) {
      throw new Error(`Duplicate URI: ${uri}`);
    }

    data.URIMap[uri] = stats.ino;

    const readingStats = readingTime(content);
    const html = await markdown.process(content);

    data.pages[stats.ino] = {
      atimeMs: stats.atimeMs, // время последнего доступа к файлу в миллисекундах
      mtimeMs: stats.mtimeMs, // время последнего изменения содержимого файла в миллисекундах
      ctimeMs: stats.ctimeMs, // время последнего изменения метаданных файла
      birthtimeMs: stats.birthtimeMs, // время создания файла
      title,
      uri,
      tags,
      description,
      content: String(html),
      image,
      readingStats,
      pinned: !!pinned,
    };

    if (tags) {
      tags.forEach((tag) => {
        data.tagsURIMap[translit(tag)] = tag;

        if (!data.tags[tag]) {
          data.tags[tag] = [];
        }

        data.tags[tag].push(stats.ino);
      });
    }
  }

  return data;
}

let data;

(async () => {
  data = await getData();
})();

export function getTagByURI(uri) {
  return data.tagsURIMap[uri] || '';
}

export default () => data;
