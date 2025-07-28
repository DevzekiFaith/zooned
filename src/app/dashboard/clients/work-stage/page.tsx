"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaRedo,
  FaPlay,
  FaFileDownload,
  FaFileImage,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Stage {
  name: string;
  done: boolean;
}

const initialStages: Stage[] = [
  { name: "Requirement", done: false },
  { name: "Design", done: false },
  { name: "Development", done: false },
  { name: "Testing", done: false },
  { name: "Deployment", done: false },
];

const chime =
  typeof Audio !== "undefined" ? new Audio("/chime.mp3") : undefined;

export default function WorkStagesPage() {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [toast, setToast] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const markDone = (i: number) => {
    const updated = [...stages];
    updated[i].done = true;
    setStages(updated);
    setToast(`${updated[i].name} marked as completed!`);
    chime?.play();
    setTimeout(() => setToast(null), 3000);
  };

  const resetStage = (i: number) => {
    const updated = [...stages];
    updated[i].done = false;
    setStages(updated);
    setToast(`${updated[i].name} reset to pending.`);
    chime?.play();
    setTimeout(() => setToast(null), 3000);
  };

  const percentDone =
    (stages.filter((s) => s.done).length / stages.length) * 100;

  const exportChartAsPDF = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("work-stages-report.pdf");
    } catch (error) {
      console.error("PDF export failed", error);
    }
  };

  const exportChartAsPNG = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current);
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "work-stages-chart.png";
      a.click();
    } catch (error) {
      console.error("PNG export failed", error);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 p-6 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-fade-in text-gray-800 dark:text-gray-100">
      <aside className="hidden md:flex flex-col gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow border dark:border-gray-700">
        <h2 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
          📊 Stage Summary
        </h2>
        {stages.map((stage, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span>{stage.name}</span>
            <span
              className={`font-bold ${
                stage.done ? "text-green-500" : "text-gray-400"
              }`}
            >
              {stage.done ? "✓" : "-"}
            </span>
          </div>
        ))}
      </aside>

      <main className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-800 dark:text-blue-200">
            🚀 Project Work Stages
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            <button
              onClick={exportChartAsPNG}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
            >
              <FaFileImage /> PNG
            </button>
            <button
              onClick={exportChartAsPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700"
            >
              <FaFileDownload /> PDF
            </button>
          </div>
        </div>

        {toast && (
          <div className="p-3 bg-green-100 border border-green-200 text-green-800 rounded-md shadow animate-fade-in dark:bg-green-800 dark:border-green-700 dark:text-white">
            <FaCheckCircle className="inline mr-2" /> {toast}
          </div>
        )}

        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span className="text-gray-600 dark:text-gray-300">Progress</span>
            <span className="text-gray-500 dark:text-gray-400">
              {percentDone.toFixed(0)}%
            </span>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
              style={{ width: `${percentDone}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stages.map((stage, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`p-6 rounded-xl border shadow-md transition hover:shadow-lg transform hover:scale-[1.02] duration-300 ${
                stage.done
                  ? "bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-600"
                  : "bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700"
              }`}
            >
              <h2 className="text-xl font-bold mb-2 text-blue-700 dark:text-blue-300">
                {stage.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                {stage.done ? "Completed" : "Pending"}
              </p>
              <div className="flex gap-3">
                {!stage.done && (
                  <button
                    onClick={() => markDone(i)}
                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FaPlay /> Start
                  </button>
                )}
                {stage.done && (
                  <button
                    onClick={() => resetStage(i)}
                    className="px-4 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <FaRedo /> Reset
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          ref={chartRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-300">
            Stage Completion Overview
          </h3>
          <div className="flex justify-between items-end h-32">
            {stages.map((s, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: s.done ? 100 : 20 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="w-full mx-2 flex flex-col items-center"
              >
                <div
                  className="bg-blue-500 w-4 rounded-t-md"
                  style={{ height: s.done ? 100 : 20 }}
                />
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                  {s.name}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 text-center">
            Completed = Blue Bar
          </div>
        </motion.div>
      </main>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(32px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.7s ease-out both;
        }
        .dark {
          background-color: #111827;
          color: #f9fafb;
        }
      `}</style>
    </div>
  );
}
