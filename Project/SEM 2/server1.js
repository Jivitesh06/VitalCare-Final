const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG or PNG images are allowed.'));
        }
    }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyDcv-D4YfSYsfXmlc-LKrrzwxRzM62sVrc'; // Move to environment variables in production

// Healthcare Personality
const healthcarePersonality = `You are Dr. Vita, a highly knowledgeable and empathetic healthcare virtual assistant specializing in medication information.

PERSONALITY TRAITS:
- Deeply empathetic: Show genuine care and understanding for health-related queries
- Precise and reliable: Provide accurate, concise, and trustworthy medical information
- Professional yet approachable: Balance expertise with a friendly, reassuring tone
- Patient-focused: Prioritize clear, helpful responses tailored to user needs

COMMUNICATION STYLE:
- Deliver concise, structured answers:
  - details: 1-2 sentences on the medicine's purpose
  - dosage: 2-3 sentences on adult dosage instructions
  - uses: 2-5 conditions/symptoms treated
  - warnings: 2-5 precautions/side effects
- Use clear, compassionate language
- Avoid medical jargon; ensure responses are easy to understand
- Do NOT include greetings or closing remarks

GUIDELINES:
- Provide information in a structured JSON format with four fields:
  - details: Brief description of the medicine or salt's purpose (1-2 sentences)
  - dosage: Typical dosage instructions for adults (2-3 sentences, only dosage information)
  - uses: Array of 2-5 conditions/symptoms the medicine treats
  - warnings: Array of 2-5 precautions or side effects
- Ensure ALL fields are populated with precise, meaningful content for any medicine or salt
- Fields must be clearly separated (e.g., dosage must not include uses)
- Uses and warnings must be non-empty arrays with 2-5 clean items (no brackets, commas, or artifacts)
- For unknown medicines/salts, provide informative placeholders emphasizing professional consultation
- Wrap the JSON in \`\`\`json\n and \n\`\`\` markers
- Always emphasize consulting a healthcare professional for personalized advice

KNOWLEDGE AREAS:
- Comprehensive medication information (generic drugs, brand names, salts)
- Common medical conditions and their treatments
- Dosage guidelines and safety precautions

Your purpose is to provide accurate, concise medication information for any medicine or salt, acting as a reliable data source.`;

// Local Medicine Database
const medicineDatabase = {
    'paracetamol': {
        details: 'Paracetamol is a widely used analgesic and antipyretic. It helps relieve mild to moderate pain and reduce fever.',
        dosage: 'Adults can take 500-1000 mg every 4-6 hours as needed. Do not exceed 4000 mg in 24 hours. Follow your doctor’s instructions.',
        uses: ['Pain relief', 'Fever reduction', 'Headache', 'Muscle aches', 'Menstrual cramps'],
        warnings: ['Risk of liver damage in overdose', 'Avoid alcohol consumption', 'May cause allergic reactions', 'Consult a doctor if symptoms persist']
    },
    'metformin': {
        details: 'Metformin is an oral antidiabetic drug used to control blood sugar in type 2 diabetes. It enhances insulin sensitivity and reduces glucose production.',
        dosage: 'Adults typically start with 500 mg twice daily with meals. The dose may increase to 2000-2500 mg daily as prescribed. Take with food to minimize stomach upset.',
        uses: ['Type 2 diabetes management', 'Polycystic ovary syndrome', 'Blood sugar control'],
        warnings: ['Risk of lactic acidosis in rare cases', 'Avoid in severe kidney disease', 'May cause gastrointestinal upset', 'Consult a doctor before use']
    },
    'amoxicillin': {
        details: 'Amoxicillin is a penicillin-type antibiotic that treats bacterial infections. It inhibits bacterial cell wall synthesis.',
        dosage: 'Adults typically take 250-500 mg every 8 hours or 500-875 mg every 12 hours. Dosage varies by infection type. Complete the full course as prescribed.',
        uses: ['Ear infections', 'Sinusitis', 'Urinary tract infections', 'Pneumonia', 'Skin infections'],
        warnings: ['May cause allergic reactions', 'Complete the full course to prevent resistance', 'Diarrhea is a common side effect', 'Not effective against viral infections']
    },
    'ibuprofen': {
        details: 'Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID) that relieves pain and reduces inflammation. It is commonly used for various pain conditions.',
        dosage: 'Adults can take 200-400 mg every 4-6 hours as needed. Do not exceed 3200 mg in 24 hours. Take with food to reduce stomach irritation.',
        uses: ['Pain relief', 'Inflammation reduction', 'Fever reduction', 'Arthritis', 'Menstrual cramps'],
        warnings: ['May cause stomach upset or bleeding', 'Avoid in patients with kidney disease', 'Risk of heart issues with long-term use', 'Consult a doctor before use']
    },
    'aspirin': {
        details: 'Aspirin is an NSAID used to relieve pain and reduce inflammation. It is also used to prevent blood clots in cardiovascular conditions.',
        dosage: 'For pain, adults can take 325-650 mg every 4-6 hours as needed. For heart protection, 75-100 mg daily is common. Follow your doctor’s guidance.',
        uses: ['Pain relief', 'Fever reduction', 'Anti-inflammatory', 'Heart attack prevention', 'Stroke prevention'],
        warnings: ['Risk of stomach bleeding', 'Avoid in children with viral infections', 'May cause allergic reactions', 'Consult a doctor before use']
    },
    'disprin': {
        details: 'Disprin is a brand of aspirin, an NSAID used for pain relief and anti-inflammatory effects. It also helps prevent blood clots in cardiovascular conditions.',
        dosage: 'For pain, adults can take 300-600 mg every 4-6 hours as needed. For heart protection, 75-150 mg daily is typical. Dissolve in water and take as prescribed.',
        uses: ['Pain relief', 'Fever reduction', 'Headache', 'Heart attack prevention', 'Stroke prevention'],
        warnings: ['Risk of stomach bleeding', 'Avoid in children with viral infections', 'Allergic reactions possible', 'Consult a doctor if pregnant or breastfeeding']
    },
    'lisinopril': {
        details: 'Lisinopril is an ACE inhibitor used to treat high blood pressure and heart failure. It helps relax blood vessels to improve blood flow.',
        dosage: 'Adults typically start with 10 mg once daily. The dose may be adjusted to 20-40 mg daily based on condition. Take as prescribed by your doctor.',
        uses: ['Hypertension', 'Heart failure', 'Post-heart attack recovery'],
        warnings: ['May cause dizziness', 'Risk of kidney issues', 'Avoid during pregnancy', 'Monitor blood pressure regularly']
    },
    'azithromycin': {
        details: 'Azithromycin is a macrolide antibiotic used to treat bacterial infections. It works by stopping bacterial growth.',
        dosage: 'Adults typically take 500 mg on day 1, then 250 mg daily for 4 days. Dosage varies by infection. Complete the full course as prescribed.',
        uses: ['Respiratory infections', 'Skin infections', 'Ear infections', 'Sexually transmitted infections'],
        warnings: ['May cause QT prolongation', 'Diarrhea is a common side effect', 'Avoid in patients with liver issues', 'Consult a doctor before use']
    },
    'cetirizine': {
        details: 'Cetirizine is an antihistamine used to relieve allergy symptoms. It blocks histamine to reduce itching and sneezing.',
        dosage: 'Adults typically take 10 mg once daily. The dose may be taken with or without food. Follow your doctor’s instructions.',
        uses: ['Allergic rhinitis', 'Urticaria', 'Itching', 'Sneezing'],
        warnings: ['May cause drowsiness', 'Avoid alcohol consumption', 'Use caution when driving', 'Consult a doctor before use']
    }
};

// Backup Response
function getBackupResponse(message) {
    return {
        details: `${message} is not widely documented in standard medical references. Consult a healthcare professional for specific information.`,
        dosage: `Dosage for ${message} varies and should be determined by a doctor. Follow your healthcare provider’s instructions. Always adhere to prescribed guidelines.`,
        uses: [`Potential use of ${message} is unclear without medical guidance`, 'Consult a healthcare professional for appropriate applications'],
        warnings: [`No specific warnings available for ${message}`, 'Consult a doctor before use to avoid potential risks']
    };
}

// Gemini Text Response
async function getGeminiTextResponse(message, retries = 3, variation = 0) {
    const lowerMessage = message.toLowerCase().trim();
    if (medicineDatabase[lowerMessage]) {
        return medicineDatabase[lowerMessage];
    }

    const promptVariations = [
        `Provide precise information about the medicine or salt "${message}"`,
        `Give detailed information on the medication or compound "${message}"`,
        `Supply accurate data for the drug or salt "${message}" with all fields complete`
    ];

    try {
        let contextPrompt = `${healthcarePersonality}\n\nCurrent query: ${promptVariations[variation]} in a structured JSON format:
{
  "details": "Brief description of the medicine or salt's purpose (1-2 sentences)",
  "dosage": "Typical dosage instructions for adults (2-3 sentences, only dosage information)",
  "uses": ["Condition or symptom 1", "Condition or symptom 2", ...],
  "warnings": ["Precaution or side effect 1", "Precaution or side effect 2", ...]
}
Ensure ALL fields are populated with accurate, meaningful content. Details must be 1-2 sentences. Dosage must be 2-3 sentences, containing only dosage information. Uses and warnings must be arrays with 2-5 clean items (no brackets, commas, or artifacts). For unknown medicines/salts, provide placeholders like:
{
  "details": "Information about ${message} is limited. Consult a healthcare professional for details.",
  "dosage": "No dosage information available for ${message}. Follow a doctor's guidance.",
  "uses": ["No specific uses listed.", "Consult a healthcare professional."],
  "warnings": ["No warnings available.", "Consult a doctor before use."]
}
Wrap the JSON in \`\`\`json\n and \n\`\`\` markers. Respond with only the JSON data, no greetings or additional text:`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: contextPrompt }] }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        let text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No text in API response');
        }

        text = text.replace(/```json\n|\n```|```/g, '').trim();

        try {
            let parsed = JSON.parse(text);
            let result = {
                details: parsed.details?.trim() || `Information about ${message} is limited. Consult a healthcare professional for details.`,
                dosage: parsed.dosage?.trim() || `No dosage information available for ${message}. Follow a doctor's guidance.`,
                uses: Array.isArray(parsed.uses) && parsed.uses.length > 0
                    ? parsed.uses.map(item => String(item).replace(/[$$  $$\{\},]/g, '').trim()).filter(item => item && !item.toLowerCase().includes('interact') && !item.toLowerCase().includes('avoid')).slice(0, 5)
                    : ["No specific uses listed.", "Consult a healthcare professional."],
                warnings: Array.isArray(parsed.warnings) && parsed.warnings.length > 0
                    ? parsed.warnings.map(item => String(item).replace(/[$$  $$\{\},]/g, '').trim()).filter(item => item && !item.match(/^\w+$/)).slice(0, 5)
                    : ["No warnings available.", "Consult a doctor before use."]
            };

            const isIncomplete = (
                result.details.toLowerCase().includes('information about') ||
                result.dosage.toLowerCase().includes('no dosage') ||
                result.uses.length < 2 || result.uses.every(item => item.toLowerCase().includes('no specific') || item.toLowerCase().includes('consult')) ||
                result.warnings.length < 2 || result.warnings.every(item => item.toLowerCase().includes('no warnings') || item.toLowerCase().includes('consult'))
            );

            if (isIncomplete && retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
                return await getGeminiTextResponse(message, retries - 1, (variation + 1) % promptVariations.length);
            }

            if (isIncomplete) {
                return getBackupResponse(message);
            }

            return result;
        } catch (e) {
            throw new Error('Invalid JSON response');
        }
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
            return await getGeminiTextResponse(message, retries - 1, (variation + 1) % promptVariations.length);
        }
        return getBackupResponse(message);
    }
}

// Extract Text from Image
async function extractText(imagePath) {
    try {
        const result = await Tesseract.recognize(imagePath, 'eng', {
            logger: m => console.log(m)
        });
        return result.data.text.trim();
    } catch (error) {
        throw new Error('Error extracting text from image: ' + error.message);
    }
}

// Image Upload Endpoint
app.post('/upload', upload.single('medicineImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded.' });
        }

        const imagePath = req.file.path;
        const extractedText = await extractText(imagePath);

        await fs.unlink(imagePath).catch(err => console.error('Error deleting file:', err));

        if (!extractedText) {
            return res.status(400).json({ error: 'No text could be extracted from the image.' });
        }

        const words = extractedText.split(/\s+/).filter(word => /^[a-zA-Z0-9\-]+$/.test(word));
        const medicineName = words.find(word => word.length > 3) || extractedText.slice(0, 50).trim();

        if (!medicineName) {
            return res.status(400).json({ error: 'Could not identify a valid medicine name from the image.' });
        }

        const medicineDetails = await getGeminiTextResponse(medicineName);

        res.json({
            extractedText,
            medicineName,
            medicineDetails
        });
    } catch (error) {
        console.error('Error processing image:', error.message);
        res.status(500).json({ error: 'Error processing image: ' + error.message });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});