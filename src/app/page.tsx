"use client";

import { useState } from "react";
import { UploadCloud, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCvContext } from "@/context/CvContext";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing Architectural Density...");
  const { addCv } = useCvContext();
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-500/30 overflow-hidden relative">
      <Navbar />

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-blue-50/50 to-white pointer-events-none" />

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-20 pt-20 pb-16 min-h-screen flex flex-col justify-center items-center">
        <motion.div
          className="relative max-w-4xl mx-auto w-full text-center flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Decorative curved line */}
          <svg
            className="absolute -top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 opacity-30 pointer-events-none"
            viewBox="0 0 800 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 60 Q200 0 400 60 T800 60"
              stroke="#3B82F6"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          {/* Sparkle Icon */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-6"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-4xl sm:text-5xl lg:text-7xl text-slate-900 leading-[1.1] mb-6 font-bold tracking-tight"
          >
            Benchmark Your CV
            <br />
            <span className="text-blue-600">Against The Industry</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-slate-600 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10 font-medium"
          >
            Upload your resume, analyze your readiness score, and match with the best jobs in seconds.
          </motion.p>

          {/* Upload & Actions */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-lg mx-auto flex flex-col items-center gap-4"
          >
            {/* The Upload Area matching Light Theme */}
            <div className={`w-full bg-white border-2 border-dashed rounded-2xl p-8 transition-colors ${file ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}>
              <div className="flex flex-col items-center justify-center">
                <UploadCloud className="w-12 h-12 text-blue-500 mb-4" />
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-slate-900 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-md mb-3"
                >
                  {file ? 'Change PDF File' : 'Select Resume (PDF)'}
                </label>

                {file && (
                  <p className="text-sm font-bold text-slate-800 break-all px-4">{file.name}</p>
                )}
                {!file && (
                  <p className="text-xs text-slate-500 font-medium mt-1">Accepts standard PDF formats</p>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-medium">
                {errorMsg}
              </div>
            )}

            {/* Primary Submit Button */}
            <motion.button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full mt-2 px-8 py-4 text-base font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              whileHover={!file || loading ? {} : { scale: 1.02, boxShadow: '0 10px 30px rgba(37, 99, 235, 0.3)' }}
              whileTap={!file || loading ? {} : { scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {loadingText}
                </>
              ) : (
                <>
                  Analyze Resume Now <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
