"use client";

import { useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ScanPage() {
  const [result, setResult] = useState("");

  const startScanner = () => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        setResult(decodedText);
        scanner.clear();
      },
      (error) => {
        console.warn(error);
      }
    );
  };

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <h1 className="text-3xl text-white">Scan Attendance</h1>

        <button
          onClick={startScanner}
          className="mt-6 rounded bg-blue-600 px-4 py-2 text-white"
        >
          Start Scanner
        </button>

        <div id="reader" className="mt-6"></div>

        {result && (
          <p className="mt-4 text-green-400">
            Scanned: {result}
          </p>
        )}
      </div>
    </div>
  );
}