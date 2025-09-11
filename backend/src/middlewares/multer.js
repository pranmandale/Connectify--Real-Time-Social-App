import multer from "multer"

// we will store files in public folder and after uploading
// on cloudinary we ill delete those files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public')
    },
    filename :(req, file, cb) => {
        cb(null, file.originalname)
    }
});

export const upload = multer({storage});