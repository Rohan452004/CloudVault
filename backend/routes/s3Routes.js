const express = require('express');
const router = express.Router();
const { SelfManaged, 
    uploadFile, 
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
    getFolderZipShareUrl
} = require('../controllers/S3Controller');

const multer = require("multer");

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

router.post('/self-connect', SelfManaged);
// router.post("/upload", upload.single("file"), uploadFile);
router.post("/get-upload-url", getUploadUrl);
router.post("/list-files", listFiles);
router.post("/get-signed-url", getSignedUrl);
router.post("/create-folder", createFolder);
router.post("/delete", deleteFile);
router.post("/rename", renameFile);
router.post("/initiate-multipart-upload", initiateMultipartUpload);
router.post("/get-multipart-upload-urls", getMultipartUploadUrls);
router.post("/complete-multipart-upload", completeMultipartUpload);
router.post("/abort-multipart-upload", abortMultipartUpload);
router.post("/rename-folder", renameFolder);
router.post("/delete-folder", deleteFolder);
router.post("/download-folder-zip", downloadFolderZip);
router.post("/get-folder-zip-share-url", getFolderZipShareUrl);

module.exports = router;
