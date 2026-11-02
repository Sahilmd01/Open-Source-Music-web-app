import multer from 'multer';

const maxFileSizeMb = parseInt(process.env.MAX_FILE_SIZE_MB || '20', 10);

// Use multer.memoryStorage() so file buffers are kept in RAM (req.file.buffer) and NOT written to disk.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
  },
});

export const MAX_FILE_SIZE_MB = maxFileSizeMb;
