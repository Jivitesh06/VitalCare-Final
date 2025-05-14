'use client'

import { useState } from 'react'
import { ClockIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Reminder {
  id: string
  medicine: string
  time: string
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [newReminder, setNewReminder] = useState({
    medicine: '',
    time: ''
  })

  const addReminder = () => {
    if (!newReminder.medicine || !newReminder.time) return

    const reminder: Reminder = {
      id: Date.now().toString(),
      ...newReminder
    }

    setReminders([...reminders, reminder])
    setNewReminder({ medicine: '', time: '' })
  }

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Medication Reminders</h1>

          {/* Add New Reminder */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine
                </label>
                <input
                  type="text"
                  value={newReminder.medicine}
                  onChange={(e) => setNewReminder({
                    ...newReminder,
                    medicine: e.target.value
                  })}
                  className="w-full p-3 border rounded-lg"
                  placeholder="Medicine name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({
                    ...newReminder,
                    time: e.target.value
                  })}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={addReminder}
              className="btn-primary mt-4 w-full flex items-center justify-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Reminder</span>
            </button>
          </div>

          {/* Reminders List */}
          <div className="space-y-4">
            {reminders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No reminders set. Add your first reminder above.
              </p>
            ) : (
              reminders.map(reminder => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <ClockIcon className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-medium">{reminder.medicine}</h3>
                      <p className="text-sm text-gray-600">{reminder.time}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 