import express from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import sharp from "sharp";
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
}

function resizeHandler(imagesPath) {
    return async (req, res) => {
        const { params, image } = req.params;
        const [type, width, height] = params.split(':').slice(1);
        const parsedParams = {
            type,
            width: parseInt(width, 10),
            height: parseInt(height, 10),
            image
        };

        const inputPath = path.join(imagesPath, parsedParams.image);

        try {
            await fs.access(inputPath);

            const image = await sharp(inputPath)
                .resize(parsedParams.width, parsedParams.height, {
                    fit: sharp.fit.cover,
                    position: sharp.strategy.entropy
                })

            const { format } = await image.metadata();
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
    }
}

const publicImagesHandler = resizeHandler(PUBLIC_IMAGES_PATH);
const imagesHandler = resizeHandler(IMAGES_PATH);

router.get('/resize:params/public/:image', publicImagesHandler);
router.get('/resize:params/:image', imagesHandler);

export default router;