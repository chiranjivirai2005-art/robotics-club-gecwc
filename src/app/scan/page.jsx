"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Camera, CheckCircle2, QrCode, RotateCcw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

const readerId = "attendance-qr-reader";

const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isSessionActive = (session) => {
  const expiresAt = toDate(session?.expiresAt);
  return expiresAt ? expiresAt.getTime() >= Date.now() : true;
};

const getSessionIdFromScan = (decodedText) => {
  try {
    const url = new URL(decodedText, window.location.origin);
    const match = url.pathname.match(/^\/attendance\/([^/?#]+)/);
    return match?.[1] || "";
  } catch {
    return "";
  }
};

const pickBackCamera = (cameras) => {
  const rearCamera = cameras.find((camera) =>
    /back|rear|environment/i.test(camera.label || "")
  );

  return rearCamera?.id || cameras[cameras.length - 1]?.id || "";
};

export default function ScanPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const scannerRef = useRef(null);
  const processingRef = useRef(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState("");
  const [modal, setModal] = useState(null);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      await scanner.clear();
    } catch (error) {
      console.warn("Scanner cleanup failed:", error);
    } finally {
      scannerRef.current = null;
      setScanning(false);
    }
  }, []);

  const markAttendance = useCallback(
    async (decodedText) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setStatus("Marking attendance...");

      try {
        const sessionId = getSessionIdFromScan(decodedText);
        if (!sessionId) {
          throw new Error("This QR is not a valid attendance QR.");
        }

        const sessionSnap = await getDoc(doc(db, "attendanceSessions", sessionId));
        if (!sessionSnap.exists()) {
          throw new Error("Attendance session was not found.");
        }

        const session = { id: sessionSnap.id, ...sessionSnap.data() };
        if (!isSessionActive(session)) {
          throw new Error("This attendance QR has closed.");
        }

        const recordRef = doc(db, "attendanceRecords", `${sessionId}_${user.uid}`);

        try {
          const existingRecord = await getDoc(recordRef);

          if (existingRecord.exists()) {
            setModal({
              title: "Attendance already marked",
              message: `You are already marked present for ${session.eventName || "this session"}.`,
              tone: "info",
            });
            setStatus("Attendance was already marked.");
            await stopScanner();
            return;
          }
        } catch (error) {
          console.warn("Could not pre-check attendance record. Trying to mark directly.", error);
        }

        try {
          await setDoc(recordRef, {
            sessionId,
            userId: user.uid,
            name: user.displayName || user.email || "Student",
            email: user.email || "",
            date: session.date || new Date().toISOString(),
            timestamp: serverTimestamp(),
          });
        } catch (error) {
          if (error.code === "permission-denied") {
            throw new Error("Attendance may already be marked, or your account is not approved for attendance.");
          }

          throw error;
        }

        setModal({
          title: "Attendance marked",
          message: `You are now marked present for ${session.eventName || "this session"}.`,
          tone: "success",
        });
        setStatus("Attendance marked successfully.");
        await stopScanner();
      } catch (error) {
        console.error("QR attendance scan failed:", error);
        setModal({
          title: "Could not mark attendance",
          message: error.message || "Please try scanning the QR again.",
          tone: "error",
        });
        setStatus(error.message || "Failed to mark attendance.");
      } finally {
        processingRef.current = false;
      }
    },
    [stopScanner, user]
  );

  const loadCameras = useCallback(async () => {
    const availableCameras = await Html5Qrcode.getCameras();
    setCameras(availableCameras);

    const preferredCameraId = pickBackCamera(availableCameras);
    setSelectedCameraId((current) => current || preferredCameraId);
    return { availableCameras, preferredCameraId };
  }, []);

  const startScanner = useCallback(
    async (cameraId = selectedCameraId) => {
      if (!user) return;

      setStatus("Starting camera...");
      setModal(null);
      processingRef.current = false;
      await stopScanner();

      try {
        const scanner = new Html5Qrcode(readerId);
        scannerRef.current = scanner;
        let cameraToUse = cameraId;

        if (!cameraToUse) {
          const { preferredCameraId } = await loadCameras();
          cameraToUse = preferredCameraId;
        }

        const cameraConfig = cameraToUse || { facingMode: "environment" };

        await scanner.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
            rememberLastUsedCamera: true,
          },
          markAttendance,
          () => {}
        );

        setScanning(true);
        setStatus("Point your phone camera at the attendance QR.");
      } catch (error) {
        console.error("Unable to start QR scanner:", error);
        setStatus("Could not start the camera. Please allow camera permission and try again.");
        await stopScanner();
      }
    },
    [loadCameras, markAttendance, selectedCameraId, stopScanner, user]
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!authLoading && user) {
      loadCameras().catch((error) => {
        console.warn("Camera list is not available before permission:", error);
      });
    }
  }, [authLoading, loadCameras, user]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const switchCamera = async (event) => {
    const nextCameraId = event.target.value;
    setSelectedCameraId(nextCameraId);

    if (scanning) {
      await startScanner(nextCameraId);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-wrap">
        <section className="page-hero">
          <div className="mb-4 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-accent">
            <QrCode size={28} />
          </div>
          <p className="eyebrow">Attendance Scanner</p>
          <h1 className="section-title max-w-3xl">Scan and mark attendance</h1>
          <p className="max-w-2xl text-slate-300">
            The scanner will prefer your phone&apos;s back camera. Once the QR is detected,
            attendance is marked automatically and you will see a confirmation popup.
          </p>
        </section>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="content-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">Camera</p>
                <h2 className="mt-2 text-2xl text-white">QR reader</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startScanner()}
                  disabled={authLoading || !user || scanning}
                  className="btn-admin disabled:opacity-60"
                >
                  <Camera className="mr-2" size={16} />
                  {scanning ? "Scanning" : "Start"}
                </button>
                <button
                  type="button"
                  onClick={stopScanner}
                  disabled={!scanning}
                  className="btn-secondary disabled:opacity-60"
                >
                  Stop
                </button>
              </div>
            </div>

            <div
              id={readerId}
              className="mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-black/40"
            />

            {status && (
              <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-slate-200">
                {status}
              </p>
            )}
          </section>

          <aside className="content-card">
            <p className="eyebrow">Camera Choice</p>
            <h2 className="mt-2 text-2xl text-white">Switch camera</h2>
            <p className="mt-2 text-sm text-slate-300">
              If the browser starts the selfie camera, choose the back/rear camera here.
            </p>

            <select
              value={selectedCameraId}
              onChange={switchCamera}
              className="field mt-5"
              disabled={cameras.length === 0}
            >
              {cameras.length === 0 ? (
                <option value="">Allow camera permission first</option>
              ) : (
                cameras.map((camera, index) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.label || `Camera ${index + 1}`}
                  </option>
                ))
              )}
            </select>

            <button
              type="button"
              onClick={() => loadCameras()}
              className="btn-secondary mt-4 w-full"
            >
              <RotateCcw className="mr-2" size={16} />
              Refresh Cameras
            </button>
          </aside>
        </div>

        {modal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-slate-950 p-7 text-center shadow-[0_30px_90px_rgba(2,8,23,0.7)]">
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                  modal.tone === "error"
                    ? "bg-red-400/10 text-red-200"
                    : "bg-cyan-300/10 text-accent"
                }`}
              >
                <CheckCircle2 size={34} />
              </div>
              <h2 className="mt-5 text-2xl text-white">{modal.title}</h2>
              <p className="mt-3 text-slate-300">{modal.message}</p>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="btn-admin mt-6"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
