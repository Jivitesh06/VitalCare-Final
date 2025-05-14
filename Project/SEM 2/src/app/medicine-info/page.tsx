'use client'

import { useState } from 'react'
import { CameraIcon } from '@heroicons/react/24/outline'

export default function MedicineInfo() {
  const [medicineName, setMedicineName] = useState('')
  const [result, setResult] = useState<{
    name: string;
    usage: string;
    dosage: string;
  } | null>(null)

  const searchMedicine = () => {
    if (!medicineName.trim()) return

    // Simple mock database
    const medicines = {
      'paracetamol': {
        name: 'Paracetamol 500mg',
        usage: 'For pain relief and fever reduction',
        dosage: '1-2 tablets every 4-6 hours'
      },
      'ibuprofen': {
        name: 'Ibuprofen 200mg',
        usage: 'For pain relief and inflammation',
        dosage: '1 tablet every 4-6 hours'
      },
      'aspirin': {
        name: 'Aspirin 75mg',
        usage: 'For pain relief and blood thinning',
        dosage: '1 tablet daily'
      }
    }

    const medicine = medicines[medicineName.toLowerCase() as keyof typeof medicines]
    setResult(medicine || null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Medicine Information</h1>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter medicine name
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                className="flex-1 p-3 border rounded-lg"
                placeholder="Example: paracetamol"
              />
              <button
                onClick={searchMedicine}
                className="btn-primary flex items-center space-x-2"
              >
                <CameraIcon className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {result ? (
            <div className="mt-6 space-y-4">
              <div>
                <h2 className="font-semibold text-lg">{result.name}</h2>
                <p className="text-gray-600 mt-1">{result.usage}</p>
              </div>
              <div>
                <h3 className="font-medium">Dosage:</h3>
                <p className="text-gray-600">{result.dosage}</p>
              </div>
            </div>
          ) : medicineName && (
            <p className="text-gray-500 mt-4">No information found for this medicine.</p>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p>Note: This is a basic information system. Always follow your doctor's advice and read the medicine leaflet.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 