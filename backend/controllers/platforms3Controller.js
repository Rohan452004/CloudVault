const AWS = require('aws-sdk');
const archiver = require('archiver');

// --- Platform AWS Configuration ---
// Credentials and bucket info are loaded from environment variables
const accessKeyId = process.env.PLATFORM_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.PLATFORM_AWS_SECRET_ACCESS_KEY;
const region = process.env.PLATFORM_AWS_REGION;
const bucket = process.env.PLATFORM_S3_BUCKET;

// --- Helper Function ---
/**
 * Generates the full S3 prefix for a specific user.
 * @param {string} uid - The user's unique ID.
 * @param {string} [subPrefix=''] - The path inside the user's directory.
 * @returns {string} The full S3 key prefix (e.g., "users/123/documents/").
 */
function getUserPrefix(uid, subPrefix = '') {
   // Ensure the user's root folder path ends with a slash
   const userRoot = `users/${uid}/`;
   // Clean up the subPrefix to avoid double slashes
   const cleanedSubPrefix = (subPrefix || '').replace(/^\//, '');
   return userRoot + cleanedSubPrefix;
}

// --- Controller Functions ---

/**
 * @description List files and folders for a specific user.
 * @route POST /api/platform/files/:id/list
 */
exports.listFiles = async (req, res) => {
  const { id } = req.params;
  const { prefix = '' } = req.body;
  const fullPrefix = getUserPrefix(id, prefix);

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    const params = { Bucket: bucket, Prefix: fullPrefix, Delimiter: '/' };
    const result = await s3.listObjectsV2(params).promise();
    
    const files = [];
    const folders = new Set();

    // Add folders (CommonPrefixes)
    if (result.CommonPrefixes) {
      result.CommonPrefixes.forEach(commonPrefix => {
        // Extract just the folder name from the full S3 path
        const folderName = commonPrefix.Prefix.replace(fullPrefix, '').replace('/', '');
        if (folderName) {
          folders.add(folderName);
        }
      });
    }

    // Add files
    if (result.Contents) {
      result.Contents.forEach(item => {
        if (item.Key === fullPrefix) return; // Skip the folder placeholder itself
        const fileName = item.Key.replace(fullPrefix, '');
        if (fileName.includes('/')) return; // Item is in a deeper subfolder, ignore
        if (!fileName) return; // Skip empty filenames

        files.push({
          id: item.Key,
          name: fileName,
          type: 'file',
          size: item.Size,
          lastModified: item.LastModified,
          key: item.Key.replace(getUserPrefix(id), ''), // Return key relative to user's root
        });
      });
    }

    const folderArray = Array.from(folders).map(folderName => ({
      id: fullPrefix + folderName + '/',
      name: folderName,
      type: 'folder',
      key: prefix + folderName + '/', // Return key relative to user's root
    }));

    const allItems = [...folderArray, ...files].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    return res.status(200).json({ files: allItems, currentPath: prefix });
  } catch (error) {
    console.error('S3 list files error:', error);
    return res.status(500).json({ message: 'Failed to list files from S3', error: error.message });
  }
};

/**
 * @description Get a pre-signed URL to download a user's file.
 * @route POST /api/platform/files/:id/get-url
 */
exports.getSignedUrl = async (req, res) => {
  const { id } = req.params;
  const { key, expires } = req.body;
  if (!key) return res.status(400).json({ message: 'Missing file key' });

  const fullKey = getUserPrefix(id, key);

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region, signatureVersion: 'v4' });
    const params = { Bucket: bucket, Key: fullKey, Expires: expires || 60 * 5 };
    const url = await s3.getSignedUrlPromise('getObject', params);
    return res.status(200).json({ url });
  } catch (error) {
    console.error('S3 getSignedUrl error:', error);
    return res.status(500).json({ message: 'Failed to generate signed URL', error: error.message });
  }
};

/**
 * @description Create a new folder for a user.
 * @route POST /api/platform/files/:id/create-folder
 */
exports.createFolder = async (req, res) => {
  const { id } = req.params;
  const { folderPath } = req.body;
  if (!folderPath) return res.status(400).json({ message: 'Missing folder path' });

  // Ensure folderPath ends with /
  const key = folderPath.endsWith('/') ? folderPath : folderPath + '/';
  const fullKey = getUserPrefix(id, key);

//   console.log("key", key);
//   console.log("fullKey", fullKey);

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    await s3.putObject({ Bucket: bucket, Key: fullKey, Body: '' }).promise();
    return res.status(200).json({ message: 'Folder created successfully', key: fullKey });
  } catch (error) {
    console.error('S3 create folder error:', error);
    return res.status(500).json({ message: 'Failed to create folder in S3', error: error.message });
  }
};

/**
 * @description Delete a user's file.
 * @route DELETE /api/platform/files/:id/delete-file
 */
exports.deleteFile = async (req, res) => {
  const { id } = req.params;
  const { key } = req.body;
  if (!key) return res.status(400).json({ message: 'Missing key' });

  const fullKey = getUserPrefix(id, key);

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    await s3.deleteObject({ Bucket: bucket, Key: fullKey }).promise();
    return res.status(200).json({ message: 'File deleted successfully', key: fullKey });
  } catch (error) {
    console.error('S3 delete error:', error);
    return res.status(500).json({ message: 'Failed to delete file from S3', error: error.message });
  }
};

/**
 * @description Rename a user's file.
 * @route POST /api/platform/files/:id/rename-file
 */
exports.renameFile = async (req, res) => {
  const { id } = req.params;
  const { oldKey, newKey } = req.body;
  if (!oldKey || !newKey) return res.status(400).json({ message: 'Missing oldKey or newKey' });

  const fullOldKey = getUserPrefix(id, oldKey);
  const fullNewKey = getUserPrefix(id, newKey);

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    await s3.copyObject({
      Bucket: bucket,
      CopySource: `/${bucket}/${encodeURIComponent(fullOldKey).replace(/%2F/g, '/')}`,
      Key: fullNewKey,
    }).promise();
    await s3.deleteObject({ Bucket: bucket, Key: fullOldKey }).promise();
    return res.status(200).json({ message: 'File renamed successfully', oldKey, newKey });
  } catch (error) {
    console.error('S3 rename error:', error);
    return res.status(500).json({ message: 'Failed to rename file in S3', error: error.message });
  }
};

/**
 * @description Get a pre-signed URL to upload a file to a user's directory.
 * @route POST /api/platform/files/:id/get-upload-url
 */
exports.getUploadUrl = async (req, res) => {
  const { id } = req.params;
  const { key, contentType } = req.body;
  if (!key) return res.status(400).json({ message: 'Missing file key' });
  
  const fullKey = getUserPrefix(id, key);

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region, signatureVersion: 'v4' });
    const params = {
      Bucket: bucket,
      Key: fullKey,
      Expires: 60 * 10, // 10 minutes
      ContentType: contentType || 'application/octet-stream',
    };
    const url = await s3.getSignedUrlPromise('putObject', params);
    return res.status(200).json({ url });
  } catch (error) {
    console.error('S3 getUploadUrl error:', error);
    return res.status(500).json({ message: 'Failed to generate upload URL', error: error.message });
  }
};


// --- Multipart Upload Functions ---

/**
 * @description Initiate a multipart upload for a user.
 * @route POST /api/platform/files/:id/initiate-multipart
 */
exports.initiateMultipartUpload = async (req, res) => {
  const { id } = req.params;
  const { key, contentType } = req.body;
  if (!key) return res.status(400).json({ message: 'Missing file key' });
  
  const fullKey = getUserPrefix(id, key);

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region, signatureVersion: 'v4' });
    const params = { Bucket: bucket, Key: fullKey, ContentType: contentType || 'application/octet-stream' };
    const { UploadId } = await s3.createMultipartUpload(params).promise();
    return res.status(200).json({ uploadId: UploadId });
  } catch (error) {
    console.error('S3 initiateMultipartUpload error:', error);
    return res.status(500).json({ message: 'Failed to initiate multipart upload', error: error.message });
  }
};

/**
 * @description Get pre-signed URLs for multipart upload parts.
 * @route POST /api/platform/files/:id/get-multipart-urls
 */
exports.getMultipartUploadUrls = async (req, res) => {
  const { id } = req.params;
  const { key, uploadId, parts } = req.body;
  if (!key || !uploadId || !parts) return res.status(400).json({ message: 'Missing required parameters' });

  const fullKey = getUserPrefix(id, key);

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region, signatureVersion: 'v4' });
    const urls = await Promise.all(
      parts.map(async (partNumber) => {
        const params = { Bucket: bucket, Key: fullKey, UploadId: uploadId, PartNumber: partNumber, Expires: 60 * 10 };
        const url = await s3.getSignedUrlPromise('uploadPart', params);
        return { partNumber, url };
      })
    );
    return res.status(200).json({ urls });
  } catch (error) {
    console.error('S3 getMultipartUploadUrls error:', error);
    return res.status(500).json({ message: 'Failed to get multipart upload URLs', error: error.message });
  }
};

/**
 * @description Complete a multipart upload for a user.
 * @route POST /api/platform/files/:id/complete-multipart
 */
exports.completeMultipartUpload = async (req, res) => {
  const { id } = req.params;
  const { key, uploadId, parts } = req.body;
  if (!key || !uploadId || !parts) return res.status(400).json({ message: 'Missing required parameters' });
  
  const fullKey = getUserPrefix(id, key);

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region, signatureVersion: 'v4' });
    const params = {
      Bucket: bucket,
      Key: fullKey,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts.map(p => ({ ETag: p.ETag, PartNumber: p.PartNumber })) },
    };
    const result = await s3.completeMultipartUpload(params).promise();
    return res.status(200).json({ result });
  } catch (error) {
    console.error('S3 completeMultipartUpload error:', error);
    return res.status(500).json({ message: 'Failed to complete multipart upload', error: error.message });
  }
};

/**
 * @description Abort a multipart upload for a user.
 * @route POST /api/platform/files/:id/abort-multipart
 */
exports.abortMultipartUpload = async (req, res) => {
    const { id } = req.params;
    const { key, uploadId } = req.body;
    if (!key || !uploadId) return res.status(400).json({ message: 'Missing required parameters' });
    
    const fullKey = getUserPrefix(id, key);

    try {
        const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region, signatureVersion: 'v4' });
        await s3.abortMultipartUpload({ Bucket: bucket, Key: fullKey, UploadId: uploadId }).promise();
        return res.status(200).json({ message: 'Upload aborted' });
    } catch (error) {
        console.error('S3 abortMultipartUpload error:', error);
        return res.status(500).json({ message: 'Failed to abort multipart upload', error: error.message });
    }
};

// --- Advanced Folder Operations ---

/**
 * @description Rename a user's folder.
 * @route POST /api/platform/files/:id/rename-folder
 */
exports.renameFolder = async (req, res) => {
  const { id } = req.params;
  const { oldPrefix, newPrefix } = req.body;
  if (!oldPrefix || !newPrefix) return res.status(400).json({ message: 'Missing required parameters' });
  
  const fullOldPrefix = getUserPrefix(id, oldPrefix);
  const fullNewPrefix = getUserPrefix(id, newPrefix);

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    const listed = await s3.listObjectsV2({ Bucket: bucket, Prefix: fullOldPrefix }).promise();
    if (!listed.Contents || listed.Contents.length === 0) {
      return res.status(404).json({ message: 'No objects found in folder' });
    }
    
    for (const obj of listed.Contents) {
      const newKey = obj.Key.replace(fullOldPrefix, fullNewPrefix);
      await s3.copyObject({
        Bucket: bucket,
        CopySource: `${bucket}/${encodeURIComponent(obj.Key)}`,
        Key: newKey,
      }).promise();
    }
    
    await s3.deleteObjects({
      Bucket: bucket,
      Delete: { Objects: listed.Contents.map(obj => ({ Key: obj.Key })) }
    }).promise();
    
    return res.status(200).json({ message: 'Folder renamed successfully' });
  } catch (error) {
    console.error('S3 renameFolder error:', error);
    return res.status(500).json({ message: 'Failed to rename folder', error: error.message });
  }
};

/**
 * @description Delete a user's folder and all its contents.
 * @route DELETE /api/platform/files/:id/delete-folder
 */
exports.deleteFolder = async (req, res) => {
  const { id } = req.params;
  const { prefix } = req.body;
  if (!prefix) return res.status(400).json({ message: 'Missing required parameter: prefix' });

  const fullPrefix = getUserPrefix(id, prefix);

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    const listed = await s3.listObjectsV2({ Bucket: bucket, Prefix: fullPrefix }).promise();
    if (!listed.Contents || listed.Contents.length === 0) {
      // It's not an error if the folder is already empty, proceed to delete the folder marker if it exists
      // S3 doesn't really have "folders", so if no objects exist with the prefix, the "folder" is gone.
      return res.status(200).json({ message: 'Folder (or its contents) deleted successfully' });
    }
    
    await s3.deleteObjects({
      Bucket: bucket,
      Delete: { Objects: listed.Contents.map(obj => ({ Key: obj.Key })) }
    }).promise();
    
    return res.status(200).json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('S3 deleteFolder error:', error);
    return res.status(500).json({ message: 'Failed to delete folder', error: error.message });
  }
};

/**
 * @description Download a user's folder as a zip file.
 * @route POST /api/platform/files/:id/download-folder
 */
exports.downloadFolderZip = async (req, res) => {
  const { id } = req.params;
  const { prefix } = req.body;
  if (prefix === undefined) return res.status(400).json({ message: 'Missing required parameter: prefix' });

  const fullPrefix = getUserPrefix(id, prefix);

  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    const listed = await s3.listObjectsV2({ Bucket: bucket, Prefix: fullPrefix }).promise();
    if (!listed.Contents || listed.Contents.length === 0) {
      return res.status(404).json({ message: 'No objects found in folder' });
    }

    const folderName = prefix.replace(/\/$/, '').split('/').pop() || 'archive';
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${folderName}.zip"`);
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    
    for (const obj of listed.Contents) {
      if (obj.Key.endsWith('/')) continue; // skip folder markers
      const s3Stream = s3.getObject({ Bucket: bucket, Key: obj.Key }).createReadStream();
      const relPath = obj.Key.replace(fullPrefix, '');
      archive.append(s3Stream, { name: relPath });
    }
    
    archive.finalize();
  } catch (error) {
    console.error('S3 downloadFolderZip error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to download folder as zip', error: error.message });
    }
  }
};

/**
 * @description Creates a zip of a user's folder, uploads it to a temporary location,
 * and returns a pre-signed URL to download it.
 * @route POST /api/platform/files/:uid/share-folder
 */
exports.getFolderZipShareUrl = async (req, res) => {
    // Get the user's ID from the URL
    const { id } = req.params;
    // Get the relative path and expiration from the request body
    const { prefix, expires = 60 * 60 } = req.body; // Default 1 hour expiry
  
    if (prefix === undefined) {
      return res.status(400).json({ message: "Missing required parameter: prefix" });
    }
  
    // Construct the full, user-specific path to the folder
    // const fullPrefix = getUserPrefix(id, prefix);

    console.log("fullPrefix", fullPrefix);
  
    try {
      // Use the platform's credentials
      const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
  
      // List all objects within the user's specified folder
      const listed = await s3.listObjectsV2({ Bucket: bucket, Prefix: fullPrefix }).promise();
      if (!listed.Contents || listed.Contents.length === 0) {
        return res.status(404).json({ message: 'No objects found in folder' });
      }
      
      // Create a zip archive in memory
      const stream = require('stream');
      const pass = new stream.PassThrough();
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(pass);
  
      for (const obj of listed.Contents) {
        if (obj.Key.endsWith('/')) continue; // Skip folder markers
        const s3Stream = s3.getObject({ Bucket: bucket, Key: obj.Key }).createReadStream();
        // Ensure paths inside the zip are relative to the folder being zipped
        const relPath = obj.Key.replace(fullPrefix, '');
        archive.append(s3Stream, { name: relPath });
      }
      archive.finalize();
  
      // Create a unique name for the temporary zip file in a shared location
      const folderName = prefix.replace(/\/$/, '').split('/').pop() || 'archive';
      const zipKey = `shared-zips/${folderName}-${Date.now()}.zip`;
  
      // Upload the generated zip file back to S3
      await s3.upload({
        Bucket: bucket,
        Key: zipKey,
        Body: pass,
        ContentType: 'application/zip',
      }).promise();
      
      // Generate a pre-signed URL for the newly uploaded zip file
      const url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: zipKey,
        Expires: parseInt(expires, 10), // Use the specified expiration time
      });
  
      return res.json({ url });
    } catch (error) {
      console.error('S3 getFolderZipShareUrl error:', error);
      return res.status(500).json({ message: 'Failed to generate share link for folder zip', error: error.message });
    }
  };