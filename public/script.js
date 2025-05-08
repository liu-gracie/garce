// let selectedMode = null;

// function chooseMode(mode) {
//   selectedMode = mode; // 'chat' or 'call'
//   document.getElementById('landing').style.display = 'none';
//   document.getElementById('identity').style.display = 'block';
// }

// function goBack() {
//   document.getElementById('identity').style.display = 'none';
//   document.getElementById('landing').style.display = 'block';
// }

// function selectIdentity(role) {
//   localStorage.setItem('grace_identity', role);

//   // Optional: log greeting before navigating (for future animation/display purposes)
//   const responseText = document.getElementById('responseText');
//   if (responseText) {
//     let message = '';
//     switch (role) {
//       case 'mother':
//         message = "Hi Mother, I'm doing well.<br>Do you miss me?";
//         break;
//       case 'professor':
//         message = "Hi Professor, sorry for missing class.<br>I can still do my homework!";
//         break;
//       case 'friend':
//         message = "Hiiiiii how are you :)<br>How have you been?";
//         break;
//     }
//     responseText.innerHTML = message;
//   }

//   // Redirect based on selected mode
//   if (selectedMode === 'chat') {
//     window.location.href = 'chat.html';
//   } else if (selectedMode === 'call') {
//     window.location.href = 'call.html';
//   }
// }

// function signOut() {
//   document.getElementById('response').style.display = 'none';
//   document.getElementById('landing').style.display = 'block';
// }

// // Chat page interaction
// async function sendMessage() {
//   const messageInput = document.getElementById('userMessage');
//   const message = messageInput.value.trim();
//   const chatArea = document.getElementById('chatArea');

//   if (!message) return;

//   // Add user message
//   const userBubble = document.createElement('div');
//   userBubble.className = 'chat-bubble user';
//   userBubble.textContent = message;
//   chatArea.appendChild(userBubble);
//   messageInput.value = '';

//   chatArea.scrollTop = chatArea.scrollHeight;

//   // Check if message contains image-related keywords
//   const imageKeywords = ['draw', 'generate', 'picture', 'paint', 'visualize'];
//   const shouldGenerateImage = imageKeywords.some(word => message.toLowerCase().includes(word));

//   const thinking = document.createElement('div');
//   thinking.className = 'chat-bubble gpt';
//   chatArea.appendChild(thinking);
//   chatArea.scrollTop = chatArea.scrollHeight;

//   if (shouldGenerateImage) {
//     thinking.textContent = '🎨 Generating image...';

//     try {
//       const imageResponse = await fetch('/api/image', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: message })
//       });
//       const imageData = await imageResponse.json();

//       if (imageData.image_url) {
//         thinking.innerHTML = `<img src="${imageData.image_url}" alt="Generated image" style="max-width:100%; border: 5px solid black; border-radius: 20px;" />`;
//       } else {
//         thinking.textContent = '⚠️ Image generation failed.';
//       }
//     } catch (err) {
//       console.error('Image generation error:', err);
//       thinking.textContent = '⚠️ Error generating image.';
//     }

//   } else {
//     thinking.textContent = 'Thinking...';

//     try {
//       const response = await fetch("/api/message", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message })
//       });

//       const data = await response.json();

//       if (!data.choices || !data.choices.length) {
//         thinking.textContent = "⚠️ Grace didn't respond. Try again.";
//         return;
//       }

//       thinking.textContent = data.choices[0].message.content;

//     } catch (error) {
//       console.error("Error contacting server:", error);
//       thinking.textContent = "⚠️ Something went wrong. Please try again.";
//     }

//     chatArea.scrollTop = chatArea.scrollHeight;
//   }
// }



let selectedMode = null;

function chooseMode(mode) {
  selectedMode = mode; // 'chat' or 'call'
  localStorage.setItem('grace_mode', mode);
  document.getElementById('landing').style.display = 'none';
  document.getElementById('identity').style.display = 'block';
}

function goBack() {
  document.getElementById('identity').style.display = 'none';
  document.getElementById('landing').style.display = 'block';
}

function selectIdentity(role) {
  localStorage.setItem('grace_identity', role);

  // Optional: log greeting before navigating (for future animation/display purposes)
  const responseText = document.getElementById('responseText');
  if (responseText) {
    let message = '';
    switch (role) {
      case 'mother':
        message = "Hi Mother, I'm doing well.<br>Do you miss me?";
        break;
      case 'professor':
        message = "Hi Professor, sorry for missing class.<br>I can still do my homework!";
        break;
      case 'friend':
        message = "Hiiiiii how are you :)<br>How have you been?";
        break;
    }
    responseText.innerHTML = message;
  }

  const mode = localStorage.getItem('grace_mode');
  if (mode === 'chat') {
    window.location.href = 'chat.html';
  } else if (mode === 'call') {
    window.location.href = 'call.html';
  }
}

function signOut() {
  document.getElementById('response').style.display = 'none';
  document.getElementById('landing').style.display = 'block';
}

// Utility: personalized greeting
function getGreeting(identity) {
  const greetings = {
    mother: "Hi mother, how are you?",
    professor: "Hello professor, how have you been?",
    friend: "Hi bestie, what's up?"
  };
  return greetings[identity] || "Send Grace a text message!";
}

// Used in chat.html and call.html to update the header
function updateGreeting(selector) {
  const identity = localStorage.getItem('grace_identity');
  const element = document.querySelector(selector);
  if (element) {
    element.textContent = getGreeting(identity);
  }
}

// Chat page interaction
async function sendMessage() {
  const messageInput = document.getElementById('userMessage');
  const message = messageInput.value.trim();
  const chatArea = document.getElementById('chatArea');

  if (!message) return;

  // Add user message
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.textContent = message;
  chatArea.appendChild(userBubble);
  messageInput.value = '';

  chatArea.scrollTop = chatArea.scrollHeight;

  // Check if message contains image-related keywords
  const imageKeywords = ['draw', 'generate', 'picture', 'paint', 'visualize'];
  const shouldGenerateImage = imageKeywords.some(word => message.toLowerCase().includes(word));

  const thinking = document.createElement('div');
  thinking.className = 'chat-bubble gpt';
  chatArea.appendChild(thinking);
  chatArea.scrollTop = chatArea.scrollHeight;

  if (shouldGenerateImage) {
    thinking.textContent = '🎨 Generating image...';

    try {
      const imageResponse = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: message })
      });
      const imageData = await imageResponse.json();

      if (imageData.image_url) {
        thinking.innerHTML = `<img src="${imageData.image_url}" alt="Generated image" style="max-width:100%; border: 5px solid black; border-radius: 20px;" />`;
      } else {
        thinking.textContent = '⚠️ Image generation failed.';
      }
    } catch (err) {
      console.error('Image generation error:', err);
      thinking.textContent = '⚠️ Error generating image.';
    }

  } else {
    thinking.textContent = 'Thinking...';

    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      if (!data.choices || !data.choices.length) {
        thinking.textContent = "⚠️ Grace didn't respond. Try again.";
        return;
      }

      thinking.textContent = data.choices[0].message.content;

    } catch (error) {
      console.error("Error contacting server:", error);
      thinking.textContent = "⚠️ Something went wrong. Please try again.";
    }

    chatArea.scrollTop = chatArea.scrollHeight;
  }
}
