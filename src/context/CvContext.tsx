"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import localforage from "localforage";
import { v4 as uuidv4 } from 'uuid';
import { GoldStandardResume } from "@/types/resume";

export interface AnalysisData {
    score: number;
    roleCategory: string;
    marketFitSummary: string;
    categories: {
        name: string;
        score: number;
        sourceCited?: string;
        good: string[];
        improvements: string[];
    }[];
}

export interface StoredCV {
    id: string;
    fileName: string;
    uploadDate: number;
    analysisData: AnalysisData;
    cvData: GoldStandardResume;
}

interface CvContextType {
    cvs: StoredCV[];
    addCv: (fileName: string, analysisData: AnalysisData, cvData: GoldStandardResume, pdfBlob: Blob) => Promise<string>;
    updateCvData: (id: string, updatedCvData: GoldStandardResume) => Promise<void>;
    updateFullCv: (id: string, analysisData: AnalysisData, cvData: GoldStandardResume) => Promise<void>;
    getPdfBlob: (id: string) => Promise<Blob | null>;
    deleteCv: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
    isLoaded: boolean;
}

const CvContext = createContext<CvContextType | undefined>(undefined);

// Initialize localforage instances for IndexedDB
const cvStore = localforage.createInstance({ name: "cv-score-builder", storeName: "cv_metadata" });
const pdfStore = localforage.createInstance({ name: "cv-score-builder", storeName: "pdf_blobs" });

export function CvProvider({ children }: { children: React.ReactNode }) {
    const [cvs, setCvs] = useState<StoredCV[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load all CV metadata on mount
    useEffect(() => {
        let mounted = true;
        async function loadCvs() {
            try {
                const storedCvs: StoredCV[] = [];
                await cvStore.iterate((value: StoredCV, key: string) => {
                    storedCvs.push(value);
                });
                // Sort by newest first
                storedCvs.sort((a, b) => b.uploadDate - a.uploadDate);
                if (mounted) {
                    setCvs(storedCvs);
                }
            } catch (error) {
                console.error("Failed to load CVs from IndexedDB", error);
            } finally {
                if (mounted) setIsLoaded(true);
            }
        }
        loadCvs();

        return () => { mounted = false; };
    }, []);

    const addCv = async (fileName: string, analysisData: AnalysisData, cvData: GoldStandardResume, pdfBlob: Blob) => {
        const id = uuidv4();
        const newCv: StoredCV = {
            id,
            fileName,
            uploadDate: Date.now(),
            analysisData,
            cvData
        };

        try {
            await cvStore.setItem(id, newCv);
            await pdfStore.setItem(id, pdfBlob);
            setCvs(prev => [newCv, ...prev]);
            return id;
        } catch (error) {
            console.error("Failed to save CV to IndexedDB", error);
            throw error;
        }
    };

    const updateCvData = async (id: string, updatedCvData: GoldStandardResume) => {
        try {
            const existingCv = await cvStore.getItem<StoredCV>(id);
            if (existingCv) {
                const updatedCv = { ...existingCv, cvData: updatedCvData };
                await cvStore.setItem(id, updatedCv);
                setCvs(prev => prev.map(cv => cv.id === id ? updatedCv : cv));
            }
        } catch (error) {
            console.error("Failed to update CV in IndexedDB", error);
            throw error;
        }
    };

    const updateFullCv = async (id: string, analysisData: AnalysisData, cvData: GoldStandardResume) => {
        try {
            const existingCv = await cvStore.getItem<StoredCV>(id);
            if (existingCv) {
                const updatedCv = { ...existingCv, analysisData, cvData };
                await cvStore.setItem(id, updatedCv);
                setCvs(prev => prev.map(cv => cv.id === id ? updatedCv : cv));
            }
        } catch (error) {
            console.error("Failed to update full CV in IndexedDB", error);
            throw error;
        }
    };

    const getPdfBlob = async (id: string): Promise<Blob | null> => {
        try {
            return await pdfStore.getItem<Blob>(id);
        } catch (error) {
            console.error("Failed to retrieve PDF Blob from IndexedDB", error);
            return null;
        }
    };

    const deleteCv = async (id: string) => {
        try {
            await cvStore.removeItem(id);
            await pdfStore.removeItem(id);
            setCvs(prev => prev.filter(cv => cv.id !== id));
        } catch (error) {
            console.error("Failed to delete CV from IndexedDB", error);
            throw error;
        }
    };

    const clearAll = async () => {
        try {
            await cvStore.clear();
            await pdfStore.clear();
            setCvs([]);
        } catch (error) {
            console.error("Failed to clear CVs from IndexedDB", error);
            throw error;
        }
    };

    return (
        <CvContext.Provider value={{ cvs, addCv, updateCvData, updateFullCv, getPdfBlob, deleteCv, clearAll, isLoaded }}>
            {children}
        </CvContext.Provider>
    );
}

export function useCvContext() {
    const context = useContext(CvContext);
    if (context === undefined) {
        throw new Error("useCvContext must be used within a CvProvider");
    }
    return context;
}
