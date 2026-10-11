"use client";

import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setPrediction(null);
    setConfidence(null);
    setError("");
  }

  async function handlePredict() {
    if (!selectedFile) {
      setError("Please select an X-ray image first.");
      return;
    }

    setLoading(true);
    setError("");
    setPrediction(null);
    setConfidence(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "http://127.0.0.1:8000/predict",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Prediction failed.");
      }

      setPrediction(result.prediction);
      setConfidence(result.confidence);
    } catch {
      setError(
        "Could not connect to the backend. Check that FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
          AI / Deep Learning Project
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Pneumonia Detection
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-300">
          Upload a chest X-ray to test an educational image-classification
          model powered by PyTorch and ResNet18.
        </p>

        <section className="mt-10 rounded-2xl border border-slate-700 bg-slate-900 p-6 sm:p-8">
          <label
            htmlFor="xray"
            className="mb-3 block text-sm font-medium text-slate-200"
          >
            Select chest X-ray image
          </label>

          <input
            id="xray"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
          />

          {preview && (
            <div className="mt-6">
              <p className="mb-3 text-sm text-slate-400">Image preview</p>
              <img
                src={preview}
                alt="Selected chest X-ray preview"
                className="max-h-96 w-full rounded-xl border border-slate-700 object-contain"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handlePredict}
            disabled={!selectedFile || loading}
            className="mt-6 w-full rounded-lg bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing image..." : "Analyze X-ray"}
          </button>

          {error && (
            <p role="alert" className="mt-5 rounded-lg bg-red-950 p-4 text-sm text-red-300">
              {error}
            </p>
          )}

          {prediction && confidence !== null && (
            <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-5">
              <p className="text-sm text-slate-400">Model prediction</p>
              <h2 className="mt-2 text-2xl font-bold text-cyan-300">
                {prediction}
              </h2>
              <p className="mt-2 text-slate-300">
                Model score: {(confidence * 100).toFixed(2)}%
              </p>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                This score is not a medical diagnosis or a measure of
                clinically validated certainty. This educational model
                must not be used to make healthcare decisions.
              </p>
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Educational prototype only. Not intended for clinical use.
        </p>
      </div>
    </main>
  );
}