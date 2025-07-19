import React from 'react';
import { FaTimes, FaAws, FaShieldAlt, FaUpload, FaLock, FaCheckCircle, FaCopy, FaCheck } from 'react-icons/fa';
import { useState } from 'react';

const HowItWorksModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const steps = [
    {
      icon: <FaAws className="w-6 h-6" />,
      title: "Create AWS Account & S3 Bucket",
      description: "Sign up for AWS and create an S3 bucket in your preferred region.",
      details: ["Go to AWS Console", "Create S3 bucket", "Choose region"]
    },
    {
      icon: <FaShieldAlt className="w-6 h-6" />,
      title: "Create IAM User & Access Keys", 
      description: "Create an IAM user with S3 permissions and generate access keys.",
      details: ["Go to IAM service", "Create user", "Attach Policy ( Provided Below )", "Generate access keys"]
    },
    {
      icon: <FaUpload className="w-6 h-6" />,
      title: "Configure CORS for Direct Upload",
      description: "Set up CORS policy on your S3 bucket to allow direct file uploads.",
      details: ["Go to bucket properties", "Find CORS configuration", "Add the CORS policy ( Provided Below )"]
    },
    {
      icon: <FaLock className="w-6 h-6" />,
      title: "Enter Credentials in CloudVault",
      description: "Provide your AWS credentials and bucket information.",
      details: ["Enter Access Key ID", "Enter Secret Key", "Specify bucket name", "Select region"]
    },
    {
      icon: <FaCheckCircle className="w-6 h-6" />,
      title: "Start Uploading Files",
      description: "Your files upload directly to your S3 bucket with full control.",
      details: ["Direct S3 upload", "Multipart for large files", "Full data control"]
    }
  ];

  const corsPolicy = `[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]`;

  const handleCopyCors = async () => {
    try {
      await navigator.clipboard.writeText(corsPolicy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">How Self-Managed S3 Works</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Why Choose Self-Managed S3?</h3>
            <p className="text-gray-600">
              With self-managed S3, you maintain complete control over your data. Your files are stored in your own AWS S3 bucket, 
              and you manage all credentials and permissions.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-blue-600">{step.icon}</div>
                    <h4 className="text-lg font-semibold text-gray-800">{step.title}</h4>
                  </div>
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Required IAM Permissions */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">🔑 Required IAM Permissions</h4>
            <p className="text-sm text-yellow-700 mb-2">Your IAM user needs these permissions:</p>
            <div className="bg-yellow-100 p-3 rounded text-sm">
              <p className="font-medium text-yellow-800 mb-1">Option 1: Individual Permissions</p>
              <ul className="text-yellow-700 space-y-1 ml-4">
                <li>• s3:GetObject</li>
                <li>• s3:PutObject</li>
                <li>• s3:ListBucket</li>
                <li>• s3:DeleteObject</li>
              </ul>
              <p className="font-medium text-yellow-800 mt-2 mb-1">Option 2: Full Access (Easier)</p>
              <ul className="text-yellow-700 space-y-1 ml-4">
                <li>• s3:FullAccess</li>
              </ul>
            </div>
          </div>

          {/* CORS Configuration */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800">📋 S3 CORS Configuration</h4>
              <button
                onClick={handleCopyCors}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                {copied ? (
                  <>
                    <FaCheck className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <FaCopy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">Add this exact CORS policy to your S3 bucket:</p>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
              {corsPolicy}
            </pre>
            {/* <p className="text-xs text-gray-500 mt-2">
              <strong>Note:</strong> Using "*" for AllowedOrigins allows all domains. For production, replace with your specific domain.
            </p> */}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">🔒 Security & Privacy</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your AWS credentials are stored locally in your browser</li>
              <li>• Files upload directly to your S3 bucket, bypassing our servers</li>
              <li>• We never have access to your files or AWS credentials</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t">
          <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal; 