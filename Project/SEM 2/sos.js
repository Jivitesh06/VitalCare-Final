document.addEventListener('DOMContentLoaded', function () {
  // Check if SOS elements exist
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

  // Verify all required elements are present
  if (!sosButton || !emergencyModal || !closeModal || !cancelSos || !sendSosBtn || 
      !addContactBtn || !contactList || !emergencyMessage || !toastNotification || !toastMessage) {
    console.warn('One or more SOS elements are missing. Ensure SOS HTML is correctly included.');
    return;
  }

  // SOS Functionality
  const BREVO_API_KEY = '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';
  let emergencyContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');

  sosButton.addEventListener('click', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.email) {
      alert('Please login to use the SOS feature.');
      window.location.href = 'login.html';
      return;
    }
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
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const user = users[currentUser.email] || {};
      const emergencyData = {
        message: emergencyMessage.value || "I need immediate assistance. This is an emergency alert.",
        location: { latitude, longitude, locationName },
        contacts: emergencyContacts,
        user: currentUser.name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'VitalCare User')
      };
      const mapsLink = `https://www.google.com/maps?q=${emergencyData.location.latitude},${emergencyData.location.longitude}`;
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
      const emailPromises = emergencyData.contacts.map(contact => {
        return fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY
          },
          body: JSON.stringify({
            sender: {
              email: "vitalcare.alert@gmail.com",
              name: "VitalCare Emergency"
            },
            to: [{ email: contact.email, name: contact.name }],
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
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
      const data = await response.json();
      return data?.display_name || 'Unknown location';
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

  // Initial render of emergency contacts
  renderEmergencyContacts();
});