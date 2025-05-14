'use client'

import { useState } from 'react'
import { BeakerIcon } from '@heroicons/react/24/outline'

export default function HealthCheck() {
  const [symptoms, setSymptoms] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const analyzeSymptoms = () => {
    if (!symptoms.trim()) return

    // Simple mock analysis
    const mockResults = [
      "Based on your symptoms, you might have a common cold. Rest and stay hydrated.",
      "Your symptoms suggest seasonal allergies. Consider taking antihistamines.",
      "These symptoms could indicate stress. Try relaxation techniques and get adequate sleep."
    ]

    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
    setResult(randomResult)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Health Check</h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your symptoms
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="Example: I have a headache and feel tired..."
            />
          </div>

          <button
            onClick={analyzeSymptoms}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            <BeakerIcon className="w-5 h-5" />
            <span>Check Symptoms</span>
          </button>

          {result && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h2 className="font-semibold mb-2">Analysis Result:</h2>
              <p className="text-gray-700">{result}</p>
              <p className="text-sm text-gray-500 mt-4">
                Note: This is a basic analysis. Please consult a doctor for professional medical advice.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 