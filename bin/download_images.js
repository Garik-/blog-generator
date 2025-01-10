import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'http://localhost:3000/v1/images';
const LOCAL_DIR = path.resolve(__dirname, '../');
const DIST_DIR = path.join(LOCAL_DIR, 'dist');

function exitOnError(message) {
  console.error(`Ошибка: ${message}`);
  process.exit(1);
}

function downloadFile(fileUrl, dest, callback) {
  const request = http.get(fileUrl, (response) => {
    if (response.statusCode !== 200) {
      callback(`Download error: ${response.statusCode}`);
      return;
    }

    const fileStream = fs.createWriteStream(dest);
    response.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close(callback);
    });
  });

  request.on('error', (err) => {
    fs.unlink(dest, () => callback(err.message));
  });
}

function downloadImagesList(targetUrl, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  http.get(targetUrl, (response) => {
    if (response.statusCode !== 200) {
      exitOnError(`Download error: ${response.statusCode}`);
    }

    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      const lines = data.split('\n').filter(line => line.trim() !== '');
      lines.forEach((line) => {
        const fileUrl = url.resolve(targetUrl, line);
        const filePath = path.join(destDir, line);

        const fileDir = path.dirname(filePath);
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }

        downloadFile(fileUrl, filePath, (err) => {
          if (err) {
            console.error(`Error downloading ${fileUrl}: ${err}`);
          } else {
            console.log(`Downloaded ${fileUrl} to ${filePath}`);
          }
        });
      });
    });
  }).on('error', (err) => {
    exitOnError(err.message);
  });
}

console.log(`Downloading images list from ${TARGET_URL} to ${DIST_DIR}`);
downloadImagesList(TARGET_URL, DIST_DIR);