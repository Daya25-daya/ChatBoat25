/**
 * AI Smart Reply Service
 * 
 * Generates contextual quick reply suggestions based on conversation history.
 * Currently uses rule-based logic, but designed to be easily replaced with real AI API.
 * 
 * Future integration options:
 * - OpenAI GPT API
 * - Google PaLM API
 * - Anthropic Claude API
 * - Local LLM (Ollama, etc.)
 */

// Mock AI service - analyzes context and generates smart replies
class SmartReplyService {
  constructor() {
    // Common reply patterns
    this.greetings = ['Hi!', 'Hello!', 'Hey there!', 'Hi! How are you?']
    this.acknowledgments = ['Got it!', 'Thanks!', 'Okay!', 'Sure thing!']
    this.questions = ['What do you think?', 'How about you?', 'Any ideas?']
    this.positiveResponses = ['Sounds good!', 'Great idea!', 'I agree!', 'Perfect!']
    this.negativeResponses = ['Not sure about that', 'Maybe later', 'Let me think']
  }

  /**
   * Generate smart reply suggestions based on last message
   * 
   * @param {Array} messages - Recent conversation messages
   * @param {string} currentUserId - Current user's ID
   * @returns {Array} Array of 2-3 suggested replies
   */
  generateReplies(messages, currentUserId) {
    if (!messages || messages.length === 0) {
      return this.getDefaultReplies()
    }

    // Get last message from other user
    const lastMessage = this.getLastOtherUserMessage(messages, currentUserId)
    
    if (!lastMessage) {
      return this.getDefaultReplies()
    }

    const content = lastMessage.content.toLowerCase()

    // Analyze message and generate contextual replies
    return this.analyzeAndGenerateReplies(content)
  }

  /**
   * Get last message from other user (not current user)
   */
  getLastOtherUserMessage(messages, currentUserId) {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId !== currentUserId) {
        return messages[i]
      }
    }
    return null
  }

  /**
   * Analyze message content and generate appropriate replies
   */
  analyzeAndGenerateReplies(content) {
    // Question detection
    if (this.isQuestion(content)) {
      return this.getQuestionReplies(content)
    }

    // Greeting detection
    if (this.isGreeting(content)) {
      return this.getGreetingReplies()
    }

    // Positive sentiment
    if (this.isPositive(content)) {
      return this.getPositiveReplies()
    }

    // Negative sentiment
    if (this.isNegative(content)) {
      return this.getNegativeReplies()
    }

    // Request/favor detection
    if (this.isRequest(content)) {
      return this.getRequestReplies()
    }

    // Thanks detection
    if (this.isThanks(content)) {
      return this.getThanksReplies()
    }

    // Default contextual replies
    return this.getContextualReplies(content)
  }

  /**
   * Check if message is a question
   */
  isQuestion(content) {
    return content.includes('?') || 
           content.startsWith('what') ||
           content.startsWith('how') ||
           content.startsWith('why') ||
           content.startsWith('when') ||
           content.startsWith('where') ||
           content.startsWith('who') ||
           content.startsWith('can you') ||
           content.startsWith('could you') ||
           content.startsWith('would you')
  }

  /**
   * Check if message is a greeting
   */
  isGreeting(content) {
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']
    return greetings.some(greeting => content.includes(greeting))
  }

  /**
   * Check if message has positive sentiment
   */
  isPositive(content) {
    const positiveWords = ['great', 'awesome', 'good', 'nice', 'perfect', 'excellent', 'love', 'happy', 'yes', 'sure']
    return positiveWords.some(word => content.includes(word))
  }

  /**
   * Check if message has negative sentiment
   */
  isNegative(content) {
    const negativeWords = ['no', 'not', 'bad', 'terrible', 'hate', 'sad', 'angry', 'upset', 'wrong']
    return negativeWords.some(word => content.includes(word))
  }

  /**
   * Check if message is a request
   */
  isRequest(content) {
    const requestWords = ['can you', 'could you', 'would you', 'please', 'help', 'need']
    return requestWords.some(word => content.includes(word))
  }

  /**
   * Check if message is thanks
   */
  isThanks(content) {
    return content.includes('thank') || content.includes('thanks')
  }

  /**
   * Generate replies for questions
   */
  getQuestionReplies(content) {
    if (content.includes('how are you')) {
      return ["I'm good, thanks!", "Doing well! You?", "Great! How about you?"]
    }
    if (content.includes('what') || content.includes('which')) {
      return ["Let me think...", "Good question!", "I'd say..."]
    }
    return ["Sure, let me explain", "Good question!", "Here's what I think"]
  }

  /**
   * Generate greeting replies
   */
  getGreetingReplies() {
    return this.shuffle([
      "Hi! How are you?",
      "Hey! What's up?",
      "Hello! Good to hear from you!"
    ]).slice(0, 3)
  }

  /**
   * Generate positive replies
   */
  getPositiveReplies() {
    return this.shuffle([
      "I agree!",
      "That's great!",
      "Awesome!",
      "Glad to hear that!",
      "Perfect!"
    ]).slice(0, 3)
  }

  /**
   * Generate negative replies
   */
  getNegativeReplies() {
    return this.shuffle([
      "I understand",
      "Sorry to hear that",
      "Let me know if I can help",
      "That's unfortunate"
    ]).slice(0, 3)
  }

  /**
   * Generate request replies
   */
  getRequestReplies() {
    return ["Sure, I can help!", "Of course!", "Let me check"]
  }

  /**
   * Generate thanks replies
   */
  getThanksReplies() {
    return ["You're welcome!", "No problem!", "Happy to help!"]
  }

  /**
   * Generate contextual replies based on keywords
   */
  getContextualReplies(content) {
    // Time-related
    if (content.includes('today') || content.includes('tomorrow')) {
      return ["Sounds good!", "What time?", "Sure, let's do it!"]
    }

    // Meeting/plans
    if (content.includes('meet') || content.includes('plan')) {
      return ["Sure, when?", "Sounds good!", "Let me check my schedule"]
    }

    // Food/lunch/dinner
    if (content.includes('lunch') || content.includes('dinner') || content.includes('food')) {
      return ["Sounds great!", "Where should we go?", "I'm in!"]
    }

    // Work/project
    if (content.includes('work') || content.includes('project')) {
      return ["Let's discuss", "I'll take a look", "Good idea!"]
    }

    return this.getDefaultReplies()
  }

  /**
   * Get default replies when no context
   */
  getDefaultReplies() {
    return this.shuffle([
      "Okay!",
      "Got it!",
      "Sure thing!",
      "Sounds good!",
      "I see",
      "Interesting!"
    ]).slice(0, 3)
  }

  /**
   * Shuffle array (Fisher-Yates algorithm)
   */
  shuffle(array) {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Integration point for real AI API
   * Replace this method to use OpenAI, Google PaLM, etc.
   */
  async generateWithAI(messages, apiKey) {
    // Example: OpenAI integration (commented out)
    /*
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Generate 3 short, natural quick reply suggestions for this conversation. Return only the suggestions, one per line.'
            },
            ...messages.slice(-5).map(m => ({
              role: m.senderId === 'user' ? 'user' : 'assistant',
              content: m.content
            }))
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      })

      const data = await response.json()
      return data.choices[0].message.content.split('\n').filter(s => s.trim())
    } catch (error) {
      console.error('AI API error:', error)
      return this.getDefaultReplies()
    }
    */

    // For now, use rule-based system
    return this.generateReplies(messages)
  }
}

// Export singleton instance
export const smartReplyService = new SmartReplyService()

// Export for easy integration with real AI
export async function getSmartReplies(messages, currentUserId, useAI = false, apiKey = null) {
  if (useAI && apiKey) {
    return await smartReplyService.generateWithAI(messages, apiKey)
  }
  return smartReplyService.generateReplies(messages, currentUserId)
}
