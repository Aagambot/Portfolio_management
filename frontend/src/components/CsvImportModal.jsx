import React, { useState, useRef } from 'react';
import { portfolioService, formatINR } from '../services/api';
import { 
  Upload, 
  Download, 
  X, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Table
} from 'lucide-react';

export default function CsvImportModal({ isOpen, onClose, portfolioId, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setErrorMsg(null);
    setLoading(true);

    try {
      const data = await portfolioService.previewCsv(portfolioId, selectedFile);
      setPreview(data);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to parse CSV file. Ensure valid columns.');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!file) return;
    setImporting(true);
    setErrorMsg(null);

    try {
      const res = await portfolioService.importCsv(portfolioId, file);
      if (res.success) {
        alert(res.message);
        onImportSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Import completed with warnings.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to import CSV.');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSample = () => {
    portfolioService.downloadSampleCsv();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Import Portfolio CSV Statement</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Sample CSV Download Callout */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200">
                Supports Zerodha, Groww, CAMS, or Standard Format
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload your transaction tradebook with Indian stocks (e.g. RELIANCE.NS) and mutual fund units.
              </p>
            </div>
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Sample CSV</span>
            </button>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-950/70"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-slate-200">
              {file ? file.name : 'Click to select or drag and drop your CSV'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Supports .csv files up to 10MB
            </p>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center space-x-2 py-4 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Parsing and validating CSV statement...</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Table Preview */}
          {preview && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center space-x-2">
                  <Table className="w-4 h-4 text-emerald-400" />
                  <span>Preview ({preview.valid_rows_count} valid, {preview.error_rows_count} errors)</span>
                </span>
                <span className="text-slate-400">{preview.total_rows} total rows parsed</span>
              </div>

              <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-950 sticky top-0 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Symbol</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3 text-right">Units/Qty</th>
                      <th className="py-2 px-3 text-right">Price/NAV</th>
                      <th className="py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {preview.rows.map((row, idx) => (
                      <tr key={idx} className={row.status === 'valid' ? 'hover:bg-slate-800/30' : 'bg-red-500/5'}>
                        <td className="py-2 px-3 text-slate-300">{row.date}</td>
                        <td className="py-2 px-3 font-bold text-white">{row.symbol}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            row.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-200">{row.quantity}</td>
                        <td className="py-2 px-3 text-right text-slate-300">{formatINR(row.price)}</td>
                        <td className="py-2 px-3 text-center">
                          {row.status === 'valid' ? (
                            <span className="inline-flex items-center text-emerald-400 text-[10px]">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-red-400 text-[10px]" title={row.error_message}>
                              <AlertCircle className="w-3.5 h-3.5 mr-1" /> Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end space-x-3 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            disabled={!preview || preview.valid_rows_count === 0 || importing}
            onClick={handleConfirmImport}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-lg shadow-emerald-600/20"
          >
            {importing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Commit {preview?.valid_rows_count || 0} Transactions</span>
          </button>
        </div>

      </div>
    </div>
  );
}
