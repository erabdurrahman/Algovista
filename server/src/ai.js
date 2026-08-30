const express = require('express')
const OpenAI = require('openai')

const router = express.Router()

// Intelligent pedagogical fallback generator when OpenAI key is absent or quota exceeded
const generateFallbackExplanation = ({
  type,
  algorithm = 'Algorithm',
  currentStep = 0,
  array = [],
  comparing = [],
  action = '',
  explanation = '',
  target = null,
  node = null,
}) => {
  switch (type) {
    case 'step': {
      let details = explanation || `Executing step ${currentStep} of ${algorithm}.`
      let elementsDesc = comparing && comparing.length > 0 ? `comparing items at indices [${comparing.join(', ')}]` : ''
      let actionDesc = action ? `performing action: "${action}"` : ''

      return `📌 **Step ${currentStep} Breakdown:**

1. **What is happening?**
   ${details} ${elementsDesc ? `(${elementsDesc})` : ''}

2. **Why is it happening?**
   In **${algorithm}**, this operation ensures the elements follow the algorithm's ordering and invariant rules. ${actionDesc ? `Specifically, ${actionDesc}.` : ''}

3. **Current State & Result:**
   ${array && array.length > 0 ? `The current array state is \`[${array.join(', ')}]\`.` : ''}
   ${node ? `Active Node: \`${node}\`.` : ''}
   The algorithm is progressing towards its next state.`
    }

    case 'algorithm': {
      return `💡 **How ${algorithm} Works:**

- **Concept:** ${algorithm} is a foundational computer science technique designed to solve problem instances systematically.
- **Core Mechanism:** It processes inputs iteratively or recursively, evaluating state conditions to achieve optimal ordering or structure traversal.
- **Key Advantage:** Clear, intuitive logic that demonstrates fundamental trade-offs between time and space complexities.`
    }

    case 'real-life': {
      const analogies = {
        'Bubble Sort': '🫧 **Bubble Sort Analogy:** Imagine organizing students in a line by height for a class photo. You compare every two students standing next to each other and swap them if the taller one is in front, repeating until the line is perfectly ordered.',
        'Selection Sort': '🎯 **Selection Sort Analogy:** Imagine looking through a messy shelf of books to find the smallest book, placing it on the far left, and then finding the next smallest for the second spot until all books are arranged.',
        'Insertion Sort': '🃏 **Insertion Sort Analogy:** Like sorting playing cards in your hand. You take cards one by one from the deck and insert each card into its correct position among the cards you are already holding.',
        'Linear Search': '🔍 **Linear Search Analogy:** Looking for a specific key on an unlabeled keychain by trying each key one by one from left to right until one fits the lock.',
        'Binary Search': '📖 **Binary Search Analogy:** Looking up a word in a printed dictionary. You open directly to the middle page, determine if your word comes before or after, and discard half the book each time.',
        'Breadth First Search (BFS)': '🌊 **BFS Analogy:** Like ripples expanding outwards when a stone is dropped in water, or discovering friends of friends on social media layer by layer (1st-degree connections first, then 2nd-degree).',
        'Depth First Search (DFS)': '🧭 **DFS Analogy:** Like navigating a maze. You walk down one pathway until you hit a dead end, then backtrack to the last intersection and try the alternative path.',
      }

      return analogies[algorithm] || `🌍 **Real-Life Analogy for ${algorithm}:**
Think of ${algorithm} like systematically solving everyday decision-making problems by dividing complex operations into predictable, repeatable steps.`
    }

    case 'complexity': {
      const complexities = {
        'Bubble Sort': '⏱️ **Complexity Analysis for Bubble Sort:**\n- **Best Case:** O(n) when array is already sorted\n- **Average Case:** O(n²)\n- **Worst Case:** O(n²) when array is reversed\n- **Space Complexity:** O(1) Auxiliary space (In-place sorting)',
        'Selection Sort': '⏱️ **Complexity Analysis for Selection Sort:**\n- **Best Case:** O(n²)\n- **Average Case:** O(n²)\n- **Worst Case:** O(n²)\n- **Space Complexity:** O(1) Auxiliary space (In-place sorting)',
        'Insertion Sort': '⏱️ **Complexity Analysis for Insertion Sort:**\n- **Best Case:** O(n) when already sorted\n- **Average Case:** O(n²)\n- **Worst Case:** O(n²)\n- **Space Complexity:** O(1) Auxiliary space (Adaptive & In-place)',
        'Linear Search': '⏱️ **Complexity Analysis for Linear Search:**\n- **Best Case:** O(1) target is the first element\n- **Average Case:** O(n)\n- **Worst Case:** O(n) target is at end or absent\n- **Space Complexity:** O(1)',
        'Binary Search': '⏱️ **Complexity Analysis for Binary Search:**\n- **Best Case:** O(1) target is at exact middle\n- **Average Case:** O(log n)\n- **Worst Case:** O(log n)\n- **Space Complexity:** O(1) iterative / O(log n) recursive',
        'Breadth First Search (BFS)': '⏱️ **Complexity Analysis for BFS:**\n- **Time Complexity:** O(V + E) where V is vertices and E is edges\n- **Space Complexity:** O(V) for the traversal queue and visited set',
        'Depth First Search (DFS)': '⏱️ **Complexity Analysis for DFS:**\n- **Time Complexity:** O(V + E) where V is vertices and E is edges\n- **Space Complexity:** O(V) for the recursion call stack and visited set',
      }

      return complexities[algorithm] || `⏱️ **Complexity Analysis for ${algorithm}:**
- Time Complexity: O(n) average
- Space Complexity: O(1)`
    }

    default:
      return `Detailed explanation for ${algorithm} step ${currentStep}.`
  }
}

// AI explanation endpoint
router.post('/explain', async (req, res) => {
  const {
    type = 'step',
    algorithm = 'Algorithm',
    currentStep = 0,
    totalSteps = 0,
    array = [],
    comparing = [],
    action = '',
    explanation = '',
    target = null,
    node = null,
    codeLine = null,
  } = req.body

  const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : ''

  // If no OpenAI key configured, return high-quality educational fallback immediately
  if (!apiKey || apiKey === 'your_api_key' || apiKey === 'your_openai_api_key') {
    const fallbackText = generateFallbackExplanation({
      type,
      algorithm,
      currentStep,
      array,
      comparing,
      action,
      explanation,
      target,
      node,
    })
    return res.json({
      explanation: fallbackText,
      source: 'offline-tutor',
    })
  }

  try {
    const openai = new OpenAI({ apiKey })

    let systemPrompt = `You are a friendly, encouraging AI Data Structures & Algorithms tutor in a learning platform called Algovista.
Your goal is to explain concepts clearly, concisely, and accurately for college undergraduate students.
Keep your explanations strictly focused on the provided algorithm and execution state without overwhelming jargon.`

    let userPrompt = ''

    if (type === 'step') {
      userPrompt = `Explain the following step in ${algorithm} execution:
- Algorithm: ${algorithm}
- Step: ${currentStep} of ${totalSteps}
- Current Data: [${Array.isArray(array) ? array.join(', ') : JSON.stringify(array)}]
- Elements / Indices Involved: [${Array.isArray(comparing) ? comparing.join(', ') : ''}]
- Action / Operation: ${action || explanation || 'Processing step'}
${target !== null ? `- Target Value: ${target}` : ''}
${node !== null ? `- Active Node: ${node}` : ''}
${codeLine ? `- Executing Code Line: ${codeLine}` : ''}

Please provide a concise 3-part explanation:
1. What is happening right now?
2. Why is this step performed according to ${algorithm}'s logic?
3. What is the immediate outcome?`
    } else if (type === 'algorithm') {
      userPrompt = `Give a high-level, clear overview of the algorithm: ${algorithm}.
Explain:
1. Core Concept and Intuition.
2. Step-by-step logic summary.
3. When and why to use it.`
    } else if (type === 'real-life') {
      userPrompt = `Provide a memorable, simple, and intuitive real-life analogy for the ${algorithm} algorithm that a college student can easily relate to in an exam or viva.`
    } else if (type === 'complexity') {
      userPrompt = `Explain the Time and Space Complexity for ${algorithm}:
1. Best Case Time Complexity (with condition)
2. Average Case Time Complexity
3. Worst Case Time Complexity (with condition)
4. Space Complexity (Auxiliary space explanation)`
    } else {
      userPrompt = `Explain ${algorithm} step ${currentStep}: ${explanation}`
    }

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 450,
      temperature: 0.6,
    })

    const aiMessage = response.choices?.[0]?.message?.content || generateFallbackExplanation({
      type,
      algorithm,
      currentStep,
      array,
      comparing,
      action,
      explanation,
      target,
      node,
    })

    return res.json({
      explanation: aiMessage,
      source: 'openai',
    })
  } catch (error) {
    console.warn('OpenAI API call failed, using intelligent fallback:', error.message)
    const fallbackText = generateFallbackExplanation({
      type,
      algorithm,
      currentStep,
      array,
      comparing,
      action,
      explanation,
      target,
      node,
    })
    return res.json({
      explanation: fallbackText,
      source: 'fallback-tutor',
      notice: 'AI tutor responded with local pedagogical model.',
    })
  }
})

module.exports = router
