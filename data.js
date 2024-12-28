const path = require('node:path');
const fs = require('node:fs/promises');
const yaml = require('js-yaml');

const DATA_PATH = path.join(path.dirname("./"), 'data');
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

    const firstLine = content.indexOf('\n');
    const description = firstLine !== -1 ? content.substring(0, firstLine) : content;

    return { content, ...parsedAttributes, description: truncateDescription(description) }
}


async function getData() {
    const data = {
        pages: {},
        tags: {},
        siteMetadata,
    }

    const files = await fs.readdir(DATA_PATH)
    for (const file of files) {
        const filePath = path.join(DATA_PATH, file);
        const stats = await fs.stat(filePath)
        const title = removeFileExtension(file)

        const { tags, content, description } = await parseFileContent(filePath);


        data.pages[stats.ino] = {
            atimeMs: stats.atimeMs,
            mtimeMs: stats.mtimeMs,
            ctimeMs: stats.ctimeMs,
            title,
            uri: translit(title),
            tags,
            description,
            content,
        }

        tags.forEach(tag => {
            if (!data.tags[tag]) {
                data.tags[tag] = []
            }

            data.tags[tag].push(stats.ino)
        })
    }

    return data
}

let data;

(async () => {
    data = await getData();
})();

module.exports = () => data;
