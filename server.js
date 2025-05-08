const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/message', async (req, res) => {
  const { message, identity = 'friend', lastGraceMessage = '', imageRequest = false } = req.body;

  try {
    // Build GPT prompt
    let prompt = `Imagine you're texting your ${identity}. Reply as Grace, in her tone and style. Here's the message: "${message}"`;

    if (imageRequest) {
      prompt += lastGraceMessage
        ? `\nEarlier you said: "${lastGraceMessage}". Now describe vividly what you're doing right now in a way that could be turned into an image. Focus on setting, color, pose, clothing, and expression. Describe it as if painting a photograph with words — use specific actions, details, and emotions.`
        : `\nPlease describe vividly what you're doing right now so it could be visualized in a picture. Include setting, color, pose, clothing, and lighting. Describe it as if painting a photograph with words — use specific actions, details, and emotions.`;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "g-67eefd3921388191953eae88d067ab41", // GARCE custom GPT
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "⚠️ No response from Grace.";

    // Improved visual sentence extraction
    let visualPrompt = null;
    if (imageRequest) {
      const visualSentences = reply.match(/[^.?!]*\b(?:sitting|standing|lying|walking|painting|holding|petting)\b[^.?!]*[.?!]/gi);
      if (visualSentences && visualSentences.length > 0) {
        visualPrompt = visualSentences.reduce((a, b) => (b.length > a.length ? b : a)).trim();
      }
    }

    const showImage = Boolean(visualPrompt);

    res.json({
      ...data,
      showImage,
      visualPrompt
    });

  } catch (err) {
    console.error("Error fetching from OpenAI:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.post('/api/image', async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "834207d1d550b92679f37abc816326565409dd5184aa9c1685b0cd23aedd7d7a",
        input: { prompt: `TOK ${prompt}` }
      })
    });

    const prediction = await response.json();
    if (!prediction.urls?.get) return res.status(500).json({ error: "No polling URL" });

    const pollUrl = prediction.urls.get;
    let image_url = null;

    for (let i = 0; i < 10; i++) {
      const poll = await fetch(pollUrl, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` }
      });
      const pollData = await poll.json();

      if (pollData.status === "succeeded") {
        image_url = pollData.output?.[pollData.output.length - 1];
        break;
      } else if (pollData.status === "failed") {
        throw new Error("Generation failed");
      }

      await new Promise(r => setTimeout(r, 1500));
    }

    if (image_url) {
      res.json({ image_url });
    } else {
      res.status(500).json({ error: "Timed out waiting for image" });
    }

  } catch (err) {
    console.error("Error calling Replicate:", err);
    res.status(500).json({ error: "Image generation error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
