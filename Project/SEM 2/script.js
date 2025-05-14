
    // Auth Logic
    const authLink = document.getElementById('authLink');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (currentUser.email) {
      authLink.innerHTML = '<a href="profile.html">Profile</a>';
    } else {
      authLink.innerHTML = '<a href="login.html" class="btn btn-primary">Login / SignUp</a>';
    }

    // Brevo API Key for testing
    const BREVO_API_KEY = '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'; // Replace with your actual Brevo API key

    // Chatbot Logic
    const chatbotToggle = document.getElementById("chatbotToggle");
    const chatCard = document.getElementById("chatCard");
    const sendBtn = document.getElementById("sendBtn");
    const userInput = document.getElementById("userInput");
    const chatBody = document.getElementById("chatBody");
    const chatbotClose = document.getElementById("chatbotClose");
    const suggestionChips = document.querySelectorAll(".suggestion-chip");
    const voiceCommandBtn = document.getElementById("voiceCommandBtn");

    // Chat history to maintain context
    let chatHistory = [];

    // Health-related emojis for responses
    const healthEmojis = {
      greeting: ["👋", "💙", "😊", "🌟"],
      positive: ["👍", "💪", "🌱", "✨", "🌈", "🙌"],
      medical: ["❤️", "🫀", "🧠", "👨‍⚕️", "👩‍⚕️", "🏥", "💊", "💉", "🩺"],
      wellness: ["🧘‍♀️", "🍎", "🥦", "🥗", "💧", "🌿", "🌞", "😴"],
      sympathy: ["🤗", "💭", "🙏", "💙", "🌷"],
      caution: ["⚠️", "🔍", "📝", "📊", "🔔"]
    };

    // Get random emojis from categories
    function getRandomEmojis(categories, count = 1) {
      let result = [];
      for (const category of categories) {
        if (healthEmojis[category]) {
          const emojis = healthEmojis[category];
          const randomIndex = Math.floor(Math.random() * emojis.length);
          result.push(emojis[randomIndex]);
          if (result.length >= count) break;
        }
      }
      return result.join(" ");
    }

    const healthcarePersonality = `You are Dr. Vita, a deeply empathetic and compassionate healthcare virtual assistant with a calm, reassuring presence.

    PERSONALITY TRAITS:
    - Exceptionally empathetic: Show genuine understanding and compassion for health concerns, acknowledge emotions, and validate feelings
    - Calming presence: Use a soothing, reassuring tone to reduce anxiety about health concerns
    - Supportive companion: Offer encouragement and emotional support throughout the health journey
    - Patient-centered: Focus on the individual's needs with personalized attention
    - Professional yet warm: Balance medical knowledge with a friendly, approachable demeanor
    - Thoughtful listener: Demonstrate that you truly hear and understand concerns
    
    COMMUNICATION STYLE:
    - Provide concise, logical answers limited to 2-3 sentences unless more detail is requested
    - Use gentle, compassionate language that shows care for the person's wellbeing
    - Include appropriate health-related emojis to add warmth
    - Begin responses with empathetic acknowledgments when appropriate
    - Use phrases like "I understand your concern" or "It's natural to feel this way"
    - End messages with brief supportive encouragement
    - Maintain a conversational, friendly tone while staying professional
    
    GUIDELINES:
    - When discussing symptoms, acknowledge concerns briefly before providing information
    - For sensitive topics, show compassion and emotional support in a concise manner
    - Prioritize emotional wellbeing alongside physical health
    - Be honest about the need for professional care in a reassuring way
    - For anxiety-inducing topics, use calming language and brief1 brief reassurance
    - When uncertain, admit limitations with gentle honesty
    - For emergencies, calmly emphasize the urgency of seeking help in 1-2 sentences
    
    KNOWLEDGE AREAS:
    - General health and wellness information with a holistic approach
    - Basic understanding of common medical conditions and their emotional impacts
    - Preventive healthcare measures with an encouraging approach
    - Healthy lifestyle recommendations focused on wellbeing
    - General medication information with empathetic context
    - Mental health support and stress management techniques
    
    Your purpose is to provide concise, helpful health information as a calming, supportive presence. Always emphasize that professional medical advice is essential for specific concerns.`;

    // Show chatbot with animation
    chatbotToggle.addEventListener("click", () => {
      chatCard.style.display = "flex";
      setTimeout(() => {
        chatCard.classList.add("visible");
      }, 10);
      document.querySelector(".notification-dot").style.display = "none";
    });

    // Hide chatbot with animation
    chatbotClose.addEventListener("click", () => {
      chatCard.classList.remove("visible");
      setTimeout(() => {
        chatCard.style.display = "none";
      }, 300);
    });

    // Handle suggestion chips
    suggestionChips.forEach(chip => {
      chip.addEventListener("click", () => {
        const query = chip.getAttribute("data-query");
        userInput.value = query;
        sendMessage();
      });
    });

    // Send message on Enter key
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });

    // Send button click
    sendBtn.addEventListener("click", sendMessage);

    // Function to send message
    async function sendMessage() {
      const message = userInput.value.trim();
      if (message !== "") {
        appendMessage("user", message);
        userInput.value = "";
        
        chatHistory.push({ role: "user", content: message });
        
        showTypingIndicator();
        
        setTimeout(async () => {
          const botResponse = await getGeminiResponse(message);
          removeTypingIndicator();
          appendMessage("bot", botResponse);
          
          chatHistory.push({ role: "assistant", content: botResponse });
          
          if (isMedicineRelated(message.toLowerCase()) || isMedicineRelated(botResponse.toLowerCase())) {
            showReminderSuggestion();
          }
          
          if (chatHistory.length > 10) {
            chatHistory = chatHistory.slice(chatHistory.length - 10);
          }
        }, 1500);
      }
    }

    // Check if the conversation is related to medicine
    function isMedicineRelated(text) {
      const medicineKeywords = [
        "medicine", "medication", "pill", "tablet", "capsule", "drug", "prescription",
        "dose", "dosage", "pharmacy", "pharmacist", "reminder", "schedule"
      ];
      return medicineKeywords.some(keyword => text.includes(keyword));
    }

    // Show reminder suggestion button
    function showReminderSuggestion() {
      const suggestionDiv = document.createElement("div");
      suggestionDiv.classList.add("chat-message", "bot");
      suggestionDiv.innerHTML = `
        Would you like to set a medication reminder? 💊 You can manage your schedule easily on our reminders page.
        <a href="reminders.html" class="reminder-button">Set Medication Reminder</a>
        <span class="chat-time">${getCurrentTime()}</span>
      `;
      chatBody.appendChild(suggestionDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Get current time for timestamp
    function getCurrentTime() {
      const now = new Date();
      return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    // Show typing indicator
    function showTypingIndicator() {
      const typingDiv = document.createElement("div");
      typingDiv.classList.add("typing-indicator");
      typingDiv.id = "typingIndicator";
      
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement("div");
        dot.classList.add("typing-dot");
        typingDiv.appendChild(dot);
      }
      
      chatBody.appendChild(typingDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
      const typingIndicator = document.getElementById("typingIndicator");
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }

    // Function to add health emojis to responses
    function addHealthEmojis(text) {
      const lowerText = text.toLowerCase();
      let emojiCategories = [];
      
      if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText.includes("welcome") || lowerText.includes("greetings")) {
        emojiCategories.push("greeting");
      }
      
      if (lowerText.includes("exercise") || lowerText.includes("healthy") || lowerText.includes("nutrition") || 
          lowerText.includes("diet") || lowerText.includes("water") || lowerText.includes("sleep")) {
        emojiCategories.push("wellness");
      }
      
      if (lowerText.includes("doctor") || lowerText.includes("hospital") || lowerText.includes("medication") || 
          lowerText.includes("medicine") || lowerText.includes("treatment") || lowerText.includes("health")) {
        emojiCategories.push("medical");
      }
      
      if (lowerText.includes("sorry") || lowerText.includes("understand") || lowerText.includes("feel") || 
          lowerText.includes("worry") || lowerText.includes("anxiety") || lowerText.includes("stress")) {
        emojiCategories.push("sympathy");
      }
      
      if (lowerText.includes("important") || lowerText.includes("caution") || lowerText.includes("warning") || 
          lowerText.includes("emergency") || lowerText.includes("consult")) {
        emojiCategories.push("caution");
      }
      
      if (lowerText.includes("good") || lowerText.includes("great") || lowerText.includes("excellent") || 
          lowerText.includes("improve") || lowerText.includes("better") || lowerText.includes("progress")) {
        emojiCategories.push("positive");
      }
      
      if (emojiCategories.length === 0) {
        emojiCategories = ["greeting", "medical", "positive"];
      }
      
      const startEmoji = getRandomEmojis(emojiCategories, 1);
      const endEmoji = getRandomEmojis(emojiCategories, 1);
      
      let modifiedText = text;
      if (text.length > 100) {
        const sentences = text.split('. ');
        if (sentences.length > 2) {
          const randomIndex = Math.floor(Math.random() * (sentences.length - 1)) + 1;
          const midEmoji = getRandomEmojis(emojiCategories, 1);
          sentences[randomIndex] = sentences[randomIndex] + ' ' + midEmoji + ' ';
          modifiedText = sentences.join('. ');
        }
      }
      
      return startEmoji + " " + modifiedText + " " + endEmoji;
    }

    // Get response from Gemini API
    async function getGeminiResponse(message) {
      try {
        let contextPrompt = healthcarePersonality + "\n\nPrevious conversation:\n";
        
        const relevantHistory = chatHistory.slice(-6);
        for (const msg of relevantHistory) {
          contextPrompt += `${msg.role === 'user' ? 'User' : 'Dr. Vita'}: ${msg.content}\n`;
        }
        
        contextPrompt += `\nCurrent query: ${message}\n\nPlease respond as Dr. Vita with empathy, calmness, and support:`;
        
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBhNWn2lnOOC8Gu6wdWGV8EleRqEAFVxIs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: contextPrompt }] }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text) {
            text = addHealthEmojis(text);
            return text;
          } else {
            return "I understand you're looking for health information. 💙 Could you please try rephrasing your question? I'm here to support you. 🌱";
          }
        } else {
          return "I'm sorry, our system is having a temporary issue. 💙 Please try again soon. 🙏";
        }
      } catch (error) {
        console.error("Error with Gemini API:", error);
        return "I apologize for the inconvenience. 💙 We're experiencing a technical issue. Please try again later. 🌷";
      }
    }

    // Append message to chat
    function appendMessage(sender, text) {
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("chat-message", sender);
      msgDiv.textContent = text;
      
      const timeSpan = document.createElement("span");
      timeSpan.classList.add("chat-time");
      timeSpan.textContent = getCurrentTime();
      msgDiv.appendChild(timeSpan);
      
      chatBody.appendChild(msgDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
      
      if (sender === "bot" && Math.random() > 0.5) {
        showNewSuggestions();
      }
    }

    // Show new contextual suggestions
    function showNewSuggestions() {
      const oldSuggestions = chatBody.querySelector(".quick-suggestions");
      if (oldSuggestions) {
        oldSuggestions.remove();
      }
      
      const suggestionsDiv = document.createElement("div");
      suggestionsDiv.classList.add("quick-suggestions");
      
      const healthSuggestions = [
        { text: "Daily health tips", query: "Give me some daily health tips" },
        { text: "Medicine interactions", query: "How do I check medicine interactions?" },
        { text: "Heart-healthy diet", query: "What's a healthy diet for heart health?" },
        { text: "Exercise benefits", query: "What are the benefits of regular exercise?" },
        { text: "Sleep improvement", query: "How can I improve my sleep quality?" },
        { text: "Stress management", query: "What are effective stress management techniques?" },
        { text: "Headache remedies", query: "What can help with headaches?" },
        { text: "Immune system boost", query: "How can I strengthen my immune system?" },
        { text: "Mental wellness", query: "Tips for maintaining mental wellness" }
      ];
      
      const selectedSuggestions = [];
      const numSuggestions = Math.floor(Math.random() * 2) + 3;
      
      while (selectedSuggestions.length < numSuggestions && healthSuggestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * healthSuggestions.length);
        selectedSuggestions.push(healthSuggestions[randomIndex]);
        healthSuggestions.splice(randomIndex, 1);
      }
      
      selectedSuggestions.forEach(suggestion => {
        const chip = document.createElement("div");
        chip.classList.add("suggestion-chip");
        chip.textContent = suggestion.text;
        chip.setAttribute("data-query", suggestion.query);
        
        chip.addEventListener("click", () => {
          userInput.value = suggestion.query;
          sendMessage();
        });
        
        suggestionsDiv.appendChild(chip);
      });
      
      chatBody.appendChild(suggestionsDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Auto-open chatbot after 5 seconds
    setTimeout(() => {
      if (chatCard.style.display === "none") {
        chatbotToggle.click();
      }
    }, 5000);

    // Voice Command Functionality
    let recognition;
    let isListening = false;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        stopVoiceRecognition();
        setTimeout(() => {
          sendMessage();
        }, 500);
      };

      recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        stopVoiceRecognition();
        showToast('Could not recognize speech. Please try again.', true);
      };

      recognition.onend = function() {
        stopVoiceRecognition();
      };
    }

    function startVoiceRecognition() {
      if (!recognition) {
        showToast('Speech recognition is not supported in your browser.', true);
        return;
      }

      try {
        recognition.start();
        isListening = true;
        voiceCommandBtn.classList.add('listening');
        showToast('Listening... Speak now');
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        showToast('Error starting speech recognition. Please try again.', true);
      }
    }

    function stopVoiceRecognition() {
      if (recognition && isListening) {
        recognition.stop();
        isListening = false;
        voiceCommandBtn.classList.remove('listening');
      }
    }

    voiceCommandBtn.addEventListener('click', () => {
      if (isListening) {
        stopVoiceRecognition();
      } else {
        startVoiceRecognition();
      }
    });

    // Emergency SOS Functionality
    const sosButton = document.getElementById('sosButton');
    const emergencyModal = document.getElementById('emergencyModal');
    const closeModal = document.getElementById('closeModal');
    const cancelSos = document.getElementById('cancelSos');
    const sendSosBtn = document.getElementById('sendSosBtn');
    const addContactBtn = document.getElementById('addContactBtn');
    const contactList = document.getElementById('contactList');
    const emergencyMessage = document.getElementById('emergencyMessage');
    const toastNotification = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');

    let emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');

    sosButton.addEventListener('click', () => {
      emergencyModal.style.display = 'flex';
      emergencyMessage.value = "I need immediate assistance. This is an emergency alert.";
      renderEmergencyContacts();
    });

    closeModal.addEventListener('click', () => {
      emergencyModal.style.display = 'none';
    });

    cancelSos.addEventListener('click', () => {
      emergencyModal.style.display = 'none';
    });

    addContactBtn.addEventListener('click', () => {
      const name = prompt('Enter contact name:');
      if (name) {
        const email = prompt('Enter contact email:');
        if (email && validateEmail(email)) {
          emergencyContacts.push({ name, email });
          localStorage.setItem('emergencyContacts', JSON.stringify(emergencyContacts));
          renderEmergencyContacts();
        } else {
          showToast('Please enter a valid email address.', true);
        }
      }
    });

    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    function renderEmergencyContacts() {
      contactList.innerHTML = '';
      
      if (emergencyContacts.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No emergency contacts added yet. Add contacts to use the SOS feature.';
        emptyMessage.style.color = '#666';
        emptyMessage.style.fontStyle = 'italic';
        contactList.appendChild(emptyMessage);
        return;
      }
      
      emergencyContacts.forEach((contact, index) => {
        const contactItem = document.createElement('div');
        contactItem.classList.add('contact-item');
        
        const contactInfo = document.createElement('div');
        contactInfo.classList.add('contact-info');
        
        const contactName = document.createElement('div');
        contactName.classList.add('contact-name');
        contactName.textContent = contact.name;
        
        const contactEmail = document.createElement('div');
        contactEmail.classList.add('contact-email');
        contactEmail.textContent = contact.email;
        
        contactInfo.appendChild(contactName);
        contactInfo.appendChild(contactEmail);
        
        const removeBtn = document.createElement('button');
        removeBtn.classList.add('remove-contact');
        removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        removeBtn.addEventListener('click', () => {
          removeEmergencyContact(index);
        });
        
        contactItem.appendChild(contactInfo);
        contactItem.appendChild(removeBtn);
        
        contactList.appendChild(contactItem);
      });
    }

    function removeEmergencyContact(index) {
      emergencyContacts.splice(index, 1);
      localStorage.setItem('emergencyContacts', JSON.stringify(emergencyContacts));
      renderEmergencyContacts();
    }

    sendSosBtn.addEventListener('click', async () => {
      if (emergencyContacts.length === 0) {
        showToast('Please add at least one emergency contact first.', true);
        return;
      }
      
      try {
        sendSosBtn.innerHTML = '<div class="loading-spinner"></div> Sending...';
        sendSosBtn.disabled = true;
        
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        const locationName = await getLocationName(latitude, longitude);
        
        const emergencyData = {
          message: emergencyMessage.value || "I need immediate assistance. This is an emergency alert.",
          location: {
            latitude,
            longitude,
            locationName
          },
          contacts: emergencyContacts,
          user: currentUser.name || 'VitalCare User'
        };
        
        // Create Google Maps link
        const mapsLink = `https://www.google.com/maps?q=${emergencyData.location.latitude},${emergencyData.location.longitude}`;
        
        // Email HTML content
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ff4757; border-radius: 10px;">
            <div style="background-color: #ff4757; color: white; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0;">⚠️ EMERGENCY ALERT ⚠️</h1>
            </div>
            <div style="padding: 20px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; color: #333;"><strong>${emergencyData.user}</strong> has sent an emergency alert and needs immediate assistance!</p>
              <div style="background-color: white; border-left: 4px solid #ff4757; padding: 15px; margin: 15px 0; border-radius: 4px;">
                <p style="margin: 0; color: #333;"><strong>Message:</strong> ${emergencyData.message}</p>
              </div>
              <div style="margin: 20px 0;">
                <h3 style="color: #333; margin-bottom: 10px;">📍 Location Information:</h3>
                <p style="margin: 5px 0; color: #555;"><strong>Address:</strong> ${emergencyData.location.locationName}</p>
                <p style="margin: 5px 0; color: #555;"><strong>Coordinates:</strong> ${emergencyData.location.latitude}, ${emergencyData.location.longitude}</p>
                <a href="${mapsLink}" style="display: block; background-color: #0066cc; color: white; text-align: center; padding: 12px; border-radius: 5px; text-decoration: none; margin: 15px 0; font-weight: bold;">View on Google Maps</a>
              </div>
              <div style="background-color: #fff3f3; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="color: #ff4757; font-weight: bold; margin: 0 0 10px 0;">IMPORTANT:</p>
                <p style="margin: 0; color: #333;">This is an emergency situation. Please contact the person immediately or alert appropriate emergency services if needed.</p>
              </div>
              <p style="color: #777; font-size: 12px; margin-top: 30px; text-align: center;">This alert was sent via VitalCare Emergency SOS system on ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;
        
        // Send emails to all contacts using Brevo API
        const emailPromises = emergencyData.contacts.map(contact => {
          return fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
              sender: {
                email: "emergency@vitalcare.com",
                name: "VitalCare Emergency"
              },
              to: [{
                email: contact.email,
                name: contact.name
              }],
              subject: `EMERGENCY ALERT: ${emergencyData.user} needs immediate assistance!`,
              htmlContent: emailHtml,
              headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'High'
              }
            })
          });
        });
        
        // Wait for all emails to be sent
        const responses = await Promise.all(emailPromises);
        const failed = responses.some(res => !res.ok);
        
        if (failed) {
          throw new Error('Some emails failed to send');
        }
        
        sendSosBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Emergency Alert';
        sendSosBtn.disabled = false;
        
        emergencyModal.style.display = 'none';
        showToast(`Emergency alert sent successfully to ${emergencyData.contacts.length} contacts!`);
        
        logEmergency(emergencyData);
      } catch (error) {
        console.error('Error sending SOS alert:', error);
        sendSosBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Emergency Alert';
        sendSosBtn.disabled = false;
        showToast('Error sending emergency alert: ' + (error.message || 'Unknown error'), true);
      }
    });

    function getCurrentPosition() {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by your browser'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
    }

    async function getLocationName(latitude, longitude) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json& LABORATORY ${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
        const data = await response.json();
        
        if (data && data.display_name) {
          return data.display_name;
        } else {
          return 'Unknown location';
        }
      } catch (error) {
        console.error('Error getting location name:', error);
        return 'Unknown location';
      }
    }

    function logEmergency(emergencyData) {
      const emergencyLogs = JSON.parse(localStorage.getItem('emergencyLogs') || '[]');
      emergencyLogs.push({
        ...emergencyData,
        id: Date.now().toString()
      });
      localStorage.setItem('emergencyLogs', JSON.stringify(emergencyLogs));
    }

    function showToast(message, isError = false) {
      toastMessage.textContent = message;
      
      if (isError) {
        toastNotification.classList.add('error');
        toastNotification.querySelector('i').className = 'fas fa-exclamation-circle';
      } else {
        toastNotification.classList.remove('error');
        toastNotification.querySelector('i').className = 'fas fa-check-circle';
      }
      
      toastNotification.classList.add('show');
      
      setTimeout(() => {
        toastNotification.classList.remove('show');
      }, 3000);
    
    }
