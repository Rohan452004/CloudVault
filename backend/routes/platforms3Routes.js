const express = require('express');
const router = express.Router();
const { 
    listFiles, 
    getSignedUrl, 
    createFolder, 
    deleteFile, 
    renameFile, 
    getUploadUrl,
    initiateMultipartUpload,
    getMultipartUploadUrls,
    completeMultipartUpload,
    abortMultipartUpload,
    renameFolder,
    deleteFolder,
    downloadFolderZip,
    getFolderZipShareUrl,
} = require('../controllers/platforms3Controller');

// All routes are now prefixed with /:id to identify the user

router.post("/:id/get-upload-url", getUploadUrl);
router.post("/:id/list-files", listFiles);
router.post("/:id/get-signed-url", getSignedUrl);
router.post("/:id/create-folder", createFolder);
router.post("/:id/delete", deleteFile);
router.post("/:id/rename", renameFile);
router.post("/:id/rename-folder", renameFolder);
router.post("/:id/delete-folder", deleteFolder);
router.post("/:id/download-folder-zip", downloadFolderZip);
router.post("/:id/get-folder-zip-share-url", getFolderZipShareUrl);

// Multipart Upload Routes
router.post("/:id/initiate-multipart-upload", initiateMultipartUpload);
router.post("/:id/get-multipart-upload-urls", getMultipartUploadUrls);
router.post("/:id/complete-multipart-upload", completeMultipartUpload);
router.post("/:id/abort-multipart-upload", abortMultipartUpload);

module.exports = router;