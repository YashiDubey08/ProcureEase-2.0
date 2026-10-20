import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Trash2, 
  Download, 
  Search,
  RefreshCw,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { ChecklistDocumentItem } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';

export const DocumentsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [checklist, setChecklist] = useState<ChecklistDocumentItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [preparedCount, setPreparedCount] = useState<number>(0);

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<ChecklistDocumentItem | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>('Legal & Incorporation');
  const [uploading, setUploading] = useState<boolean>(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchDocumentsData = async () => {
    try {
      setLoading(true);
      setNotification(null);
      const res = await api.getDocuments();
      setChecklist(res.checklist || []);
      setTotalCount(res.checklist_total || res.checklist?.length || 0);
      setPreparedCount(res.prepared_count || 0);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      setNotification({ type: 'error', text: err.message || 'Unable to load document checklist.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentsData();
  }, []);

  const handleUpdateStatus = async (item: ChecklistDocumentItem, newStatus: string) => {
    try {
      await api.updateDocumentStatus({
        name: item.name,
        status: newStatus,
        step_key: item.step_key,
        category: item.category
      });
      setNotification({
        type: 'success',
        text: `Updated status for '${item.name}'.`
      });
      await fetchDocumentsData();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setNotification({ type: 'error', text: err.message || 'Failed to update preparation status.' });
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) {
      setNotification({ type: 'error', text: 'Please select a file to upload.' });
      return;
    }

    const ext = fileToUpload.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'png', 'jpg', 'jpeg'].includes(ext || '')) {
      setNotification({ type: 'error', text: 'Allowed formats: .pdf, .png, .jpg, .jpeg' });
      return;
    }

    if (fileToUpload.size > 15 * 1024 * 1024) {
      setNotification({ type: 'error', text: 'File size exceeds the 15 MB limit.' });
      return;
    }

    try {
      setUploading(true);
      setNotification(null);

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('category', selectedChecklistItem?.category || uploadCategory);
      if (selectedChecklistItem?.step_key) {
        formData.append('step_key', selectedChecklistItem.step_key);
      }

      const res = await api.uploadDocument(formData);
      setNotification({
        type: 'success',
        text: res.message || 'File uploaded successfully.'
      });

      setFileToUpload(null);
      setShowUploadModal(false);
      setSelectedChecklistItem(null);
      await fetchDocumentsData();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setNotification({ type: 'error', text: err.message || 'File upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUploadedFile = async (docId: string, docName: string) => {
    if (!window.confirm(`Delete stored file '${docName}'?`)) return;
    try {
      await api.deleteDocument(docId);
      setNotification({ type: 'success', text: `Deleted '${docName}'.` });
      await fetchDocumentsData();
    } catch (err: any) {
      console.error('Delete failed:', err);
      setNotification({ type: 'error', text: err.message || 'Failed to delete file.' });
    }
  };

  const openUploadForItem = (item: ChecklistDocumentItem) => {
    setSelectedChecklistItem(item);
    setUploadCategory(item.category);
    setShowUploadModal(true);
  };

  const allCategories = Array.from(new Set(checklist.map(c => c.category).filter(Boolean)));

  const filteredChecklist = checklist.filter(item => {
    if (filterCategory !== 'ALL' && item.category !== filterCategory) return false;
    if (filterStatus === 'PREPARED' && !['PREPARED_LOCAL', 'UPLOADED'].includes(item.preparation_status)) return false;
    if (filterStatus === 'MISSING' && ['PREPARED_LOCAL', 'UPLOADED'].includes(item.preparation_status)) return false;
    if (filterStatus === 'REQUIRED' && !item.is_required) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = item.name.toLowerCase().includes(q) ||
                    item.category.toLowerCase().includes(q) ||
                    item.step_title.toLowerCase().includes(q) ||
                    item.explanation.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const prepPercentage = totalCount > 0 ? Math.round((preparedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Page Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              My Documents
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Required documents across your roadmap. Preparing them on your computer is sufficient; server upload is optional.
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-xs font-semibold text-slate-500 block">Readiness</span>
            <span className="text-2xl font-bold text-slate-900">
              {preparedCount} of {totalCount}
            </span>
            <span className="text-xs text-slate-400 block">
              {prepPercentage}% ready
            </span>
          </div>
        </div>

        <div className="pt-1">
          <ProgressBar value={prepPercentage} color="bg-blue-600" height="h-1.5" />
        </div>
      </div>

      {notification && (
        <div 
          className={`p-3.5 rounded-lg text-xs font-medium flex items-center justify-between ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{notification.text}</span>
          <button 
            onClick={() => setNotification(null)}
            className="text-xs font-bold hover:opacity-70 ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
            {['ALL', 'REQUIRED', 'PREPARED', 'MISSING'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterStatus === st 
                    ? 'bg-white text-slate-900 shadow-2xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'REQUIRED' ? 'Required' : st === 'PREPARED' ? 'Prepared' : 'Missing'}
              </button>
            ))}
          </div>

          {allCategories.length > 1 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Compact Document List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 text-slate-400 animate-spin" />
            <p className="text-xs text-slate-500">Loading document checklist...</p>
          </div>
        </div>
      ) : filteredChecklist.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-2">
          <p className="text-xs text-slate-500">No documents match your filter.</p>
          <button
            onClick={() => { setFilterCategory('ALL'); setFilterStatus('ALL'); setSearchQuery(''); }}
            className="text-xs text-blue-600 font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-xl divide-y divide-slate-100 shadow-2xs overflow-hidden">
          {filteredChecklist.map((item) => {
            const isUploaded = item.preparation_status === 'UPLOADED' && item.uploaded_file;

            return (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
              >
                {/* Document Information */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {item.name}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded shrink-0 ${
                      item.is_required 
                        ? 'bg-slate-100 text-slate-700' 
                        : 'bg-slate-50 text-slate-400'
                    }`}>
                      {item.is_required ? 'Required' : 'Conditional'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Link
                      to="/roadmap"
                      className="hover:text-blue-600 truncate"
                    >
                      Step {item.step_number}: {item.step_title}
                    </Link>
                    <span>•</span>
                    <span className="text-slate-400">{item.category}</span>
                  </div>

                  {item.explanation && (
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {item.explanation}
                    </p>
                  )}
                </div>

                {/* Status & Action Controls */}
                <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                  <select
                    value={item.preparation_status}
                    onChange={(e) => handleUpdateStatus(item, e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="NOT_PREPARED">Not Prepared</option>
                    <option value="DRAFT">In Draft</option>
                    <option value="PREPARED_LOCAL">Prepared on Computer</option>
                    <option value="UPLOADED">Uploaded to Vault</option>
                  </select>

                  {/* If uploaded */}
                  {isUploaded && item.uploaded_file && (
                    <div className="flex items-center gap-1">
                      <a
                        href={api.getDocumentDownloadUrl(item.uploaded_file.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteUploadedFile(item.uploaded_file!.id, item.uploaded_file!.original_filename)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* If not uploaded: optional upload trigger */}
                  {!isUploaded && (
                    <button
                      onClick={() => openUploadForItem(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Upload backup copy (optional)"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 space-y-4 shadow-lg animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">
                Upload Backup File
              </h2>
              <button 
                onClick={() => { setShowUploadModal(false); setFileToUpload(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-1">Document:</span>
                <span className="font-semibold text-slate-800">
                  {selectedChecklistItem?.name || 'Supporting Document'}
                </span>
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">
                  Choose File (PDF, PNG, JPG — max 15MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Files are stored privately. You are not required to upload confidential documents if you can submit them directly to the official portal.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowUploadModal(false); setFileToUpload(null); }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !fileToUpload}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
