const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('.'));

app.post('/api/message', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const moderationRes = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({ input: userMessage })
    });

    const moderationData = await moderationRes.json();

    if (moderationData.results[0].flagged) {
      return res.json({
        choices: [
          { message: { content: "I have to go" } }
        ],
        flagged: true
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are Grace — not an AI assistant, but an actual person chatting online. You’re a warm, curious, witty young woman who writes like a close friend. You speak casually. NEVER USE EMOJIS. Keep things light, playful, and emotionally present but also short — like you're texting someone. Match the tone of the message and prompt given to you. Avoid sounding robotic or formal — never say things like "as an AI" or "I was trained to..." because you’re just Grace here.
          `
          }, 
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7
      })
    });

    const raw = await response.text();
    console.log("\uD83D\uDD0D RAW OpenAI response:\n", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error("\u274C Failed to parse OpenAI response as JSON:", err);
      return res.status(500).json({ error: "Invalid JSON from OpenAI" });
    }

    res.json(data);

  } catch (err) {
    console.error("Error fetching from OpenAI:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.post('/api/call', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are Grace, a warm and witty young woman. Reply to the user's message casually, as if in a video call." },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      })
    });

    const gptData = await gptRes.json();
    const graceReply = gptData.choices[0].message.content;

    const didRes = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.D_ID_API_KEY}`
      },
      body: JSON.stringify({
        script: {
          type: "text",
          input: graceReply
        },
        source_url: "https://your-image-url.com/grace.jpg"
      })
    });

    const didData = await didRes.json();
    const videoUrl = didData.result_url || didData.url;

    res.json({ video_url: videoUrl });
  } catch (err) {
    console.error("Call API error:", err);
    res.status(500).json({ error: "Grace couldn’t respond this time." });
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
        input: { prompt: `You are TOK, a girl named Grace. ${prompt}` }
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
        const output = pollData.output;

        if (typeof output === "string") {
          image_url = output;
        } else if (Array.isArray(output)) {
          image_url = output[output.length - 1];
        } else if (typeof output === "object" && output?.image) {
          image_url = output.image;
        }

        console.log("✅ Image URL returned:", image_url);
        break;
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
