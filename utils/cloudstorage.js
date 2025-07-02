// utils/cloudStorage.js
const { Storage } = require('@google-cloud/storage');

const storageConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
};

// Use Base64-encoded credentials if provided
if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
  try {
    storageConfig.credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CLOUD_CREDENTIALS, 'base64').toString('utf8'));
  } catch (err) {
    console.error('Error parsing GOOGLE_CLOUD_CREDENTIALS:', err);
  }
} else {
  console.error('GOOGLE_CLOUD_CREDENTIALS is not set');
}

const storage = new Storage(storageConfig);
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