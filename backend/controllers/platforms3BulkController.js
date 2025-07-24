const AWS = require('aws-sdk');
const archiver = require('archiver');
const stream = require('stream');

// --- Platform AWS Configuration (should be at the top of your file) ---
const accessKeyId = process.env.PLATFORM_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.PLATFORM_AWS_SECRET_ACCESS_KEY;
const region = process.env.PLATFORM_AWS_REGION;
const bucket = process.env.PLATFORM_S3_BUCKET;

// --- Helper Functions (should be at the top of your file) ---
function getUserPrefix(uid, subPrefix = '') {
    // Ensure the user's root folder path ends with a slash
    const userRoot = `users/${uid}/`;
    // Clean up the subPrefix to avoid double slashes
    const cleanedSubPrefix = (subPrefix || '').replace(/^\//, '');
    return userRoot + cleanedSubPrefix;
 }

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


// --- New Bulk Action Controllers ---

exports.bulkDelete = async (req, res) => {
  const { id } = req.params;
  const { keys } = req.body;
  if (!Array.isArray(keys) || keys.length === 0) {
    return res.status(400).json({ message: 'Missing "keys" parameter' });
  }

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    let toDelete = [];

    for (const key of keys) {
      const fullKey = getUserPrefix(id, key);
      if (key.endsWith('/')) {
        // Folder: list all objects under its full prefix
        const objects = await listAllObjects(s3, bucket, fullKey);
        toDelete = toDelete.concat(objects.map(obj => ({ Key: obj.Key })));
      } else {
        // File
        toDelete.push({ Key: fullKey });
      }
    }

    if (toDelete.length === 0) return res.status(200).json({ message: 'No objects found to delete.' });

    // S3 deleteObjects can handle up to 1000 keys at a time
    for (let i = 0; i < toDelete.length; i += 1000) {
      await s3.deleteObjects({
        Bucket: bucket,
        Delete: { Objects: toDelete.slice(i, i + 1000) }
      }).promise();
    }
    return res.status(200).json({ message: 'Bulk delete successful' });
  } catch (error) {
    console.error('S3 bulkDelete error:', error);
    return res.status(500).json({ message: 'Failed to bulk delete', error: error.message });
  }
};


exports.bulkDownloadZip = async (req, res) => {
  const { id } = req.params;
  const { keys } = req.body;
  if (!Array.isArray(keys) || keys.length === 0) {
    return res.status(400).json({ message: 'Missing "keys" parameter' });
  }

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="CloudVault-Selected.zip"');

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const key of keys) {
        const fullKey = getUserPrefix(id, key);
        if (key.endsWith('/')) { // It's a folder
            const objects = await listAllObjects(s3, bucket, fullKey);
            for(const obj of objects) {
                if (obj.Key.endsWith('/')) continue;
                const s3Stream = s3.getObject({ Bucket: bucket, Key: obj.Key }).createReadStream();
                const relativePath = obj.Key.replace(getUserPrefix(id), '');
                archive.append(s3Stream, { name: relativePath });
            }
        } else { // It's a file
            const s3Stream = s3.getObject({ Bucket: bucket, Key: fullKey }).createReadStream();
            archive.append(s3Stream, { name: key });
        }
    }
    archive.finalize();
  } catch (error) {
    console.error('S3 bulkDownloadZip error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to download bulk zip', error: error.message });
    }
  }
};


exports.bulkShareZip = async (req, res) => {
    const { id } = req.params;
    const { keys, expires = 3600 } = req.body;
    if (!Array.isArray(keys) || keys.length === 0) {
        return res.status(400).json({ message: 'Missing "keys" parameter' });
    }

    try {
        const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
        const pass = new stream.PassThrough();
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        archive.pipe(pass);

        for (const key of keys) {
            const fullKey = getUserPrefix(id, key);
            if (key.endsWith('/')) { // It's a folder
                const objects = await listAllObjects(s3, bucket, fullKey);
                for(const obj of objects) {
                    if (obj.Key.endsWith('/')) continue;
                    const s3Stream = s3.getObject({ Bucket: bucket, Key: obj.Key }).createReadStream();
                    const relativePath = obj.Key.replace(getUserPrefix(id), '');
                    archive.append(s3Stream, { name: relativePath });
                }
            } else { // It's a file
                const s3Stream = s3.getObject({ Bucket: bucket, Key: fullKey }).createReadStream();
                archive.append(s3Stream, { name: key });
            }
        }
        archive.finalize();

        const zipKey = `shared-zips/Selection-${id}-${Date.now()}.zip`;
        await s3.upload({ Bucket: bucket, Key: zipKey, Body: pass }).promise();
        
        const url = s3.getSignedUrl('getObject', { Bucket: bucket, Key: zipKey, Expires: parseInt(expires) });
        
        return res.json({ url });
    } catch (error) {
        console.error('S3 bulkShareZip error:', error);
        return res.status(500).json({ message: 'Failed to generate bulk share link', error: error.message });
    }
};