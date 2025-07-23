const express = require('express');
const router = express.Router();
const {
    bulkDelete,
    bulkDownloadZip,
    bulkShareZip
}= require('../controllers/s3BulkController');

router.post('/bulk-delete', bulkDelete);
router.post('/bulk-download-zip', bulkDownloadZip);
router.post('/bulk-share-zip', bulkShareZip);

module.exports = router;
