const express = require('express')
const OpenAI = require('openai')

const router = express.Router()

/**
 * Pedagogical Offline AI Tutor
 * Provides direct, natural answers for DSA questions, and strictly restricts non-DSA topics.
 */
function generateOfflineAnswer({
  question = '',
  algorithm = 'Bubble Sort',
  input = '',
  currentStep = 1,
  totalSteps = 1,
  currentState = '',
  action = '',
  comparing = [],
  metrics = {},
  complexity = {},
}) {
  const q = question.toLowerCase().trim()
  const algo = algorithm || 'Bubble Sort'

  // 1. Greetings & Conversational Queries
  if (
    q === 'hello' ||
    q === 'hi' ||
    q === 'hey' ||
    q.startsWith('hello') ||
    q.startsWith('hi ') ||
    q.startsWith('hey ') ||
    q.includes('who are you') ||
    q.includes('what can you do') ||
    q.includes('help')
  ) {
    return `Hello! 👋 I am your AI DSA Tutor in Algovista.

I can help you understand **${algo}** and other data structures & algorithms. You can ask me questions like:
* *"Why do we choose ${algo} for sorting/searching?"*
* *"Why did these elements swap in the current step?"*
* *"What is the time and space complexity?"*
* *"Is ${algo} good for large datasets?"*
* *"Give me a real-life example."*
* *"Compare ${algo} with other algorithms."*`
  }

  // 2. Strict Check for Non-DSA & Off-Topic Queries
  const nonDsaKeywords = [
    'capital of',
    'president',
    'prime minister',
    'cricket',
    'football',
    'movie',
    'actor',
    'actress',
    'song',
    'recipe',
    'cook',
    'weather',
    'weather today',
    'photosynthesis',
    'biology',
    'chemistry',
    'history',
    'war',
    'politics',
    'who is virat',
    'who is dhoni',
    'who is modi',
    'who is messi',
    'who won',
    'dance',
    'joke',
    'girlfriend',
    'boyfriend',
  ]

  const isExplicitlyNonDsa = nonDsaKeywords.some((keyword) => q.includes(keyword))
  if (isExplicitlyNonDsa) {
    return `Sorry! I am Algovista's AI DSA Tutor. 🤖

I am specialized strictly in **Data Structures, Algorithms, Programming, and Time/Space Complexity**. 

I cannot answer general knowledge, sports, entertainment, or non-computer science questions. Please ask a DSA or algorithm-related question!`
  }

  // 3. Why Choose / When to Use / Algorithm Selection
  if (
    (q.includes('why') && (q.includes('choose') || q.includes('use') || q.includes('pick') || q.includes('select') || q.includes('prefer') || q.includes('we choose') || q.includes('opt'))) ||
    q.includes('when to use') ||
    q.includes('when should') ||
    q.includes('purpose') ||
    q.includes('why do we need') ||
    q.includes('why is it used')
  ) {
    if (algo.includes('Bubble')) {
      return `Bubble Sort is often chosen for learning and simple sorting problems because it is exceptionally easy to understand and implement. It repeatedly compares adjacent elements and swaps them when they are in the wrong order.

However, it is not usually preferred for large datasets because its average and worst-case time complexity is O(n²), making it much slower than O(n log n) algorithms like Merge Sort or Quick Sort.`
    }
    if (algo.includes('Selection')) {
      return `Selection Sort is chosen when memory write operations (swaps) are expensive because it performs at most O(n) swaps throughout the entire sorting process.

However, it is not preferred for large datasets because it always performs O(n²) comparisons, even if the array is already sorted.`
    }
    if (algo.includes('Insertion')) {
      return `Insertion Sort is widely chosen for small datasets (typically N ≤ 50) and nearly-sorted data. It is an adaptive algorithm that runs in fast O(n) linear time when elements are already mostly in order, with very low constant overhead.`
    }
    if (algo.includes('Linear')) {
      return `Linear Search is chosen when the dataset is unsorted, small, or stored in a linear structure like a Linked List that does not allow instant random indexing. It sequentially checks elements one by one from start to finish.`
    }
    if (algo.includes('Binary')) {
      return `Binary Search is chosen whenever data is already sorted and you need fast search operations. By halving the search space at each comparison, it finds elements in logarithmic O(log n) time — searching 1,000,000 items in just ~20 steps.`
    }
    if (algo.includes('BFS') || algo.includes('Breadth')) {
      return `Breadth-First Search (BFS) is chosen when you need to find the shortest path on an unweighted graph, or explore nodes level-by-level (e.g., finding nearest friends in social networks or broadcasting messages across peer networks).`
    }
    if (algo.includes('DFS') || algo.includes('Depth')) {
      return `Depth-First Search (DFS) is chosen when you need to explore all possible paths, detect cycles in graphs, solve mazes/puzzles, or perform topological sorting.`
    }
  }

  // 4. Why did elements swap / move / change
  if (q.includes('why') && (q.includes('swap') || q.includes('move') || q.includes('shift') || q.includes('change') || q.includes('replace'))) {
    return `In **${algo}**, a swap occurs because the two compared elements violate the sorted order invariant. 

Specifically, the element on the left was greater than the element on the right. Swapping them places the smaller element forward and pushes the larger element closer to its correct final position.`
  }

  // 5. Why is Binary Search faster
  if (q.includes('binary') && (q.includes('faster') || q.includes('better') || q.includes('speed') || q.includes('quick'))) {
    return `Binary Search is exponentially faster than Linear Search because it eliminates half of the remaining search space with every single comparison (**O(log n)** vs **O(n)**).

For example, in a list of 1,000,000 items:
* **Linear Search** may need up to **1,000,000 comparisons**.
* **Binary Search** requires at most **20 comparisons**.`
  }

  // 6. Large data / Scalability
  if (q.includes('large') || q.includes('million') || q.includes('huge') || q.includes('scale') || q.includes('big data') || q.includes('production')) {
    if (algo.includes('Bubble') || algo.includes('Selection') || algo.includes('Insertion')) {
      return `No, **${algo}** is not suitable for large datasets. Because its average and worst-case time complexity is **O(n²)**, doubling the number of elements quadruples the execution time. 

For large production datasets, **O(n log n)** algorithms such as Quick Sort, Merge Sort, or TimSort are used instead.`
    }
    if (algo.includes('Binary')) {
      return `Yes, **Binary Search** is ideal for large datasets because of its **O(log n)** time complexity. Even on a dataset of 1 billion sorted items, it takes no more than 30 comparisons to locate the target.`
    }
  }

  // 7. Compare algorithms
  if (q.includes('compare') || q.includes('vs') || q.includes('difference') || q.includes('better than')) {
    if (q.includes('insertion') || (algo.includes('Bubble') && q.includes('insertion')) || (algo.includes('Insertion') && q.includes('bubble'))) {
      return `Both **Bubble Sort** and **Insertion Sort** have a worst-case time complexity of **O(n²)** and use **O(1)** auxiliary space.

However, **Insertion Sort** is generally superior in practice because:
1. It shifts elements instead of performing expensive full 3-step swaps.
2. It stops comparisons early in the inner loop as soon as the element's spot is found.
3. On nearly-sorted arrays, Insertion Sort runs in **O(n)** linear time.`
    }
    if (q.includes('selection') || (algo.includes('Bubble') && q.includes('selection'))) {
      return `Both **Bubble Sort** and **Selection Sort** have **O(n²)** worst-case time complexity. 
* **Bubble Sort** can detect an already sorted array in **O(n)** time and is stable.
* **Selection Sort** minimizes memory writes (at most **O(n)** swaps), but always performs **O(n²)** comparisons even on sorted inputs.`
    }
    if (q.includes('dfs') || q.includes('bfs')) {
      return `* **BFS (Breadth-First Search)** explores graph nodes layer by layer using a **Queue (FIFO)**. It is optimal for finding the shortest path on unweighted graphs.
* **DFS (Depth-First Search)** explores deeply along each branch using a **Stack / Recursion (LIFO)**. It is optimal for pathfinding, cycle detection, and maze exploration.`
    }
    return `When comparing algorithms, the critical metrics are **Time Complexity** (how operations grow with input size N), **Space Complexity** (extra memory used), and **Stability/Adaptability** (behavior on partially sorted data).`
  }

  // 8. Time and Space Complexity / Big-O
  if (q.includes('complexity') || q.includes('o(n') || q.includes('big o') || q.includes('time') || q.includes('space') || q.includes('best case') || q.includes('worst case')) {
    if (algo.includes('Bubble')) {
      return `**Bubble Sort Complexity Breakdown:**
* **Best Case Time:** O(n) — when the input is already sorted and early termination is enabled (0 swaps).
* **Average Case Time:** O(n²) — average passes over unsorted adjacent pairs.
* **Worst Case Time:** O(n²) — when the array is completely reversed.
* **Space Complexity:** O(1) auxiliary space (operates directly in-place).`
    }
    if (algo.includes('Selection')) {
      return `**Selection Sort Complexity Breakdown:**
* **Best, Average & Worst Case Time:** O(n²) — always scans the entire unsorted partition to find the minimum.
* **Space Complexity:** O(1) auxiliary space (operates directly in-place).`
    }
    if (algo.includes('Insertion')) {
      return `**Insertion Sort Complexity Breakdown:**
* **Best Case Time:** O(n) — when the input is already sorted (only 1 comparison per element, 0 shifts).
* **Average & Worst Case Time:** O(n²) — when elements must slide across the sorted prefix.
* **Space Complexity:** O(1) auxiliary space (in-place).`
    }
    if (algo.includes('Binary')) {
      return `**Binary Search Complexity Breakdown:**
* **Best Case Time:** O(1) — target found at the initial middle index.
* **Average & Worst Case Time:** O(log n) — search space is cut in half at every step.
* **Space Complexity:** O(1) for iterative implementation.`
    }
    if (algo.includes('Linear')) {
      return `**Linear Search Complexity Breakdown:**
* **Best Case Time:** O(1) — target is the first element.
* **Average & Worst Case Time:** O(n) — scans sequentially through all elements.
* **Space Complexity:** O(1).`
    }
    if (algo.includes('BFS') || algo.includes('DFS')) {
      return `**Graph Traversal Complexity Breakdown:**
* **Time Complexity:** O(V + E) where V is the number of vertices and E is the number of edges.
* **Space Complexity:** O(V) for the visited state tracker and queue/call stack.`
    }
  }

  // 9. Explain Current Step
  if (q.includes('current step') || q.includes('this step') || q.includes('what is happening') || q.includes('explain step')) {
    return `At Step ${currentStep} of ${totalSteps} in **${algo}**:
${currentState || 'The algorithm is actively inspecting and processing elements.'}

* **Action:** \`${action || 'Comparison / State update'}\`
* **Progress:** ${metrics?.comparisons ?? 0} comparisons and ${(metrics?.swaps ?? 0) + (metrics?.shifts ?? 0)} swaps/shifts executed so far.`
  }

  // 10. Next Step
  if (q.includes('next step') || q.includes('what next') || q.includes('what happens next')) {
    return `In the next step, **${algo}** will advance its pointer to compare the next adjacent pair or inspect the next candidate element, continuing its algorithm logic until the termination condition is satisfied.`
  }

  // 11. Real-Life Example / Analogy
  if (q.includes('real-life') || q.includes('analogy') || q.includes('example') || q.includes('daily life') || q.includes('story')) {
    const analogies = {
      'Bubble Sort': 'Imagine organizing students by height for a class photo. You compare every two adjacent students and swap them if the taller one is in front, repeating down the line until the entire class is ordered from shortest to tallest.',
      'Selection Sort': 'Imagine sorting a messy pile of books on your desk. You scan the whole pile to find the thinnest book, place it on the shelf, and then repeat to find the next thinnest book until all books are shelved.',
      'Insertion Sort': 'Like sorting playing cards in your hand as you are dealt cards one by one. You take each new card and slide it into its correct position among the cards you are already holding.',
      'Linear Search': 'Searching for a specific key on an unlabeled keychain by testing each key one-by-one from left to right until one opens the door.',
      'Binary Search': 'Looking up a word in a printed dictionary. You open directly to the middle page, determine whether your word is before or after, and discard half the book at every step.',
      'Breadth First Search (BFS)': 'Like ripples expanding outward when a pebble drops in water, or finding 1st-degree friends before 2nd-degree connections on LinkedIn.',
      'Depth First Search (DFS)': 'Like exploring a maze. You walk straight down a single path until you hit a dead end, then backtrack to the last fork and try the alternative corridor.',
    }
    return analogies[algo] || `Think of **${algo}** like solving a step-by-step organizational problem by breaking complex decisions into predictable, repeatable operations.`
  }

  // 12. Explain Like a Beginner
  if (q.includes('beginner') || q.includes('simple') || q.includes('kid') || q.includes('easy') || q.includes('layman')) {
    return `In simple words: **${algo}** is like a step-by-step recipe for organizing data.

It inspects items, checks if they are in the right position, and rearranges them one at a time so that by the end, everything is neatly ordered.`
  }

  // 13. What is / How does it work / Concept
  if (q.includes('what is') || q.includes('how does') || q.includes('how it works') || q.includes('explain') || q.includes('tell me about')) {
    if (algo.includes('Bubble')) {
      return `**Bubble Sort** is a straightforward comparison-based sorting algorithm. It works by stepping through the array, comparing adjacent items, and swapping them if they are in the wrong order. Larger elements "bubble up" to the end of the array with each complete pass.`
    }
    if (algo.includes('Selection')) {
      return `**Selection Sort** is an in-place comparison sort. It divides the input array into a sorted subarray and an unsorted subarray. In each pass, it selects the smallest element from the unsorted subarray and swaps it with the first unsorted element.`
    }
    if (algo.includes('Insertion')) {
      return `**Insertion Sort** builds a sorted array one element at a time. It iterates through the input elements and inserts each into its proper sorted position relative to the elements already examined.`
    }
    if (algo.includes('Binary')) {
      return `**Binary Search** is an efficient divide-and-conquer search algorithm for sorted lists. It compares the target value to the middle element of the array; if they are not equal, the half in which the target cannot lie is eliminated, repeating on the remaining half.`
    }
    if (algo.includes('Linear')) {
      return `**Linear Search** is a sequential search algorithm that starts from one end and checks every element of the list until the desired element is found or the list ends.`
    }
    if (algo.includes('BFS')) {
      return `**Breadth-First Search (BFS)** is a graph traversal algorithm that explores all vertices at the current depth before moving on to vertices at the next depth level, typically implemented using a FIFO Queue.`
    }
    if (algo.includes('DFS')) {
      return `**Depth-First Search (DFS)** is a graph traversal algorithm that explores as far as possible along each branch before backtracking, typically implemented using Recursion or a LIFO Stack.`
    }
  }

  // 14. Advantages / Pros / Disadvantages / Cons
  if (q.includes('advantage') || q.includes('benefit') || q.includes('pros')) {
    return `**Key Advantages of ${algo}:**
1. **Simplicity:** Very easy to understand, trace, and implement.
2. **In-Place:** Requires O(1) auxiliary memory space.
3. **Intuitive:** Excellent for learning foundational algorithmic concepts and invariant maintenance.`
  }
  if (q.includes('disadvantage') || q.includes('drawback') || q.includes('cons') || q.includes('limitation')) {
    return `**Key Limitations of ${algo}:**
1. **Slow on Large Datasets:** Average and worst-case time complexity is O(n²).
2. **High Operation Count:** Inefficient compared to modern O(n log n) sorting algorithms like Quick Sort or Merge Sort.`
  }

  // 15. Default Refusal for unclear or off-topic queries
  return `Sorry! I am Algovista's AI DSA Tutor. 🤖

I can only answer questions related to **Data Structures, Algorithms, Programming, Time/Space Complexity, and Computer Science concepts**.

Please feel free to ask anything about **${algo}** or any algorithm!`
}

// AI explanation endpoint (Supports Google Gemini, OpenAI, or Smart Offline Tutor)
router.post('/explain', async (req, res) => {
  try {
    const {
      question: rawQuestion = '',
      query: legacyQuery = '',
      algorithm = 'Bubble Sort',
      input = '',
      currentStep = 1,
      totalSteps = 1,
      currentState = '',
      action = '',
      comparing = [],
      metrics = {},
      complexity = {},
      node = null,
      codeLine = null,
    } = req.body

    const question = (rawQuestion || legacyQuery || '').trim()

    if (!question) {
      return res.status(400).json({ error: 'Please provide a valid question.' })
    }

    const geminiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : ''
    const openAiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : ''

    const systemPrompt = `You are Algovista's dedicated AI Data Structures & Algorithms (DSA) tutor.

STRICT DOMAIN GUARDRAILS & RESTRICTIONS:
1. You are strictly specialized ONLY in Data Structures, Algorithms, Computer Science, Programming, Time/Space Complexity, and Visualizer execution.
2. If the user asks ANY question that is unrelated to Data Structures, Algorithms, Programming, or Computer Science (for example: General Knowledge, Bollywood, Movies, Politics, Sports, Weather, Geography, Biology, Cooking, Relationships, Jokes, or random non-tech trivia), you MUST STRICTLY DECLINE and apologize politely.
3. Decline format:
"Sorry! I am Algovista's AI DSA Tutor. 🤖 I can only answer questions related to Data Structures, Algorithms, Programming, and Computer Science concepts. Please ask an algorithm-related question!"
4. Greetings (like "hello", "hi", "hey") are permitted: respond warmly and invite the user to ask a DSA question.
5. For all DSA, algorithm, and coding questions: Answer directly, accurately, and concisely in beginner-friendly language.
6. The algorithm context provided below is supporting information. Do not force unnecessary step/metric dumps when answering high-level questions.`

    const userPrompt = `USER QUESTION:
${question}

ALGORITHM:
${algorithm}

INPUT:
${input ? (Array.isArray(input) ? input.join(', ') : String(input)) : 'N/A'}

CURRENT STEP:
${currentStep} of ${totalSteps}

CURRENT STATE:
${currentState || 'N/A'}

CURRENT ACTION:
${action || 'N/A'}

COMPARING ELEMENTS / ACTIVE INDICES:
${Array.isArray(comparing) && comparing.length > 0 ? JSON.stringify(comparing) : 'None'}

EXECUTION METRICS:
${JSON.stringify(metrics || {})}

COMPLEXITY:
${JSON.stringify(complexity || {})}`

    // 1. If Google Gemini Key is configured -> Call Gemini 3.6 Flash / Latest API
    if (geminiKey && geminiKey !== 'your_gemini_api_key') {
      try {
        const rawModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
        const modelName = rawModel.startsWith('models/') ? rawModel : `models/${rawModel}`
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${geminiKey}`

        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1000,
            },
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (aiText) {
            return res.json({
              explanation: aiText,
              source: 'gemini',
            })
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back:', geminiError.message)
      }
    }

    // 2. If OpenAI Key is configured -> Call OpenAI API
    if (openAiKey && openAiKey !== 'your_api_key' && openAiKey !== 'your_openai_api_key') {
      try {
        const openai = new OpenAI({ apiKey: openAiKey })
        const response = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 500,
          temperature: 0.4,
        })

        const aiMessage = response.choices?.[0]?.message?.content
        if (aiMessage) {
          return res.json({
            explanation: aiMessage,
            source: 'openai',
          })
        }
      } catch (openAiError) {
        console.warn('OpenAI API call failed, falling back:', openAiError.message)
      }
    }

    // 3. Built-in Smart Offline Tutor Fallback
    const fallbackResponse = generateOfflineAnswer({
      question,
      algorithm,
      input,
      currentStep,
      totalSteps,
      currentState,
      action,
      comparing,
      metrics,
      complexity,
      node,
      codeLine,
    })

    return res.json({
      explanation: fallbackResponse,
      source: 'offline-tutor',
    })
  } catch (error) {
    console.error('AI route error:', error.message)
    const fallbackResponse = generateOfflineAnswer({
      question: req.body?.question || req.body?.query || '',
      algorithm: req.body?.algorithm || 'Bubble Sort',
      input: req.body?.input || '',
      currentStep: req.body?.currentStep || 1,
      totalSteps: req.body?.totalSteps || 1,
      currentState: req.body?.currentState || '',
      action: req.body?.action || '',
      comparing: req.body?.comparing || [],
      metrics: req.body?.metrics || {},
      complexity: req.body?.complexity || {},
    })

    return res.json({
      explanation: fallbackResponse,
      source: 'fallback-tutor',
    })
  }
})

module.exports = router
