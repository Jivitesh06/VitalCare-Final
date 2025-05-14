const prompt = document.querySelector("#prompt");
const submitBtn = document.querySelector("#submit");
const chatContainer = document.querySelector(".chat-container");
const imageBtn = document.querySelector("#image");
const image = document.querySelector("#image img");
const imageInput = document.querySelector("#image input");

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDhrUMiFxguqs-qGg7DzNrDZhpKQOJmB-M";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

// Improved error handling and response processing
async function generateResponse(aiChatBox) {
    const text = aiChatBox.querySelector(".ai-chat-area");
    
    const requestPayload = {
        contents: [{
            parts: [
                { text: user.message },
                ...(user.file.data ? [{ inline_data: user.file }] : [])
            ]
        }]
    };

    const requestOptions = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
    };

    try {
        text.innerHTML = '<img src="loading.webp" alt="Loading..." class="load" width="50px">';
        
        const response = await fetch(API_URL, requestOptions);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error("Invalid API response structure");
        }
        
        // Preserve line breaks and only remove markdown bold formatting
        const apiResponse = data.candidates[0].content.parts[0].text
            .replace(/\*\*(.*?)\*\*/g, "$1") // Remove markdown bold
            .replace(/\n/g, "<br>"); // Convert newlines to HTML line breaks
            
        text.innerHTML = apiResponse;
    } catch (error) {
        console.error("Error generating response:", error);
        text.innerHTML = "Sorry, I encountered an error. Please try again.";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        resetImageInput();
    }
}

function resetImageInput() {
    image.src = "img.svg";
    image.classList.remove("choose");
    imageInput.value = ""; // Clear the file input
    user.file = {
        mime_type: null,
        data: null
    };
}

function createChatBox(html, className) {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(className);
    return div;
}

function handleChatResponse(userMessage) {
    // Validate input
    if (!userMessage.trim() && !user.file.data) return;
    
    user.message = userMessage || ""; // Handle empty message with image case
    
    const html = `
        <img src="user.png" alt="User" id="userImage" width="8%">
        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" alt="Uploaded image" />` : ""}
        </div>
    `;
    
    prompt.value = "";
    const userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    // Add slight delay before showing AI response
    setTimeout(() => {
        const html = `
            <img src="ai.png" alt="AI Assistant" id="aiImage" width="10%">
            <div class="ai-chat-area">
                <img src="loading.webp" alt="Thinking..." class="load" width="50px">
            </div>
        `;
        const aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

// Event Listeners with improved handling
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (prompt.value.trim() || user.file.data)) {
        handleChatResponse(prompt.value);
    }
});

submitBtn.addEventListener("click", () => {
    if (prompt.value.trim() || user.file.data) {
        handleChatResponse(prompt.value);
    }
});

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
        const base64String = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64String
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };
    
    reader.onerror = () => {
        console.error("Error reading file");
        resetImageInput();
    };
    
    reader.readAsDataURL(file);
});

imageBtn.addEventListener("click", () => {
    imageInput.click();
});