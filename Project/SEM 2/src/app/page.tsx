'use client'

import Link from 'next/link'
import { 
  BeakerIcon, 
  ClockIcon, 
  CameraIcon 
} from '@heroicons/react/24/outline'

export default function Home() {
  const features = [
    {
      title: 'Health Check',
      description: 'Get quick health analysis and recommendations',
      icon: BeakerIcon,
      href: '/health-check'
    },
    {
      title: 'Medicine Info',
      description: 'Get medicine details and usage instructions',
      icon: CameraIcon,
      href: '/medicine-info'
    },
    {
      title: 'Reminders',
      description: 'Set up medication reminders',
      icon: ClockIcon,
      href: '/reminders'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-primary">HealthCare</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Welcome to HealthCare</h2>
          <p className="text-gray-600">Your personal health assistant</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href}>
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
} 