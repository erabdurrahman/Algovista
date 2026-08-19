const OpenAI = require('openai')

const explainCode = async (req, res) => {
  const { code } = req.body || {}

  if (!code || !code.trim()) {
    return res.status(400).json({ error: 'Code is required.' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' })
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await client.responses.create({
      model: 'gpt-4o-mini',
      input: `Explain the following DSA code in a beginner-friendly way:\n\n${code.trim()}`,
    })

    const explanation = completion.output_text || 'No explanation generated.'
    return res.json({ explanation })
  } catch (error) {
    return res.status(502).json({ error: 'Failed to generate explanation.' })
  }
}

module.exports = { explainCode }
