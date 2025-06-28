// utils/cloudStorage.js
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: path.resolve(process.env.GOOGLE_CLOUD_KEYFILE_PATH),
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);

async function uploadFile(file) {
  const fileName = `${Date.now()}_${file.originalname}`;
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => reject(err));
    blobStream.on('finish', () => {
      resolve(fileName); // Return the filename
    });
    blobStream.end(file.buffer);
  });
}

async function deleteFile(fileName) {
  try {
    await bucket.file(fileName).delete();
    console.log(`File ${fileName} deleted from Google Cloud Storage.`);
  } catch (err) {
    console.error(`Error deleting file ${fileName}:`, err);
  }
}

module.exports = {
  uploadFile,
  deleteFile,
};