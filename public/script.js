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
  
    // Add user message bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = message;
    chatArea.appendChild(userBubble);
    messageInput.value = '';
  
    // Thinking bubble for Grace's reply
    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'chat-bubble gpt';
    thinkingBubble.textContent = 'Thinking...';
    chatArea.appendChild(thinkingBubble);
    chatArea.scrollTop = chatArea.scrollHeight;
  
    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });
  
      const data = await response.json();
  
      if (!data.choices || !data.choices.length) {
        thinkingBubble.textContent = "⚠️ Grace didn't respond. Try again.";
        return;
      }
  
      thinkingBubble.textContent = data.choices[0].message.content;
  
    } catch (error) {
      console.error("Error contacting server:", error);
      thinkingBubble.textContent = "⚠️ Something went wrong. Please try again.";
    }
  
    chatArea.scrollTop = chatArea.scrollHeight;
  }
  