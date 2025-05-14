# Virtual Care System

A comprehensive healthcare management system with AI-powered features for medical analysis, medicine scanning, and medication reminders.

## Features

- **AI Health Analysis**: Get instant AI-powered analysis of your symptoms with recommendations
- **Medicine Scanner**: Scan medicine packages to get detailed information about usage and dosage
- **Medication Reminders**: Set up and manage medication schedules with customizable reminders
- **Virtual Consultation**: Connect with healthcare professionals (coming soon)

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd virtual-care-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Technology Stack

- Next.js 13 with App Router
- TypeScript
- Tailwind CSS
- React Webcam
- TensorFlow.js (for AI features)
- Firebase (for backend services)

## Project Structure

```
src/
  ├── app/                    # Next.js app router pages
  │   ├── health-analysis/   # AI symptom analysis
  │   ├── medicine-scanner/  # Medicine scanning feature
  │   ├── reminders/        # Medication reminders
  │   └── consultation/     # Virtual consultation (coming soon)
  ├── components/           # Reusable React components
  ├── lib/                 # Utility functions and helpers
  └── styles/             # Global styles and Tailwind config
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

The AI health analysis feature is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for medical concerns. 