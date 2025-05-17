 
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/message', async (req, res) => {
  const userMessage = req.body.message;

  try {
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
            role: "user",
            content: `Pretend you are Grace and reply to the following text message: "${userMessage}"`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    // console.log("🔍 OpenAI raw response:", data);
    // for debugging ^
    res.json(data);

  } catch (err) {
    console.error("Error fetching from OpenAI:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
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
        const output = pollData.output;

        if (typeof output === "string") {
          image_url = output;
        } else if (Array.isArray(output)) {
          image_url = output[output.length - 1]; // get last image
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
