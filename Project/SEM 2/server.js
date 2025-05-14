// Add this at the top of the <script> section, just after the initial auth logic
const BREVO_API_KEY = 'your_brevo_api_key_here'; // Replace with your actual Brevo API key

// ... (other code remains unchanged until the sendSosBtn event listener)

// Updated sendSosBtn event listener
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