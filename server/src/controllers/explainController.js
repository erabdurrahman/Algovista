const OpenAI = require('openai')

const MAX_CODE_LENGTH = 5000

const explainCode = async (req, res) => {
  const { code } = req.body || {}

  if (!code || !String(code).trim()) {
    return res.status(400).json({ error: 'Code is required.' })
  }

  const sanitizedCode = String(code).trim()
  if (sanitizedCode.length > MAX_CODE_LENGTH) {
    return res.status(400).json({ error: `Code is too long. Maximum ${MAX_CODE_LENGTH} characters allowed.` })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' })
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      max_output_tokens: 450,
      input: [
        {
          role: 'system',
          content:
            'You are a DSA mentor. Explain code simply, include approach, time complexity, space complexity, and 1 short improvement suggestion.',
        },
        {
          role: 'user',
          content: `Explain this DSA code for a beginner:\n\n${sanitizedCode}`,
        },
      ],
    })

    const explanation = (completion.output_text || '').trim() || 'No explanation generated.'
    return res.json({ explanation })
  } catch (_error) {
    return res.status(502).json({ error: 'Failed to generate explanation.' })
  }
}

module.exports = { explainCode }
