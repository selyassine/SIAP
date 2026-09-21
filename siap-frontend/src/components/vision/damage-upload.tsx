"use client";

import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { DeclaredSeverity } from "@/lib/vision-types";

const SEVERITY_OPTIONS: DeclaredSeverity[] = ['Minor', 'Moderate', 'Severe', 'Total Loss'];
const SEVERITY_LABELS: Record<DeclaredSeverity, string> = {
  'Minor': 'Mineur',
  'Moderate': 'Modéré',
  'Severe': 'Sévère',
  'Total Loss': 'Perte Totale',
};

interface DamageUploadProps {
  onAnalyze: (file: File, severity: DeclaredSeverity, amount: number) => Promise<void>;
  isLoading: boolean;
}

export function DamageUpload({ onAnalyze, isLoading }: DamageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [severity, setSeverity] = useState<DeclaredSeverity>('Moderate');
  const [amount, setAmount] = useState<string>('3500');
  const [fileError, setFileError] = useState<string | null>(null);

  const validateAndSet = (f: File) => {
    setFileError(null);
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(f.type)) {
      setFileError('Format non supporté. Utilisez JPEG, PNG ou WebP.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setFileError('Image trop grande (max 10 MB).');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSet(droppedFile);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSet(selected);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setFileError(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    const numericAmount = parseFloat(amount) || 0;
    await onAnalyze(file, severity, numericAmount);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700 block">
            Photo du véhicule
          </label>

          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl h-52 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer
                ${dragActive
                  ? 'border-teal-500 bg-teal-50/50'
                  : 'border-slate-300 bg-slate-50/50 hover:border-teal-400 hover:bg-teal-50/30'
                }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileInput}
              />
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragActive ? 'bg-teal-100' : 'bg-slate-200'}`}>
                <Upload className={`w-6 h-6 ${dragActive ? 'text-teal-600' : 'text-slate-500'}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Glissez une photo ici</p>
                <p className="text-xs text-slate-400 mt-1">ou cliquez pour sélectionner</p>
                <p className="text-xs text-slate-400 mt-2 bg-slate-100 px-3 py-1 rounded-full inline-block">JPEG · PNG · WebP · max 10 MB</p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-52 group">
              <img src={preview!} alt="Aperçu" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <button
                  onClick={removeFile}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2 hover:bg-white"
                >
                  <X className="w-5 h-5 text-slate-700" />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-slate-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-teal-500" />
                {file.name}
              </div>
            </div>
          )}

          {fileError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {fileError}
            </div>
          )}
        </div>

        {/* Claim Declaration */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-700 block">
            Déclaration du sinistre
          </label>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sévérité déclarée
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SEVERITY_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeverity(s)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border
                      ${severity === s
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-200'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-700'
                      }`}
                  >
                    {SEVERITY_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Montant réclamé (€)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">€</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900
                    focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                  placeholder="3500"
                />
              </div>
              <p className="text-xs text-slate-400">Entrez le montant total réclamé pour ce sinistre</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="button"
        disabled={!file || isLoading}
        onClick={handleSubmit}
        className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all
          ${!file || isLoading
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 active:scale-[0.99]'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2.5">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Analyse en cours…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            Analyser les dommages
          </span>
        )}
      </button>
    </div>
  );
}
