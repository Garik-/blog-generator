import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_IMAGES_PATH = path.join(__dirname, '../public/images');
const IMAGES_PATH = path.join(__dirname, '../images');

const mimeType = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

export async function getImageDimensions(file, maxWidth = 0) {
  try {
    const image = sharp(path.join(IMAGES_PATH, file));
    const metadata = await image.metadata();

    const dimensions = {
      width: metadata.width,
      height: metadata.height,
    };

    if (maxWidth === 0 || dimensions.width < maxWidth) {
      return dimensions;
    }

    const aspectRatio = dimensions.height / dimensions.width;
    dimensions.width = maxWidth;
    dimensions.height = Math.round(maxWidth * aspectRatio);

    return dimensions;
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    throw error;
  }
}

function resizeHandler(imagesPath) {
  return async (req, res) => {
    const { params, image } = req.params;
    const [type, width, height] = params.split(':').slice(1);

    switch (type) {
      case 'fill':
      case 'fit':
        break;

      default:
        return res.status(400).send('Invalid resize type');
    }

    let format = req.params.format ? req.params.format.substring(1) : null;
    const parsedParams = {
      type,
      width: parseInt(width, 10) || null,
      height: parseInt(height, 10) || null,
      image,
      format,
    };

    const inputPath = path.join(imagesPath, parsedParams.image);

    try {
      await fs.access(inputPath);

      let image = sharp(inputPath);

      switch (type) {
        case 'fill':
          image = image.resize(parsedParams.width, parsedParams.height, {
            fit: sharp.fit.cover,
            position: sharp.strategy.entropy,
          });
          break;
        case 'fit':
          image = image.resize(parsedParams.width, parsedParams.height, {
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          });
          break;
      }

      if (!format) {
        const metadata = await image.metadata();
        format = metadata.format;
      } else {
        image = image.toFormat(format);
      }

      const buffer = await image.toBuffer();

      res.type(mimeType[format]);
      res.send(buffer);
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.status(404).send('File not found');
      } else {
        res.status(500).send('Error processing image');
      }
    }
  };
}

const imageURLs = new Set()

export function addImageURL(url) {
  imageURLs.add(url)
}

const publicImagesHandler = resizeHandler(PUBLIC_IMAGES_PATH);
const imagesHandler = resizeHandler(IMAGES_PATH);

router.get('/resize:params/public/:image', publicImagesHandler);
router.get('/resize:params/:image', imagesHandler);
router.get('/resize:params/format:format/:image', imagesHandler);

router.get('/images', (req, res) => {
  res.type('text/plain');
  imageURLs.forEach(url => {
    res.write(url + "\n")
  });
  res.end()
})


export default router;
