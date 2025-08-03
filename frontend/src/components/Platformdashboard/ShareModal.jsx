import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../contexts/AuthContext"; // Changed from useAws
import { toast } from "react-hot-toast";

const COMMON_DURATIONS = [
  { label: "15 min", value: 15, unit: "minutes" },
  { label: "1 hour", value: 1, unit: "hours" },
  { label: "1 day", value: 1, unit: "days" },
  { label: "1 week", value: 7, unit: "days" },
];

const ShareModal = ({ open, file, onClose }) => {
  const { user } = useAuth(); // Use auth context to get the user
  const [duration, setDuration] = useState(15);
  const [unit, setUnit] = useState("minutes");
  const [shareUrl, setShareUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset state when the file prop changes (modal opens for a new file)
  useEffect(() => {
    if (open) {
      // Only set shareUrl if there's an existing URL (not for bulk zip with keys only)
      setShareUrl(file?.isZip && file.url ? file.url : "");
      setShortUrl("");
      setError("");
      setLoading(false);
      setDuration(15);
      setUnit("minutes");
    }
  }, [open, file]);

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

  const handleGenerate = async () => {
    if (!user?._id) {
      setError("User not found. Please log in again.");
      return;
    }

    // Validate duration before making the request
    if (!validateDuration(duration, unit)) {
      return;
    }

    setLoading(true);
    setError("");
    setShareUrl("");
    setShortUrl("");

    let expiresInMinutes = duration;
    if (unit === "hours") expiresInMinutes *= 60;
    if (unit === "days") expiresInMinutes *= 60 * 24;
    const expiresInSeconds = expiresInMinutes * 60;

    try {
      let res;
      if (file.isZip && file.keys) {
        // Case 1: Regenerate bulk share zip with new expiry
        res = await axiosInstance.post(`platform/s3/bulk/${user._id}/bulk-share-zip`, {
          keys: file.keys,
          expires: expiresInSeconds,
        });
      } else if (file.isFolder) {
        // Case 2: Get pre-signed URL for folder zip
        res = await axiosInstance.post(`platform/s3/${user._id}/get-folder-zip-share-url`, {
          prefix: file.key,
          expires: expiresInSeconds,
        });
      } else {
        // Case 3: Get pre-signed URL for a single file
        res = await axiosInstance.post(`platform/s3/${user._id}/get-signed-url`, {
          key: file.key,
          expires: expiresInSeconds,
        });
      }
      setShareUrl(res.data.url);
      
      // Create short URL
      try {
        const shortRes = await axiosInstance.post("/short/create", {
          originalUrl: res.data.url,
          userId: user._id,
          expiresIn: expiresInSeconds
        });
        setShortUrl(shortRes.data.shortUrl);
      } catch (shortError) {
        console.error("Failed to create short URL:", shortError);
        // Don't show error to user, just use original URL
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate share link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#18181b] rounded-lg shadow-lg p-6 max-w-md w-full relative border border-gray-700">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-xl font-bold text-white mb-4">
          Share {file.isZip ? "Bulk Download" : file.isFolder ? "Folder" : "File"}
        </h2>
        <div className="mb-6">
          <div className="text-white font-semibold mb-2">Set Link Expiration</div>
          <div className="text-gray-400 mb-3 text-sm">Choose how long the link should be valid (max 7 days):</div>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="number"
              min={1}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="bg-[#23232a] text-white border border-gray-600 rounded px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              value={unit}
              onChange={e => setUnit(e.target.value)}
              className="bg-[#23232a] text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_DURATIONS.map(d => (
              <button
                key={d.label}
                onClick={() => handleCommon(d)}
                className="bg-[#2d2d34] text-gray-300 px-3 py-1 rounded-md hover:bg-orange-600 hover:text-white transition-colors text-sm"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleGenerate}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg text-lg mb-4 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Share Link"}
        </button>
        {error && <div className="text-red-400 mb-4 text-center">{error}</div>}
        {shareUrl && (
          <div className="bg-[#23232a] p-4 rounded-lg">
            <label className="text-white text-sm font-semibold mb-2 block">Shareable Link:</label>
            {shortUrl ? (
              <>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="w-full bg-black text-gray-300 border border-gray-700 rounded px-2 py-1"
                    onFocus={e => e.target.select()}
                  />
                  <button
                    onClick={() => { navigator.clipboard.writeText(shortUrl); toast.success("Short link copied!"); }}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1 rounded"
                  >
                    Copy
                  </button>
                </div>
                <details className="w-full">
                  <summary className="text-gray-400 cursor-pointer text-xs mb-1">Show Original URL</summary>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="w-full bg-black text-gray-300 border border-gray-700 rounded px-2 py-1 text-xs"
                      onFocus={e => e.target.select()}
                    />
                    <button
                      onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Original link copied!"); }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded text-xs"
                    >
                      Copy
                    </button>
                  </div>
                </details>
              </>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full bg-black text-gray-300 border border-gray-700 rounded px-2 py-1"
                  onFocus={e => e.target.select()}
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success("Link copied!"); }}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1 rounded"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;