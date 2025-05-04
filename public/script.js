function startExperience() {
    document.getElementById('landing').style.display = 'none';
    document.getElementById('identity').style.display = 'block';
  }
  
  function goBack() {
    document.getElementById('identity').style.display = 'none';
    document.getElementById('landing').style.display = 'block';
  }
  
  function selectIdentity(role) {
    const responseText = document.getElementById('responseText');
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
    document.getElementById('identity').style.display = 'none';
    document.getElementById('response').style.display = 'block';
  }
  
  function signOut() {
    document.getElementById('response').style.display = 'none';
    document.getElementById('landing').style.display = 'block';
  }
  
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
  
    if (shouldGenerateImage) {
      const thinking = document.createElement('div');
      thinking.className = 'chat-bubble gpt';
      thinking.textContent = '🎨 Generating image...';
      chatArea.appendChild(thinking);
      chatArea.scrollTop = chatArea.scrollHeight;
  
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
      // Add GPT thinking response
      const thinking = document.createElement('div');
      thinking.className = 'chat-bubble gpt';
      thinking.textContent = 'Thinking...';
      chatArea.appendChild(thinking);
      chatArea.scrollTop = chatArea.scrollHeight;
  
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
  