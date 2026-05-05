import React, { useRef, useState } from 'react';
import { useUploadProof } from '../../hooks/usePortalBills.js';
import { formatDate } from '../../utils/formatters.js';

const MAX_SIZE = 10 * 1024 * 1024;

const ProofUploadForm = ({ billId, existingProof }) => {
  const [selected, setSelected] = useState(null);
  const [sizeError, setSizeError] = useState('');
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef();
  const uploadProof = useUploadProof(billId);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSizeError('');
    if (file && file.size > MAX_SIZE) {
      setSizeError('File exceeds 10 MB limit.');
      setSelected(null);
    } else {
      setSelected(file || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setApiError('');
    setSuccess(false);
    try {
      await uploadProof.mutateAsync(selected);
      setSuccess(true);
      setSelected(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setApiError(err.message || 'Upload failed');
    }
  };

  return (
    <div className="space-y-3">
      {existingProof && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
          Current proof: <span className="font-medium">{existingProof.originalName}</span>
          <span className="text-gray-400 ml-2">uploaded {formatDate(existingProof.uploadedAt)}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileChange}
          className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          type="submit"
          disabled={!selected || uploadProof.isPending}
          className="px-4 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap"
        >
          {uploadProof.isPending ? 'Uploading...' : existingProof ? 'Replace Proof' : 'Upload Proof'}
        </button>
      </form>
      {sizeError && <p className="text-red-500 text-xs">{sizeError}</p>}
      {apiError && <p className="text-red-500 text-xs">{apiError}</p>}
      {success && <p className="text-green-600 text-xs">Proof uploaded successfully.</p>}
    </div>
  );
};

export default ProofUploadForm;
