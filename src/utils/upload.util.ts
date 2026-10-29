import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// إعداد بديل لـ __dirname لتوافقها مع نظام ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export const deleteFile = (relativeFilePath: string | null | undefined): void => {
    if (!relativeFilePath) return;
    
    const absolutePath = path.join(__dirname, '../..', relativeFilePath);
    
    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
};
