import React, { useState, useEffect } from 'react';
import { 
  Files, 
  Upload, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sparkles,
  ArrowRight,
  Filter,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { api } from '../services/api';
import type { StartupDocument } from '../types';

const CATEGORIES = [
  'DPIIT Startup Recognition',
  'MSME / Udyam Certificate',
  'GST Certificate',
  'ISO 9001 Certificate',
  'Past Work Order & Completion Proof',
  'Audited Financial Statement',
  'Technical Product Datasheet',
  'Other Supporting Document'
];

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<StartupDocument[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [categorySummary, setCategorySummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getDocuments();
      setDocuments(res.documents || []);
      setTotalCount(res.total_count || 0);
      setCategorySummary(res.category_summary || {});
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      setErrorMsg(err.message || 'Unable to load document vault.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    try {
      setUploading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('category', selectedCategory);

      const res = await api.uploadDocument(formData);
      setSuccessMsg(res.message || 'Document uploaded and indexed successfully.');
      setFileToUpload(null);
      setShowUploadModal(false);
      await fetchDocuments();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setErrorMsg(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, docName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${docName}" from your vault?`)) {
      return;
    }

    try {
      setErrorMsg(null);
      const res = await api.deleteDocument(docId);
      setSuccessMsg(res.message || 'Document deleted.');
      await fetchDocuments();
    } catch (err: any) {
      console.error('Delete failed:', err);
      setErrorMsg(err.message || 'Failed to delete document.');
    }
  };

  const handleSeedDemo = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await api.loadDemoData();
      setSuccessMsg('Loaded standard SmartSense Technologies demo documents!');
      await fetchDocuments();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to seed demo data.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = filterCategory === 'ALL'
    ? documents
    : documents.filter(doc => doc.category.toLowerCase().includes(filterCategory.toLowerCase()));

  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Vault"
        description="Securely store and index regulatory certificates, financial statements, and technical proofs for Tender-to-Evidence mapping."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Document Vault' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchDocuments}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Sparkles}
              onClick={handleSeedDemo}
            >
              Load Demo Proofs
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={() => setShowUploadModal(true)}
            >
              Upload Document
            </Button>
          </div>
        }
      />

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 text-xs font-bold">DISMISS</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successMsg}</div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 text-xs font-bold">DISMISS</button>
        </div>
      )}

      {/* Vault Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50/60 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Total Stored</span>
              <span className="p-2 bg-blue-100 rounded-lg text-blue-700">
                <Files className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
              <div className="text-xs text-slate-500 mt-1">Proof artifacts indexed</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50/60 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Statutory Proofs</span>
              <span className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">
                {(categorySummary['DPIIT Startup Recognition'] || 0) + (categorySummary['MSME / Udyam Certificate'] || 0) + (categorySummary['GST Certificate'] || 0)}
              </div>
              <div className="text-xs text-slate-500 mt-1">DPIIT, Udyam, & GST active</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50/60 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Quality Certs</span>
              <span className="p-2 bg-amber-100 rounded-lg text-amber-700">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">
                {categorySummary['ISO 9001 Certificate'] || 0}
              </div>
              <div className="text-xs text-slate-500 mt-1">ISO 9001:2015 certification</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50/60 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Evidence Status</span>
              <span className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{totalCount > 0 ? 'Ready' : 'Pending'}</div>
              <div className="text-xs text-slate-500 mt-1">{totalCount > 0 ? 'Linked to Tender Engine' : 'No documents uploaded'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <p>
            <strong>Tender-to-Action Principle:</strong> Documents in this vault are parsed by PyMuPDF and automatically matched to tender criteria in the <strong>Requirement $\to$ Evidence Engine</strong>.
          </p>
        </div>
        <Link to="/eligibility" className="text-xs font-semibold text-blue-700 hover:text-blue-900 whitespace-nowrap flex items-center gap-1">
          Check Eligibility <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Document Explorer Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <CardTitle>Registered Supporting Evidence</CardTitle>
            <CardDescription>
              Showing {filteredDocs.length} of {totalCount} files available for algorithmic requirement verification.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              aria-label="Filter documents by category"
              className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Categories ({totalCount})</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat} ({categorySummary[cat] || 0})</option>
              ))}
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <p className="text-sm font-medium">Loading indexed documents...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-800">No documents found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {filterCategory === 'ALL'
                  ? 'Your vault is currently empty. Upload statutory certificates or click "Load Demo Proofs" to test with realistic startup artifacts.'
                  : `No documents found in category "${filterCategory}".`}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button size="sm" variant="outline" icon={Sparkles} onClick={handleSeedDemo}>
                  Load Demo Proofs
                </Button>
                <Button size="sm" variant="primary" icon={Upload} onClick={() => setShowUploadModal(true)}>
                  Upload Document
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Document Name</th>
                    <th className="py-3 px-6">Regulatory Category</th>
                    <th className="py-3 px-6">Pages / Size</th>
                    <th className="py-3 px-6">Parsing Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-700 rounded-lg shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              {doc.original_filename}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              ID: {doc.id} • Uploaded {doc.upload_date ? new Date(doc.upload_date).toLocaleDateString() : 'Active'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                        <span className="font-semibold text-slate-800">{doc.page_count} {doc.page_count === 1 ? 'page' : 'pages'}</span>
                        <span className="text-slate-400 mx-1.5">•</span>
                        <span>{formatFileSize(doc.file_size_bytes)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status="Ready" size="sm" />
                        <span className="text-[11px] text-slate-400 block mt-1">Available for Evidence Mapping</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDelete(doc.id, doc.original_filename)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Upload Supporting Evidence
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Document Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Correct classification guarantees the automated rules engine maps the right clause to this proof.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select File (PDF or Image) *
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
                  <input
                    type="file"
                    id="docFileInput"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="docFileInput" className="cursor-pointer block">
                    <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <span className="text-sm font-semibold text-blue-700 hover:underline">
                      {fileToUpload ? fileToUpload.name : 'Choose a file'}
                    </span>
                    <span className="text-xs text-slate-500 block mt-1">
                      {fileToUpload ? `${formatFileSize(fileToUpload.size)} selected` : 'Supports PDF, PNG, JPG up to 16MB'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={uploading}
                  disabled={!fileToUpload || uploading}
                  icon={Upload}
                >
                  {uploading ? 'Parsing & Indexing...' : 'Upload & Index'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
