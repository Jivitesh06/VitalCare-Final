'use client'

import { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { toast } from 'react-toastify'
import { CameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export default function MedicineScanner() {
  const webcamRef = useRef<Webcam>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [result, setResult] = useState<{
    name: string;
    usage: string;
    dosage: string;
    warnings: string[];
  } | null>(null)

  const capture = useCallback(() => {
    if (!webcamRef.current) return

    setIsScanning(true)
    const imageSrc = webcamRef.current.getScreenshot()

    // Simulate AI processing
    setTimeout(() => {
      // This is a mock result - in a real application, you would send the image
      // to your AI service for processing
      setResult({
        name: "Paracetamol 500mg",
        usage: "For pain relief and fever reduction",
        dosage: "1-2 tablets every 4-6 hours as needed",
        warnings: [
          "Do not exceed 8 tablets in 24 hours",
          "Avoid alcohol while taking this medication",
          "Consult doctor if symptoms persist"
        ]
      })
      setIsScanning(false)
      toast.success("Medicine successfully scanned!")
    }, 2000)
  }, [])

  const resetScan = () => {
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Medicine Scanner</h1>
        
        <div className="card mb-8">
          {!result ? (
            <div className="space-y-4">
              <div className="relative">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full rounded-lg"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <ArrowPathIcon className="w-12 h-12 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={capture}
                disabled={isScanning}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <CameraIcon className="w-6 h-6" />
                <span>Scan Medicine</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{result.name}</h2>
                <p className="text-gray-600">{result.usage}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Dosage</h3>
                <p className="text-gray-600">{result.dosage}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Warnings</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {result.warnings.map((warning, index) => (
                    <li key={index} className="text-gray-600">{warning}</li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={resetScan}
                className="btn-secondary w-full"
              >
                Scan Another Medicine
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 