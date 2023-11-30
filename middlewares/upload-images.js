const multer = require('multer');
const { v4: uuidv4 } = require("uuid");

const multerOpts = () => {
    // Handle file name and destination
    fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'images');
        },
        filename: (req, file, cb) => {
            cb(null, uuidv4() + '.' + file.mimetype.split('/')[1]);
        }
    })
    
    // Determine allowed images types
    fileFilter = (req, file, cb) => {
        if (
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/jpeg'
        ) {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }

    return multer({ storage: fileStorage, fileFilter: fileFilter });
}

// upload only one image
exports.uploadSingleImage = (fieldName) => multerOpts().single(fieldName);

// upload multible images 
exports.uploadMultibleImages = (fieldName) => multerOpts().array(fieldName);

