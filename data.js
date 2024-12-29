import { fileURLToPath } from 'url';
import path from 'path';
import { promises as fs } from 'fs';
import yaml from 'js-yaml';

import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkGfm from 'remark-gfm'
import remarkPrism from 'remark-prism';
import { unified } from 'unified'
import rehypeHighlight from 'rehype-highlight'



// Получение __dirname в ES6 модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.join(__dirname, 'data');
const DESCRIPTION_MAX_LENGTH = 150;

const siteMetadata = {
    title: 'Igor Riakhovskii',
    author: {
        name: `Igor Riakhovskii`,
        summary: `who lives and works in San Francisco building useful things.`,
    },
    description: `A starter blog demonstrating what Gatsby can do.`,
    siteUrl: `https://gatsbystarterblogsource.gatsbyjs.io/`,
    social: {
        twitter: `kylemathews`,
    },
}

/*
https://yandex.ru/support/webmaster/open-graph/
og type =  article
article:published_time (datetime) — дата публикации статьи.
article:modified_time ( datetime) — дата последнего изменения статьи.
article:expiration_time (datetime) — дата, после которой статья считается устаревшей.
article:author (profile, массив) — автор статьи.
article:section (string)— тема (раздел), к которой относится статья (например, Технологии).
article:tag (string, массив) — теги (слова, фразы), связанные с этой статьей.

*/


function translit(word) {
    var converter = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
        'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i',
        'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
        'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch',
        'ш': 'sh', 'щ': 'sch', 'ь': '', 'ы': 'y', 'ъ': '',
        'э': 'e', 'ю': 'yu', 'я': 'ya'
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

    answer = answer.replace(/[^-0-9a-z]/g, '-');
    answer = answer.replace(/[-]+/g, '-');
    answer = answer.replace(/^\-|-$/g, '');
    return answer;
}

function removeFileExtension(filename) {
    return filename.replace(/\.[^/.]+$/, "");
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
        if (trimmedLine && !trimmedLine.startsWith('![[')) {
            return trimmedLine;
        }
    }
    return str;
}

async function parseFileContent(filePath) {
    const data = await fs.readFile(filePath, { encoding: 'utf8' });
    const attributesRegex = /---\n([\s\S]*?)\n---/m;

    let content = data
    let parsedAttributes = {}

    const attributes = data.match(attributesRegex);
    if (attributes) {
        content = data.replace(attributes[0], '').trim();
        parsedAttributes = yaml.load(attributes[1]);
    }

    const description = extractDescription(content)
    const image = extractFileFromTemplate(content)

    return {
        ...parsedAttributes,
        content,
        description: truncateDescription(description),
        image
    }
}

const remark = unified()
    .use(remarkParse)
    .use(remarkGfm)
    // .use(remarkPrism)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeHighlight)

    .use(rehypeStringify)

async function getData() {
    const data = {
        pages: {},
        tags: {},
        URIMap: {},
        siteMetadata,
    }

    const files = await fs.readdir(DATA_PATH)
    for (const file of files) {
        const filePath = path.join(DATA_PATH, file);
        const stats = await fs.stat(filePath)
        const title = removeFileExtension(file)

        const uri = translit(title);
        if (data.URIMap[uri]) {
            throw new Error(`Duplicate URI: ${uri}`)
        }

        data.URIMap[uri] = stats.ino;

        const { tags, content, description, image } = await parseFileContent(filePath);

        const html = await remark.process(content)

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
        }

        if (tags) {
            tags.forEach(tag => {
                if (!data.tags[tag]) {
                    data.tags[tag] = []
                }

                data.tags[tag].push(stats.ino)
            })
        }
    }

    console.log(data)

    return data
}

let data;

(async () => {
    data = await getData();
})();

export default () => data;
