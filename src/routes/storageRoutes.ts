import { Router } from 'express';
import { upload } from '@/config/multer';
import {
  uploadFile,
  getFileMetadata,
  downloadFile,
} from '@/controllers/storageController';

const router = Router();

// POST /api/v1/storage/upload -> Multer middleware upload.single('file') -> uploadFile
router.post('/upload', upload.single('file'), uploadFile);

// GET /api/v1/storage/:fileUuid/metadata -> getFileMetadata
router.get('/:fileUuid/metadata', getFileMetadata);

// GET /api/v1/storage/:fileUuid -> downloadFile
router.get('/:fileUuid', downloadFile);

export default router;
