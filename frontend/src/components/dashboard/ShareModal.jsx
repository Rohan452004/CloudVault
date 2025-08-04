import React, { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useAws } from "../../contexts/AwsContext";
import { toast } from "react-hot-toast";

const COMMON_DURATIONS = [
  { label: "15 min", value: 15, unit: "minutes" },
  { label: "1 hour", value: 1, unit: "hours" },
  { label: "1 day", value: 1, unit: "days" },
  { label: "1 week", value: 7, unit: "days" },
];

const ShareModal = ({ open, file, onClose }) => {
  const { aws } = useAws();
  const [duration, setDuration] = useState(15);
  const [unit, setUnit] = useState("minutes");
  const [shareUrl, setShareUrl] = useState(file && file.isZip && file.url ? file.url : "");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !file) return null;

  // Calculate total days for validation
  const getTotalDays = (dur, u) => {
    if (u === "minutes") return dur / (24 * 60);
    if (u === "hours") return dur / 24;
    if (u === "days") return dur;
    return 0;
  };

  // Validate duration
  const validateDuration = (dur, u) => {
    const totalDays = getTotalDays(dur, u);
    if (totalDays > 7) {
      toast.error("Maximum duration allowed is 7 days. Please select a shorter duration.");
      return false;
    }
    return true;
  };

  const handleCommon = (d) => {
    if (validateDuration(d.value, d.unit)) {
      setDuration(d.value);
      setUnit(d.unit);
    }
  };

  const handleDurationChange = (newDuration) => {
    if (validateDuration(newDuration, unit)) {
      setDuration(newDuration);
    }
  };

  const handleUnitChange = (newUnit) => {
    if (validateDuration(duration, newUnit)) {
      setUnit(newUnit);
    }
  };

  const handleGenerate = async () => {
    // Validate duration before making the request
    if (!validateDuration(duration, unit)) {
      return;
    }

    setLoading(true);
    setError("");
    setShareUrl("");
    setShortUrl("");
    let expiresIn = duration;
    if (unit === "hours") expiresIn *= 60;
    if (unit === "days") expiresIn *= 60 * 24;
    try {
      let url = "";
      if (file.isZip && file.keys) {
        // Regenerate bulk share zip with new expiry
        const res = await axiosInstance.post("/self/s3/bulk/bulk-share-zip", {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucket: aws.bucket,
          region: aws.region,
          keys: file.keys,
          expires: expiresIn * 60, // seconds
        });
        url = res.data.url;
      } else if (file.isFolder) {
        // Call backend to get pre-signed URL for folder zip
        const res = await axiosInstance.post("/self/s3/get-folder-zip-share-url", {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucket: aws.bucket,
          region: aws.region,
          prefix: file.key,
          expires: expiresIn * 60, // seconds
        });
        url = res.data.url;
      } else {
        const res = await axiosInstance.post("/self/s3/get-signed-url", {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucket: aws.bucket,
          region: aws.region,
          key: file.key,
          expires: expiresIn * 60, // seconds
        });
        url = res.data.url;
      }
      setShareUrl(url);
      
      // Create short URL
      try {
        const shortRes = await axiosInstance.post("/short/create", {
          originalUrl: url,
          userId: "temp-user-id", // You can get actual user ID from context
          expiresIn: expiresIn * 60
        });
        setShortUrl(shortRes.data.shortUrl);
      } catch (shortError) {
        console.error("Failed to create short URL:", shortError);
        // Don't show error to user, just use original URL
      }
    } catch (err) {
      setError("Failed to generate share link");
    } finally {
      setLoading(false);
    }
  };

  // If this is a bulk zip with keys but no URL, show the normal share interface
  if (file.isZip && file.keys && !file.url) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-[#18181b] rounded-lg shadow-lg p-8 max-w-md w-full relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
          <h2 className="text-xl font-bold text-white mb-4">Share Bulk Download ZIP</h2>
          <div className="mb-6">
            <div className="text-white font-semibold mb-2">Set Link Expiration</div>
            <div className="text-gray-400 mb-2">Choose how long the share link should remain valid (max 7 days):</div>
            <div className="flex items-center gap-2 mb-4">
              <label className="text-gray-300">Duration:</label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="bg-black text-white border border-orange-500 rounded px-2 py-1 w-20"
              />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="bg-black text-white border border-gray-600 rounded px-2 py-1"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
            <div className="flex gap-2 mb-4">
              {COMMON_DURATIONS.map(d => (
                <button
                  key={d.label}
                  onClick={() => handleCommon(d)}
                  className="bg-[#23232a] text-white px-3 py-1 rounded hover:bg-orange-600 border border-gray-700"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg text-lg mb-4 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Share Link"}
          </button>
          {error && <div className="text-red-400 mb-2 text-center">{error}</div>}
          {shareUrl && (
            <div className="bg-[#23232a] p-3 rounded text-white text-sm flex flex-col items-center">
              <span className="mb-2">Shareable Link:</span>
              {shortUrl ? (
                <>
                  <input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="w-full bg-black text-white border border-gray-700 rounded px-2 py-1 mb-2"
                    onFocus={e => e.target.select()}
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(shortUrl); }}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1 rounded mb-2"
                  >
                    Copy Short Link
                  </button>
                  <details className="w-full">
                    <summary className="text-gray-400 cursor-pointer text-xs mb-1">Show Original URL</summary>
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="w-full bg-black text-white border border-gray-700 rounded px-2 py-1 mt-1 text-xs"
                      onFocus={e => e.target.select()}
                    />
                    <button
                      onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded mt-1 text-xs"
                    >
                      Copy Original Link
                    </button>
                  </details>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="w-full bg-black text-white border border-gray-700 rounded px-2 py-1 mb-2"
                    onFocus={e => e.target.select()}
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1 rounded"
                  >
                    Copy Link
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#18181b] rounded-lg shadow-lg p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-xl font-bold text-white mb-4">
          Share {file.isFolder ? "Folder" : "1 Selected File(s)"}
        </h2>
        {!file.isFolder && (
          <div className="mb-6">
            <div className="text-white font-semibold mb-2">Set Link Expiration</div>
            <div className="text-gray-400 mb-2">Choose how long the share link should remain valid (max 7 days):</div>
            <div className="flex items-center gap-2 mb-4">
              <label className="text-gray-300">Duration:</label>
              <input
                type="number"
                min={1}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="bg-black text-white border border-orange-500 rounded px-2 py-1 w-20"
              />
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="bg-black text-white border border-gray-600 rounded px-2 py-1"
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
            <div className="flex gap-2 mb-4">
              {COMMON_DURATIONS.map(d => (
                <button
                  key={d.label}
                  onClick={() => handleCommon(d)}
                  className="bg-[#23232a] text-white px-3 py-1 rounded hover:bg-orange-600 border border-gray-700"
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={handleGenerate}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg text-lg mb-4 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Generating..." : file.isFolder ? "Generate Share Link for ZIP" : "Generate Share Link"}
        </button>
        {error && <div className="text-red-400 mb-2 text-center">{error}</div>}
        {shareUrl && (
          <div className="bg-[#23232a] p-3 rounded text-white text-sm flex flex-col items-center">
            <span className="mb-2">Shareable Link:</span>
            {shortUrl ? (
              <>
                <input
                  type="text"
                  value={shortUrl}
                  readOnly
                  className="w-full bg-black text-white border border-gray-700 rounded px-2 py-1 mb-2"
                  onFocus={e => e.target.select()}
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(shortUrl); }}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1 rounded mb-2"
                >
                  Copy Short Link
                </button>
                <details className="w-full">
                  <summary className="text-gray-400 cursor-pointer text-xs mb-1">Show Original URL</summary>
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="w-full bg-black text-white border border-gray-700 rounded px-2 py-1 mt-1 text-xs"
                    onFocus={e => e.target.select()}
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded mt-1 text-xs"
                  >
                    Copy Original Link
                  </button>
                </details>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full bg-black text-white border border-gray-700 rounded px-2 py-1 mb-2"
                  onFocus={e => e.target.select()}
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1 rounded"
                >
                  Copy Link
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal; 