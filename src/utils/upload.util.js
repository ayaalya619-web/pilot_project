const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

const deleteFile = (relativeFilePath) => {
    if (!relativeFilePath) return;
    
    const absolutePath = path.join(__dirname, '../..', relativeFilePath);
    
    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
};

module.exports = {
    upload,
    deleteFile
};
