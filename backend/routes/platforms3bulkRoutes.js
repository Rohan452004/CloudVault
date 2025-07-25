const express = require('express');
const router = express.Router();
const {
    bulkDelete,
    bulkDownloadZip,
    bulkShareZip
}= require('../controllers/platforms3BulkController');

router.post('/:id/bulk-delete', bulkDelete);
router.post('/:id/bulk-download-zip', bulkDownloadZip);
router.post('/:id/bulk-share-zip', bulkShareZip);

module.exports = router;
