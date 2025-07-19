// controllers/awsController.js

const AWS = require('aws-sdk');

const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Configure multer storage (in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file'); // expecting single file with name "file"

exports.SelfManaged = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region } = req.body;

  if (!accessKeyId || !secretAccessKey || !bucket || !region) {
    return res.status(400).json({ message: 'Missing AWS credentials or bucket info' });
  }

  try {
    // Configure AWS SDK
    const s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region,
    });

    // 1. Check the bucket's actual region
    let bucketRegion = region;
    try {
      const loc = await s3.getBucketLocation({ Bucket: bucket }).promise();
      // AWS returns '' for us-east-1
      bucketRegion = loc.LocationConstraint || 'us-east-1';
      if (bucketRegion === 'EU') bucketRegion = 'eu-west-1'; // legacy EU
    } catch (err) {
      return res.status(403).json({
        message: 'Failed to get bucket region. Please verify bucket name and credentials.',
        error: err.message,
      });
    }
    if (bucketRegion !== region) {
      return res.status(400).json({
        message: `Region mismatch: Bucket is in '${bucketRegion}', but you entered '${region}'.`,
      });
    }

    // 2. Try listing the bucket objects (to verify access)
    await s3
      .listObjectsV2({
        Bucket: bucket,
        MaxKeys: 1,
      })
      .promise();

    return res.status(200).json({
      message: 'Successfully connected to S3 bucket',
      bucket,
      region,
    });
  } catch (error) {
    console.error('S3 connection error:', error);
    return res.status(403).json({
      message: 'Failed to connect to the S3 bucket. Please verify credentials and permissions.',
      error: error.message,
    });
  }
};

// exports.uploadFile = async (req, res) => {
//   const { accessKeyId, secretAccessKey, bucket, region, key } = req.body;
//   const file = req.file;

//   if (!accessKeyId || !secretAccessKey || !bucket || !region || !file) {
//     return res.status(400).json({ message: 'Missing file or AWS credentials' });
//   }

//   try {
//     const s3 = new S3Client({
//       region,
//       credentials: {
//         accessKeyId,
//         secretAccessKey,
//       },
//     });

//     const uploadParams = {
//       Bucket: bucket,
//       Key: key || file.originalname,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//     };

//     const command = new PutObjectCommand(uploadParams);
//     await s3.send(command);

//     return res.status(200).json({
//       message: 'File uploaded successfully to S3',
//       filename: key || file.originalname,
//     });
//   } catch (error) {
//     console.error('Upload error:', error);
//     return res.status(500).json({
//       message: 'Failed to upload file to S3',
//       error: error.message,
//     });
//   }
// };

exports.listFiles = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, prefix = '' } = req.body;

  if (!accessKeyId || !secretAccessKey || !bucket || !region) {
    return res.status(400).json({ message: 'Missing AWS credentials or bucket info' });
  }

  try {
    // Configure AWS SDK
    const s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region,
    });

    // List objects in the bucket
    const params = {
      Bucket: bucket,
      Prefix: prefix,
      Delimiter: '/',
    };

    const result = await s3.listObjectsV2(params).promise();
    
    // Process files and folders
    const files = [];
    const folders = new Set();

    // Add folders (CommonPrefixes)
    if (result.CommonPrefixes) {
      result.CommonPrefixes.forEach(commonPrefix => {
        const folderName = commonPrefix.Prefix.replace(commonPrefix.Prefix.split('/').slice(0, -2).join('/') + '/', '').replace('/', '');
        if (folderName) {
          folders.add(folderName);
        }
      });
    }

    // Add files
    if (result.Contents) {
      result.Contents.forEach(item => {
        // Skip the prefix itself if it's not empty
        if (prefix && item.Key === prefix) {
          return;
        }
        
        // Get the file name (remove the prefix path)
        const fileName = prefix ? item.Key.replace(prefix, '') : item.Key;
        
        // Skip if it's a folder (ends with /)
        if (fileName.endsWith('/')) {
          return;
        }

        // Skip if it's in a subfolder (contains /)
        if (fileName.includes('/')) {
          return;
        }

        files.push({
          id: item.Key,
          name: fileName,
          type: 'file',
          size: item.Size,
          lastModified: item.LastModified,
          key: item.Key,
        });
      });
    }

    // Convert folders set to array
    const folderArray = Array.from(folders).map(folderName => ({
      id: prefix + folderName + '/',
      name: folderName,
      type: 'folder',
      key: prefix + folderName + '/',
    }));

    // Combine and sort (folders first, then files)
    const allItems = [...folderArray, ...files].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });

    return res.status(200).json({
      files: allItems,
      currentPath: prefix,
    });
  } catch (error) {
    console.error('S3 list files error:', error);
    return res.status(500).json({
      message: 'Failed to list files from S3',
      error: error.message,
    });
  }
};

exports.getSignedUrl = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, key, expires } = req.body;

  if (!accessKeyId || !secretAccessKey || !bucket || !region || !key) {
    return res.status(400).json({ message: 'Missing AWS credentials, bucket info, or file key' });
  }

  try {
    const s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region,
      signatureVersion: 'v4',
    });

    const params = {
      Bucket: bucket,
      Key: key,
      Expires: expires || 60 * 5, // default 5 minutes
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    return res.status(200).json({ url });
  } catch (error) {
    console.error('S3 getSignedUrl error:', error);
    return res.status(500).json({
      message: 'Failed to generate signed URL',
      error: error.message,
    });
  }
};

exports.createFolder = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, folderPath } = req.body;

  if (!accessKeyId || !secretAccessKey || !bucket || !region || !folderPath) {
    return res.status(400).json({ message: 'Missing AWS credentials, bucket info, or folder path' });
  }

  try {
    const s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region,
    });

    // Ensure folderPath ends with /
    const key = folderPath.endsWith('/') ? folderPath : folderPath + '/';

    await s3
      .putObject({
        Bucket: bucket,
        Key: key,
        Body: '', // zero-byte
      })
      .promise();

    return res.status(200).json({ message: 'Folder created successfully', key });
  } catch (error) {
    console.error('S3 create folder error:', error);
    return res.status(500).json({
      message: 'Failed to create folder in S3',
      error: error.message,
    });
  }
};

exports.deleteFile = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, key } = req.body;

  if (!accessKeyId || !secretAccessKey || !bucket || !region || !key) {
    return res.status(400).json({ message: 'Missing AWS credentials, bucket info, or key' });
  }

  try {
    const s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region,
    });
    // Only support single file delete
    await s3.deleteObject({ Bucket: bucket, Key: key }).promise();
    return res.status(200).json({ message: 'File deleted successfully', key });
  } catch (error) {
    console.error('S3 delete error:', error);
    return res.status(500).json({
      message: 'Failed to delete file from S3',
      error: error.message,
    });
  }
};

exports.renameFile = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, oldKey, newKey } = req.body;

  if (!accessKeyId || !secretAccessKey || !bucket || !region || !oldKey || !newKey) {
    return res.status(400).json({ message: 'Missing AWS credentials, bucket info, or keys' });
  }

  try {
    const s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region,
    });

    // Only support single file rename
    await s3.copyObject({
      Bucket: bucket,
      CopySource: `${bucket}/${encodeURIComponent(oldKey)}`,
      Key: newKey,
    }).promise();
    await s3.deleteObject({ Bucket: bucket, Key: oldKey }).promise();
    return res.status(200).json({ message: 'File renamed successfully', oldKey, newKey });
  } catch (error) {
    console.error('S3 rename error:', error);
    return res.status(500).json({
      message: 'Failed to rename file in S3',
      error: error.message,
    });
  }
};

exports.getUploadUrl = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, key, contentType } = req.body;

  if (!accessKeyId || !secretAccessKey || !bucket || !region || !key) {
    return res.status(400).json({ message: 'Missing AWS credentials, bucket info, or file key' });
  }

  try {
    const s3 = new AWS.S3({
      accessKeyId,
      secretAccessKey,
      region,
      signatureVersion: 'v4',
    });

    const params = {
      Bucket: bucket,
      Key: key,
      Expires: 60 * 10, // 10 minutes
      ContentType: contentType || 'application/octet-stream',
    };

    const url = await s3.getSignedUrlPromise('putObject', params);
    return res.status(200).json({ url });
  } catch (error) {
    console.error('S3 getUploadUrl error:', error);
    return res.status(500).json({
      message: 'Failed to generate upload URL',
      error: error.message,
    });
  }
};

exports.initiateMultipartUpload = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, key, contentType } = req.body;
  if (!accessKeyId || !secretAccessKey || !bucket || !region || !key) {
    return res.status(400).json({ message: 'Missing AWS credentials, bucket info, or file key' });
  }
  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region, signatureVersion: 'v4' });
    const params = {
      Bucket: bucket,
      Key: key,
      ContentType: contentType || 'application/octet-stream',
    };
    const { UploadId } = await s3.createMultipartUpload(params).promise();
    return res.status(200).json({ uploadId: UploadId });
  } catch (error) {
    console.error('S3 initiateMultipartUpload error:', error);
    return res.status(500).json({ message: 'Failed to initiate multipart upload', error: error.message });
  }
};

exports.getMultipartUploadUrls = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, key, uploadId, parts, contentType } = req.body;
  if (!accessKeyId || !secretAccessKey || !bucket || !region || !key || !uploadId || !parts) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }
  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region, signatureVersion: 'v4' });
    const urls = await Promise.all(
      parts.map(async (partNumber) => {
        const params = {
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
          Expires: 60 * 10,
        };
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

exports.completeMultipartUpload = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, key, uploadId, parts } = req.body;
  if (!accessKeyId || !secretAccessKey || !bucket || !region || !key || !uploadId || !parts) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }
  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region, signatureVersion: 'v4' });
    const params = {
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map(p => ({ ETag: p.ETag, PartNumber: p.PartNumber }))
      }
    };
    const result = await s3.completeMultipartUpload(params).promise();
    return res.status(200).json({ result });
  } catch (error) {
    console.error('S3 completeMultipartUpload error:', error);
    return res.status(500).json({ message: 'Failed to complete multipart upload', error: error.message });
  }
};

exports.abortMultipartUpload = async (req, res) => {
  const { accessKeyId, secretAccessKey, bucket, region, key, uploadId } = req.body;
  if (!accessKeyId || !secretAccessKey || !bucket || !region || !key || !uploadId) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }
  try {
    const s3 = new AWS.S3({ accessKeyId, secretAccessKey, region, signatureVersion: 'v4' });
    await s3.abortMultipartUpload({ Bucket: bucket, Key: key, UploadId: uploadId }).promise();
    return res.status(200).json({ message: 'Upload aborted' });
  } catch (error) {
    console.error('S3 abortMultipartUpload error:', error);
    return res.status(500).json({ message: 'Failed to abort multipart upload', error: error.message });
  }
};