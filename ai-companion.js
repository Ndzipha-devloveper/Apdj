/**
 * AI COMPANION JAVASCRIPT
 * 
 * This file contains all the interactive functionality for the AI companion page.
 * It includes chat functionality, sentiment analysis, crisis detection, and smart recommendations.
 */

// ==========================================
// AI COMPANION STATE MANAGEMENT
// ==========================================

const AICompanionState = {
    conversationHistory: [],
    currentSentiment: 'neutral',
    crisisKeywords: ['suicide', 'kill myself', 'end it all', 'hurt myself', 'hopeless', 'worthless', 'can\'t go on'],
    isTyping: false,
    lastMessageTime: null,
    sessionStartTime: new Date(),
    messageCount: 0
};

// AI Response Templates
const AIResponses = {
    greetings: [
        "Hello! I'm here to support you. How are you feeling today?",
        "Hi there! I'm glad you're here. What's on your mind?",
        "Welcome! I'm here to listen and help. How can I support you today?"
    ],
    anxiety: [
        "I understand you're feeling anxious. Let's try some grounding techniques. Can you name 5 things you can see around you?",
        "Anxiety can be overwhelming. Would you like to try a breathing exercise together?",
        "I hear that you're anxious. Remember, this feeling is temporary. What usually helps you feel calmer?"
    ],
    depression: [
        "I'm sorry you're going through a difficult time. Your feelings are valid, and you're not alone.",
        "Depression can make everything feel heavy. What's one small thing that brought you even a tiny bit of comfort recently?",
        "Thank you for sharing this with me. It takes courage to reach out. How can I best support you right now?"
    ],
    stress: [
        "Stress can be really challenging. Let's break this down - what's the main thing causing you stress right now?",
        "I can see you're dealing with a lot. Would it help to talk through some coping strategies?",
        "Stress affects us all differently. What does stress feel like in your body right now?"
    ],
    positive: [
        "I'm so glad to hear you're feeling good! What's contributing to these positive feelings?",
        "That's wonderful! It's important to acknowledge and celebrate these moments.",
        "I love hearing about your positive experiences. How can we build on this feeling?"
    ],
    coping: [
        "Here are some coping strategies that might help: deep breathing, progressive muscle relaxation, or mindfulness meditation. Which appeals to you?",
        "Coping strategies are personal. What has worked for you in the past?",
        "Let's explore some healthy coping mechanisms together. Are you interested in breathing exercises, grounding techniques, or something else?"
    ],
    resources: [
        "I can recommend some helpful resources. Are you looking for articles, exercises, or professional support options?",
        "There are many great mental health resources available. What type of support are you most interested in?",
        "I'd be happy to share some resources with you. What specific area would you like help with?"
    ],
    crisis: [
        "I'm very concerned about what you've shared. Your safety is the most important thing right now. Please consider reaching out to a crisis helpline or emergency services.",
        "Thank you for trusting me with these difficult feelings. I want to make sure you get the immediate support you need. Can we connect you with professional help?",
        "I hear that you're in a lot of pain right now. You don't have to go through this alone. Let's get you connected with someone who can provide immediate support."
    ],
    encouragement: [
        "You're showing real strength by being here and working on your mental health.",
        "I believe in your ability to get through this. You've overcome challenges before.",
        "Taking care of your mental health is one of the most important things you can do. I'm proud of you for being here."
    ]
};

// ==========================================
// AI COMPANION INITIALIZATION
// ==========================================

/**
 * Initialize AI companion when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeAICompanion();
});

/**
 * Main AI companion initialization function
 */
function initializeAICompanion() {
    console.log('Initializing AI Companion...');
    
    // Setup event listeners
    setupAIEventListeners();
    
    // Load conversation history
    loadConversationHistory();
    
    // Initialize sentiment analysis
    initializeSentimentAnalysis();
    
    console.log('AI Companion initialization complete');
}

/**
 * Setup AI companion event listeners
 */
function setupAIEventListeners() {
    // Auto-resize textarea
    const chatInput = document.getElementById('aiChatInput');
    if (chatInput) {
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
    
    // Handle suggested responses
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const message = this.textContent.trim();
            sendSuggestedMessage(message);
        });
    });
}

/**
 * Load conversation history from storage
 */
function loadConversationHistory() {
    const history = JSON.parse(localStorage.getItem('aiConversationHistory') || '[]');
    AICompanionState.conversationHistory = history;
    
    // Display recent messages (last 10)
    const recentMessages = history.slice(-10);
    recentMessages.forEach(message => {
        displayMessage(message.text, message.sender, false);
    });
}

/**
 * Initialize sentiment analysis
 */
function initializeSentimentAnalysis() {
    // This would integrate with a real sentiment analysis service
    console.log('Sentiment analysis initialized');
}

// ==========================================
// CHAT FUNCTIONALITY
// ==========================================

/**
 * Handle AI chat input key press
 * @param {Event} event - Keyboard event
 */
function handleAIChatKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendAIMessage();
    }
}

/**
 * Send AI message
 */
function sendAIMessage() {
    const input = document.getElementById('aiChatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Display user message
    displayMessage(message, 'user');
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Save to conversation history
    saveMessageToHistory(message, 'user');
    
    // Analyze sentiment and detect crisis
    const sentiment = analyzeSentiment(message);
    const isCrisis = detectCrisis(message);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Generate and send AI response
    setTimeout(() => {
        hideTypingIndicator();
        
        if (isCrisis) {
            handleCrisisDetection();
        } else {
            const response = generateAIResponse(message, sentiment);
            displayMessage(response, 'ai');
            saveMessageToHistory(response, 'ai');
        }
    }, 1500 + Math.random() * 1000); // Simulate thinking time
    
    // Update message count
    AICompanionState.messageCount++;
    
    console.log('AI message sent:', message);
}

/**
 * Send suggested message
 * @param {string} message - Suggested message text
 */
function sendSuggestedMessage(message) {
    const input = document.getElementById('aiChatInput');
    if (input) {
        input.value = message;
        sendAIMessage();
    }
    
    // Hide suggestions after use
    const suggestions = document.querySelector('.suggested-responses');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
}

/**
 * Display message in chat
 * @param {string} text - Message text
 * @param {string} sender - Message sender ('user' or 'ai')
 * @param {boolean} animate - Whether to animate message appearance
 */
function displayMessage(text, sender, animate = true) {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}-message`;
    
    // Create message structure
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    
    if (sender === 'ai') {
        avatarDiv.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"></path>
                <path d="M9 12l2 2 4-4"></path>
            </svg>
        `;
    } else {
        avatarDiv.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        `;
    }
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = text;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    contentDiv.appendChild(textDiv);
    contentDiv.appendChild(timeDiv);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    // Add animation class if needed
    if (animate) {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // Animate message appearance
    if (animate) {
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease-out';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 50);
    }
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const messagesContainer = document.getElementById('aiChatMessages');
    if (!messagesContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message ai-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"></path>
                <path d="M9 12l2 2 4-4"></path>
            </svg>
        </div>
        <div class="message-content">
            <div class="message-text">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    AICompanionState.isTyping = true;
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    AICompanionState.isTyping = false;
}

/**
 * Save message to conversation history
 * @param {string} text - Message text
 * @param {string} sender - Message sender
 */
function saveMessageToHistory(text, sender) {
    const message = {
        text,
        sender,
        timestamp: new Date().toISOString(),
        sentiment: sender === 'user' ? analyzeSentiment(text) : null
    };
    
    AICompanionState.conversationHistory.push(message);
    
    // Keep only last 100 messages
    if (AICompanionState.conversationHistory.length > 100) {
        AICompanionState.conversationHistory = AICompanionState.conversationHistory.slice(-100);
    }
    
    // Save to localStorage
    localStorage.setItem('aiConversationHistory', JSON.stringify(AICompanionState.conversationHistory));
}

// ==========================================
// AI RESPONSE GENERATION
// ==========================================

/**
 * Generate AI response based on user message and sentiment
 * @param {string} userMessage - User's message
 * @param {string} sentiment - Detected sentiment
 * @returns {string} - AI response
 */
function generateAIResponse(userMessage, sentiment) {
    const message = userMessage.toLowerCase();
    
    // Check for specific topics
    if (message.includes('anxious') || message.includes('anxiety') || message.includes('worried')) {
        return getRandomResponse(AIResponses.anxiety);
    }
    
    if (message.includes('depressed') || message.includes('sad') || message.includes('down')) {
        return getRandomResponse(AIResponses.depression);
    }
    
    if (message.includes('stressed') || message.includes('stress') || message.includes('overwhelmed')) {
        return getRandomResponse(AIResponses.stress);
    }
    
    if (message.includes('happy') || message.includes('good') || message.includes('great') || message.includes('excited')) {
        return getRandomResponse(AIResponses.positive);
    }
    
    if (message.includes('coping') || message.includes('help') || message.includes('strategies')) {
        return getRandomResponse(AIResponses.coping);
    }
    
    if (message.includes('resource') || message.includes('article') || message.includes('information')) {
        return getRandomResponse(AIResponses.resources);
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        return getRandomResponse(AIResponses.greetings);
    }
    
    // Sentiment-based responses
    if (sentiment === 'negative') {
        return "I can sense you're going through a difficult time. I'm here to listen and support you. Would you like to talk about what's troubling you?";
    }
    
    if (sentiment === 'positive') {
        return "I'm glad to hear you're feeling positive! It's wonderful when we can find moments of joy and hope. What's contributing to these good feelings?";
    }
    
    // Contextual responses based on conversation history
    const recentMessages = AICompanionState.conversationHistory.slice(-5);
    const hasDiscussedAnxiety = recentMessages.some(msg => 
        msg.text.toLowerCase().includes('anxiety') || msg.text.toLowerCase().includes('anxious')
    );
    
    if (hasDiscussedAnxiety) {
        return "How are you feeling about the anxiety we discussed earlier? Have you had a chance to try any of the techniques we talked about?";
    }
    
    // Default empathetic response
    const defaultResponses = [
        "Thank you for sharing that with me. I'm here to listen and support you. How are you feeling right now?",
        "I appreciate you opening up. Your thoughts and feelings matter. What would be most helpful for you today?",
        "I hear you. It sounds like you have a lot on your mind. Would you like to explore any of these feelings together?",
        "That sounds important to you. I'm here to help you work through whatever you're experiencing. What feels most pressing right now?"
    ];
    
    return getRandomResponse(defaultResponses);
}

/**
 * Get random response from array
 * @param {Array} responses - Array of possible responses
 * @returns {string} - Random response
 */
function getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
}

// ==========================================
// SENTIMENT ANALYSIS
// ==========================================

/**
 * Analyze sentiment of user message
 * @param {string} message - User message
 * @returns {string} - Sentiment classification
 */
function analyzeSentiment(message) {
    const text = message.toLowerCase();
    
    // Positive keywords
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'joy', 'excited', 'grateful', 'thankful', 'better', 'improving', 'hopeful'];
    
    // Negative keywords
    const negativeWords = ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'angry', 'frustrated', 'hopeless', 'terrible', 'awful', 'hate', 'worse', 'struggling', 'overwhelmed'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    // Count positive words
    positiveWords.forEach(word => {
        if (text.includes(word)) {
            positiveScore++;
        }
    });
    
    // Count negative words
    negativeWords.forEach(word => {
        if (text.includes(word)) {
            negativeScore++;
        }
    });
    
    // Determine sentiment
    if (positiveScore > negativeScore) {
        return 'positive';
    } else if (negativeScore > positiveScore) {
        return 'negative';
    } else {
        return 'neutral';
    }
}

/**
 * Update current sentiment state
 * @param {string} sentiment - New sentiment
 */
function updateSentiment(sentiment) {
    AICompanionState.currentSentiment = sentiment;
    
    // Update UI if needed
    const sentimentIndicator = document.querySelector('.sentiment-indicator');
    if (sentimentIndicator) {
        sentimentIndicator.className = `sentiment-indicator ${sentiment}`;
        sentimentIndicator.textContent = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
    }
}

// ==========================================
// CRISIS DETECTION
// ==========================================

/**
 * Detect crisis indicators in user message
 * @param {string} message - User message
 * @returns {boolean} - True if crisis detected
 */
function detectCrisis(message) {
    const text = message.toLowerCase();
    
    // Check for crisis keywords
    const hasCrisisKeywords = AICompanionState.crisisKeywords.some(keyword => 
        text.includes(keyword)
    );
    
    // Check for crisis phrases
    const crisisPhrases = [
        'want to die',
        'kill myself',
        'end my life',
        'not worth living',
        'better off dead',
        'can\'t take it anymore',
        'want to disappear',
        'hurt myself'
    ];
    
    const hasCrisisPhrases = crisisPhrases.some(phrase => 
        text.includes(phrase)
    );
    
    return hasCrisisKeywords || hasCrisisPhrases;
}

/**
 * Handle crisis detection
 */
function handleCrisisDetection() {
    console.log('Crisis detected - showing crisis support modal');
    
    // Display crisis response
    const crisisResponse = getRandomResponse(AIResponses.crisis);
    displayMessage(crisisResponse, 'ai');
    saveMessageToHistory(crisisResponse, 'ai');
    
    // Show crisis alert modal
    setTimeout(() => {
        showCrisisAlert();
    }, 1000);
    
    // Log crisis event (in real app, this would alert human moderators)
    logCrisisEvent();
}

/**
 * Show crisis alert modal
 */
function showCrisisAlert() {
    const modal = document.getElementById('crisisAlertModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

/**
 * Close crisis alert modal
 */
function closeCrisisAlert() {
    const modal = document.getElementById('crisisAlertModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

/**
 * Log crisis event for monitoring
 */
function logCrisisEvent() {
    const crisisEvent = {
        timestamp: new Date().toISOString(),
        userId: 'current-user', // In real app, this would be actual user ID
        conversationId: AICompanionState.sessionStartTime.toISOString(),
        severity: 'high',
        context: AICompanionState.conversationHistory.slice(-5)
    };
    
    // In real app, this would be sent to crisis monitoring system
    console.log('Crisis event logged:', crisisEvent);
    
    // Store locally for demo
    let crisisEvents = JSON.parse(localStorage.getItem('crisisEvents') || '[]');
    crisisEvents.push(crisisEvent);
    localStorage.setItem('crisisEvents', JSON.stringify(crisisEvents));
}

// ==========================================
// CRISIS SUPPORT ACTIONS
// ==========================================

/**
 * Call emergency services
 */
function callEmergency() {
    // In real app, this would integrate with emergency services
    window.open('tel:988', '_self'); // Suicide & Crisis Lifeline
    closeCrisisAlert();
}

/**
 * Contact user's therapist
 */
function contactTherapist() {
    // In real app, this would send alert to user's assigned therapist
    showNotification('Your therapist has been notified and will contact you shortly.', 'info');
    closeCrisisAlert();
}

/**
 * View crisis resources
 */
function viewCrisisResources() {
    // In real app, this would open crisis resources page
    window.open('https://suicidepreventionlifeline.org/', '_blank');
    closeCrisisAlert();
}

// ==========================================
// QUICK ACTIONS
// ==========================================

/**
 * Request mood check
 */
function requestMoodCheck() {
    const message = "I'd like to do a quick mood check";
    const input = document.getElementById('aiChatInput');
    if (input) {
        input.value = message;
        sendAIMessage();
    }
}

/**
 * Request coping strategies
 */
function requestCopingStrategies() {
    const message = "Can you help me with some coping strategies?";
    const input = document.getElementById('aiChatInput');
    if (input) {
        input.value = message;
        sendAIMessage();
    }
}

/**
 * Request resources
 */
function requestResources() {
    const message = "I'd like some mental health resources";
    const input = document.getElementById('aiChatInput');
    if (input) {
        input.value = message;
        sendAIMessage();
    }
}

/**
 * Start guided meditation
 */
function startGuidedMeditation() {
    showNotification('Starting 5-minute guided meditation...', 'info');
    // In real app, this would launch meditation module
}

/**
 * Open journal prompt
 */
function openJournalPrompt() {
    window.location.href = 'mood-tracker.html';
}

/**
 * Schedule therapy session
 */
function scheduleTherapySession() {
    window.location.href = 'meeting.html';
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get conversation statistics
 * @returns {Object} - Conversation stats
 */
function getConversationStats() {
    const history = AICompanionState.conversationHistory;
    const userMessages = history.filter(msg => msg.sender === 'user');
    
    const sentiments = userMessages.map(msg => msg.sentiment).filter(Boolean);
    const sentimentCounts = sentiments.reduce((acc, sentiment) => {
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
    }, {});
    
    return {
        totalMessages: history.length,
        userMessages: userMessages.length,
        sessionDuration: Date.now() - AICompanionState.sessionStartTime.getTime(),
        sentimentBreakdown: sentimentCounts,
        averageResponseTime: calculateAverageResponseTime()
    };
}

/**
 * Calculate average AI response time
 * @returns {number} - Average response time in milliseconds
 */
function calculateAverageResponseTime() {
    // This would track actual response times in a real implementation
    return 1500; // Simulated average
}

// ==========================================
// DEVELOPMENT HELPERS
// ==========================================

// Make AI companion state available globally in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.AICompanionState = AICompanionState;
    window.getConversationStats = getConversationStats;
    console.log('Development mode: AICompanionState available globally');
}

// Add CSS for typing indicator
const typingCSS = `
.typing-indicator .typing-dots {
    display: flex;
    gap: 4px;
    align-items: center;
}

.typing-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gray-400);
    animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
    0%, 80%, 100% { 
        transform: scale(0.8);
        opacity: 0.5;
    }
    40% { 
        transform: scale(1);
        opacity: 1;
    }
}
`;

// Inject typing indicator CSS
const style = document.createElement('style');
style.textContent = typingCSS;
document.head.appendChild(style);