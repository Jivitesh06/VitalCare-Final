'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'
import { BeakerIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface SymptomAnalysis {
  possibleConditions: Array<{
    name: string
    probability: number
    description: string
    recommendations: string[]
  }>
  generalAdvice: string[]
  urgencyLevel: 'low' | 'medium' | 'high'
}

export default function HealthAnalysis() {
  const [symptoms, setSymptoms] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null)

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast.error('Please describe your symptoms')
      return
    }

    setIsAnalyzing(true)

    // Simulate AI analysis - in a real application, this would call your AI service
    setTimeout(() => {
      const mockAnalysis: SymptomAnalysis = {
        possibleConditions: [
          {
            name: 'Common Cold',
            probability: 0.75,
            description: 'A viral infection of the upper respiratory tract',
            recommendations: [
              'Rest and stay hydrated',
              'Take over-the-counter cold medications',
              'Use saline nasal drops',
              'Gargle with warm salt water'
            ]
          },
          {
            name: 'Seasonal Allergies',
            probability: 0.45,
            description: 'An allergic response to environmental triggers',
            recommendations: [
              'Take antihistamines',
              'Avoid known allergens',
              'Use air purifiers',
              'Keep windows closed during high pollen times'
            ]
          }
        ],
        generalAdvice: [
          'Monitor your symptoms for any changes',
          'Get adequate rest',
          'Stay hydrated',
          'Maintain good hygiene'
        ],
        urgencyLevel: 'low'
      }

      setAnalysis(mockAnalysis)
      setIsAnalyzing(false)
    }, 2000)
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">AI Health Analysis</h1>

        <div className="card mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Describe your symptoms
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={5}
              placeholder="Please describe your symptoms in detail. For example: I have had a headache for 2 days, along with a mild fever and sore throat..."
            />
          </div>

          <button
            onClick={analyzeSymptoms}
            disabled={isAnalyzing}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <BeakerIcon className="w-5 h-5" />
                <span>Analyze Symptoms</span>
              </>
            )}
          </button>
        </div>

        {analysis && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
              <div className="mb-4">
                <span className="font-medium">Urgency Level: </span>
                <span className={`font-semibold ${getUrgencyColor(analysis.urgencyLevel)}`}>
                  {analysis.urgencyLevel.toUpperCase()}
                </span>
              </div>

              <h3 className="font-medium mb-2">Possible Conditions:</h3>
              <div className="space-y-4">
                {analysis.possibleConditions.map((condition, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{condition.name}</h4>
                      <span className="text-sm text-gray-600">
                        {Math.round(condition.probability * 100)}% match
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{condition.description}</p>
                    <div>
                      <h5 className="font-medium mb-1">Recommendations:</h5>
                      <ul className="list-disc pl-5 space-y-1">
                        {condition.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-gray-600">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3">General Advice</h3>
              <ul className="list-disc pl-5 space-y-2">
                {analysis.generalAdvice.map((advice, index) => (
                  <li key={index} className="text-gray-600">{advice}</li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Note: This is an AI-powered analysis and should not replace professional medical advice.
                If your symptoms are severe or persist, please consult a healthcare provider.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 