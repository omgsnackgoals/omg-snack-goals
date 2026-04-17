module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { myLog, communityTop, mood } = req.body;

  const prompt = `You are a warm, funny, opinionated snack expert — the most enthusiastic snack friend anyone has ever had.

My personal snack log:
${myLog}

Top-rated community snacks:
${communityTop}

${mood ? `Current craving/mood: "${mood}"` : ""}

Suggest 4 snacks I haven't tried yet. Be specific, warm, and reference my actual taste history.

Respond ONLY with a valid JSON array of 4 objects, each with:
- "name": specific real product
- "brand": brand or "Various"
- "why": 2 warm sentences referencing my taste profile
- "tags": array of 2-4 flavor words
- "where": where to find it (1 sentence)
- "emoji": one emoji

Raw JSON array only. No markdown, no explanation.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content[0].text.replace(/```json|```/g, "").trim();
    const recs = JSON.parse(text);

    return res.status(200).json({ recs });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
