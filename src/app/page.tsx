"use client";

import { useState } from "react";
import { UploadCloud, Loader2, FileText, ArrowRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCvContext } from "@/context/CvContext";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing Architectural Density...");
  const { cvs, addCv, deleteCv, isLoaded } = useCvContext();
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setLoadingText("Analyzing Architectural Density...");
    setErrorMsg("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to analyze resume.");
      }

      let finalAnalysis = data.analysis;
      let finalCvData = data.extractedCv;

      // If the Server detected an Image-Based PDF (empty Parse Text)
      if (data.requiresOcr) {
        setLoadingText("Image-based PDF detected. Running Browser OCR...");

        // Dynamically import the OCR utility so it doesn't bloat the main app bundle
        const { extractOcrTextFromPdf } = await import("@/lib/ocr");
        const extractedText = await extractOcrTextFromPdf(file);

        if (!extractedText.trim()) throw new Error("OCR Failed: Could not extract readable text from the image.");

        setLoadingText("Benchmarking Extracted Text...");
        const textFormData = new FormData();
        textFormData.append("text", extractedText);

        const textRes = await fetch("/api/analyze", {
          method: "POST",
          body: textFormData,
        });

        const textData = await textRes.json();
        if (!textRes.ok || textData.error) throw new Error(textData.error || "Failed to analyze resume.");

        if (textData.analysis && textData.extractedCv) {
          finalAnalysis = textData.analysis;
          finalCvData = textData.extractedCv;
        } else {
          throw new Error("Invalid response format from server.");
        }
      } else if (!finalAnalysis || !finalCvData) {
        throw new Error("Invalid response format from server.");
      }

      // Save to IndexedDB via Context
      const newId = await addCv(file.name, finalAnalysis, finalCvData, file);

      // Redirect to the new multi-cv dynamic route
      router.push(`/score/${newId}`);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white selection:bg-rose-500/30 font-sans">
      <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-center">

        <div className="text-center mb-16 relative z-10 w-full max-w-3xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
            CV Score Builder
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 font-medium">
            Upload your resume. Benchmark it against the industry standard.
          </p>
        </div>

        {/* Upload Zone */}
        <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl relative overflow-hidden group mb-16">
          <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-12 transition-colors hover:border-rose-400/50 hover:bg-white/5">
            <UploadCloud className="w-16 h-16 text-rose-400 mb-6 drop-shadow-lg" />
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              id="file-upload"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] mb-4 hover:scale-105"
            >
              {file ? file.name : "Select PDF Resume"}
            </label>
            <p className="text-sm text-neutral-500 font-medium">Only PDF files are supported</p>
          </div>

          {errorMsg && (
            <div className="mt-4 p-4 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 text-sm text-center font-medium">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="mt-8 w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-[0_0_25px_rgba(244,63,94,0.3)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {loadingText}
              </>
            ) : (
              "Benchmark My Resume"
            )}
          </button>
        </div>

        {/* Previous CVs List */}
        {isLoaded && cvs.length > 0 && (
          <div className="w-full max-w-3xl">
            <h3 className="text-xl font-bold mb-6 text-white/90">Recent Documents</h3>
            <div className="flex flex-col gap-4">
              {cvs.map(cv => (
                <div key={cv.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors group">
                  <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => router.push(`/score/${cv.id}`)}>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <FileText className="w-6 h-6 text-neutral-300" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-rose-400 transition-colors">{cv.fileName}</h4>
                      <p className="text-sm text-neutral-400">
                        {new Date(cv.uploadDate).toLocaleDateString()} • Score: {cv.analysisData?.score ?? "N/A"}/100 • {cv.analysisData?.roleCategory ?? "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/score/${cv.id}`)}
                      className="p-3 text-white/50 hover:text-white transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCv(cv.id); }}
                      className="p-3 text-white/30 hover:text-rose-500 transition-colors z-10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
