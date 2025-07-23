const AWS = require('aws-sdk');
const archiver = require('archiver');
const stream = require('stream');

// Helper: Recursively list all objects under a prefix
async function listAllObjects(s3, bucket, prefix) {
  let objects = [];
  let ContinuationToken;
  do {
    const params = { Bucket: bucket, Prefix: prefix };
    if (ContinuationToken) params.ContinuationToken = ContinuationToken;
    const res = await s3.listObjectsV2(params).promise();
    if (res.Contents) objects = objects.concat(res.Contents);
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : null;
  } while (ContinuationToken);
  return objects;
}

// 1. Bulk Delete
exports.bulkDelete = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, keys } = req.body;
  if (!accessKeyId || !secretAccessKey || !bucket || !region || !Array.isArray(keys)) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }
  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    let toDelete = [];
    for (const key of keys) {
      if (key.endsWith('/')) {
        // Folder: list all objects under prefix
        const objects = await listAllObjects(s3, bucket, key);
        toDelete = toDelete.concat(objects.map(obj => ({ Key: obj.Key })));
      } else {
        toDelete.push({ Key: key });
      }
    }
    if (toDelete.length === 0) {
      return res.status(404).json({ message: 'No objects found to delete' });
    }
    // S3 deleteObjects max 1000 per call
    for (let i = 0; i < toDelete.length; i += 1000) {
      await s3.deleteObjects({
        Bucket: bucket,
        Delete: { Objects: toDelete.slice(i, i + 1000) }
      }).promise();
    }
    return res.status(200).json({ message: 'Bulk delete successful', deleted: toDelete.length });
  } catch (error) {
    console.error('S3 bulkDelete error:', error);
    return res.status(500).json({ message: 'Failed to bulk delete', error: error.message });
  }
};

// Helper: Add file or folder to zip
async function addToZip(s3, bucket, key, archive) {
  if (key.endsWith('/')) {
    // Folder: list all objects
    const objects = await listAllObjects(s3, bucket, key);
    for (const obj of objects) {
      if (obj.Key.endsWith('/')) continue;
      const s3Stream = s3.getObject({ Bucket: bucket, Key: obj.Key }).createReadStream();
      const relPath = obj.Key.replace(key, '');
      archive.append(s3Stream, { name: key.replace(/\/$/, '') + '/' + relPath });
    }
  } else {
    // File
    const s3Stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream();
    archive.append(s3Stream, { name: key.split('/').pop() });
  }
}

// 2. Bulk Download as ZIP (streams zip to response)
exports.bulkDownloadZip = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, keys } = req.body;
  if (!accessKeyId || !secretAccessKey || !bucket || !region || !Array.isArray(keys)) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }
  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="CloudVault-Selected.zip"');
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    for (const key of keys) {
      await addToZip(s3, bucket, key, archive);
    }
    archive.finalize();
  } catch (error) {
    console.error('S3 bulkDownloadZip error:', error);
    return res.status(500).json({ message: 'Failed to download bulk zip', error: error.message });
  }
};

// 3. Bulk Share as ZIP (uploads zip to S3 and returns signed URL)
exports.bulkShareZip = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, keys, expires = 60 * 60 } = req.body;
  if (!accessKeyId || !secretAccessKey || !bucket || !region || !Array.isArray(keys)) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }
  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    const pass = new stream.PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(pass);
    for (const key of keys) {
      await addToZip(s3, bucket, key, archive);
    }
    archive.finalize();
    // Upload the zip to S3
    const zipKey = `shared-zips/CloudVault-Selected-${Date.now()}.zip`;
    await s3.upload({
      Bucket: bucket,
      Key: zipKey,
      Body: pass,
      ContentType: 'application/zip',
      ACL: 'private',
    }).promise();
    // Generate a pre-signed URL for the uploaded zip
    const url = s3.getSignedUrl('getObject', {
      Bucket: bucket,
      Key: zipKey,
      Expires: expires,
    });
    return res.json({ url });
  } catch (error) {
    console.error('S3 bulkShareZip error:', error);
    return res.status(500).json({ message: 'Failed to generate bulk share zip', error: error.message });
  }
}; 