import React from "react";

const FileList = ({ files = [], onFileClick, onFolderClick, onAction }) => (
  <div className="w-full bg-[#18181b] rounded-b-2xl shadow-lg p-4 mt-2 min-h-[120px]">
    {files.length === 0 ? (
      <div className="text-gray-500 text-center py-8">No files or folders found.</div>
    ) : (
      <ul className="divide-y divide-[#23232a]">
        {files.map((file, idx) => (
          <li key={file.id || idx} className="flex items-center justify-between py-3 px-2 group hover:bg-[#23232a] rounded-lg transition">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => file.type === 'folder' ? onFolderClick?.(file) : onFileClick?.(file)}>
              {file.type === 'folder' ? (
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M8 4v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
              )}
              <span className="text-gray-200 font-medium text-base">{file.name}</span>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button onClick={() => onAction?.('download', file)} className="text-emerald-400 hover:text-emerald-300"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
              <button onClick={() => onAction?.('delete', file)} className="text-red-500 hover:text-red-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default FileList; 