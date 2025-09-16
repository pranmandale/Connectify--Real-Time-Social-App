// import multer from "multer"

// // we will store files in public folder and after uploading
// // on cloudinary we ill delete those files
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public')
//     },
//     filename :(req, file, cb) => {
//         cb(null, file.originalname)
//     }
// });

// export const upload = multer({storage});





import multer from "multer";
import path from "path";
import fs from "fs";

// build the correct absolute path: src/public
const publicDir = path.resolve("src", "public");

// make sure the folder exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, publicDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });



