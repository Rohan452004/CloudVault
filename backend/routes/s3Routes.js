const express = require('express');
const router = express.Router();
const { SelfManaged, uploadFile, listFiles, getSignedUrl, createFolder } = require('../controllers/S3Controller');

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/self-connect', SelfManaged);
router.post("/upload", upload.single("file"), uploadFile);
router.post("/list-files", listFiles);
router.post("/get-signed-url", getSignedUrl);
router.post("/create-folder", createFolder);

module.exports = router;
