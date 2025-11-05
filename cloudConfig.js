const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = (buffer, folder = 'wanderlust_DEV') => {
  return new Promise((resolve, reject) => {
    if (!buffer) return resolve(null);

    const stream = cloudinary.uploader.upload_stream({ folder },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );

    // Safety timeout (prevents hanging)
    const timeout = setTimeout(() => {
      reject(new Error("Cloudinary upload timed out"));
    }, 15000); // 15s

    stream.on("finish", () => clearTimeout(timeout));
    stream.on("error", err => {
      clearTimeout(timeout);
      reject(err);
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
};


module.exports = { cloudinary, upload, uploadToCloudinary };
