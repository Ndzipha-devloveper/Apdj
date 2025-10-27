/* ======================================================================
// DATABASE DATA LOADING 
// ======================================================================

class TextFileDatabase {
    constructor() {
        this.data = {};
        this.basePath = './data/';
    }

    async loadAllData() {
        try {
            const files = [
                { name: 'users', file: 'users.json' },
                { name: 'clients', file: 'clients.json' },
                { name: 'counselors', file: 'counselors.json' },
                { name: 'sessions', file: 'sessions.json' }
            ];
            
            const loadPromises = files.map(async ({ name, file }) => {
                try {
                    const response = await fetch(${this.basePath}${file});
                    if (!response.ok) {
                        console.warn(⚠ Could not load ${file}, using empty data);
                        this.data[name] = [];
                        return;
                    }
                    this.data[name] = await response.json();
                    console.log(✅ Loaded ${name}:, this.data[name].length, 'records');
                } catch (error) {
                    console.warn(⚠ Error loading ${file}:, error);
                    this.data[name] = [];
                }
            });
            
            await Promise.all(loadPromises);
            console.log('📊 Database initialization complete');
            return this.data;
            
        } catch (error) {
            console.error('❌ Database loading failed:', error);
            this.data = { users: [], clients: [], counselors: [], sessions: [] };
            return this.data;
        }
    }

    findUserByEmail(email) {
        return this.data.users.find(user => user.email === email);
    }

    findCounselorsBySpecialty(specialty) {
        return this.data.counselors.filter(counselor => 
            counselor.specialty === specialty
        );
    }

    getClientSessions(clientId) {
        return this.data.sessions.filter(session => session.clientId === clientId);
    }
}

// Initialize database globally (PUT THIS RIGHT AFTER THE CLASS)
const db = new TextFileDatabase();

// ======================================================================
// AUTHENTICATION SYSTEM 
// ======================================================================

const AuthSystem = {
    async login(email, password) {
        const user = db.findUserByEmail(email);
        
        if (user && user.password === password) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            showNotification(Welcome back, ${user.username}!, 'success');
            return { success: true, user };
        }
        showNotification('Invalid email or password', 'error');
        return { success: false, error: 'Invalid credentials' };
    },

    logout() {
        localStorage.removeItem('currentUser');
        showNotification('Logged out successfully', 'info');
        updateUI();
    },

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }
};

// ======================================================================
// DATA MANAGER 
// ======================================================================

const DataManager = {
    addUser(newUser) {
        const users = [...db.data.users];
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        
        const userToAdd = {
            ...newUser,
            id: newId,
            createdAt: new Date().toISOString()
        };
        
        users.push(userToAdd);
        db.data.users = users;
        this.saveToLocalStorage('users', users);
        showNotification('Account created successfully!', 'success');
        return userToAdd;
    },

    updateUserProfile(userId, updates) {
        const users = db.data.users.map(user => 
            user.id === userId ? { ...user, ...updates } : user
        );
        db.data.users = users;
        this.saveToLocalStorage('users', users);
        showNotification('Profile updated!', 'success');
    },

    saveToLocalStorage(key, data) {
        localStorage.setItem(db_${key}, JSON.stringify(data));
    },

    loadFromLocalStorage(key) {
        const stored = localStorage.getItem(db_${key});
        return stored ? JSON.parse(stored) : null;
    }
};

// ======================================================================
// INITIALIZATION FUNCTION 
// ======================================================================

async function initializeDatabase() {
    console.log('🚀 Initializing Database...');
    await db.loadAllData();
    console.log('✅ Database ready for use');
}

// ======================================================================
/**
 * ONLINE COUNSELING WEBSITE - JAVASCRIPT
 * 
 * This file contains all the interactive functionality for the counseling website.
 * It includes navigation, form handling, chatbot functionality, and meeting controls.
 */

// ==========================================
// GLOBAL VARIABLES & STATE MANAGEMENT
// ==========================================

// Global state object to manage application state
const AppState = {
    isMobileMenuOpen: false,
    isChatbotOpen: false,
    currentSignupStep: 1,
    sessionTimer: null,
    sessionDuration: 0,
    isAudioMuted: false,
    isVideoOff: true,
    isScreenSharing: false,
    isChatOpen: false,
    sentimentAnalysis: {
        enabled: true,
        currentSentiment: 'neutral',
        riskLevel: 'low'
    },
    smartRecommendations: {
        enabled: true,
        lastUpdate: null,
        recommendations: []
    }
};

// Chatbot responses for different contexts
const ChatbotResponses = {
    greetings: [
        "Hello! I'm here to help you with any questions about our counseling services.",
        "Hi there! How can I assist you today?",
        "Welcome! What would you like to know about our online therapy platform?"
    ],
    services: [
        "We offer individual therapy, couples counseling, and group sessions with licensed therapists.",
        "Our services include anxiety treatment, depression counseling, stress management, and relationship therapy.",
        "All our sessions are conducted through secure video calls with HIPAA-compliant technology."
    ],
    scheduling: [
        "You can schedule sessions 7 days a week, including evenings and weekends.",
        "Most clients can get their first appointment within 24-48 hours.",
        "You can reschedule or cancel appointments up to 24 hours in advance."
    ],
    privacy: [
        "Your privacy is our top priority. All sessions are end-to-end encrypted and HIPAA compliant.",
        "We never store session recordings, and all your information is kept strictly confidential.",
        "You can review our full privacy policy to understand how we protect your data."
    ],
    aiFeatures: [
        "Our AI companion provides 24/7 support between therapy sessions with personalized guidance.",
        "Smart mood tracking helps identify patterns and triggers in your emotional wellbeing.",
        "Real-time sentiment analysis ensures you get appropriate support when you need it most.",
        "Personalized recommendations are curated based on your progress and preferences."
    ],
    default: [
        "That's a great question! For detailed information, I'd recommend contacting our support team.",
        "I understand you'd like to know more. Our support team can provide specific details about that.",
        "For the most accurate information about that topic, please reach out to our support team at support@counselcare.com"
    ]
};

// Smart Recommendations Engine
const RecommendationsEngine = {
    categories: {
        breathing: {
            title: 'Breathing Exercises',
            icon: 'wind',
            items: [
                { title: '4-7-8 Breathing', duration: '5 min', difficulty: 'beginner' },
                { title: 'Box Breathing', duration: '10 min', difficulty: 'intermediate' },
                { title: 'Coherent Breathing', duration: '15 min', difficulty: 'advanced' }
            ]
        },
        mindfulness: {
            title: 'Mindfulness & Meditation',
            icon: 'brain',
            items: [
                { title: 'Body Scan Meditation', duration: '20 min', difficulty: 'beginner' },
                { title: 'Loving-Kindness Meditation', duration: '15 min', difficulty: 'intermediate' },
                { title: 'Mindful Walking', duration: '10 min', difficulty: 'beginner' }
            ]
        },
        articles: {
            title: 'Educational Resources',
            icon: 'book',
            items: [
                { title: 'Understanding Anxiety Triggers', readTime: '8 min', category: 'anxiety' },
                { title: 'Building Emotional Resilience', readTime: '12 min', category: 'general' },
                { title: 'Sleep and Mental Health', readTime: '6 min', category: 'wellness' }
            ]
        }
    },
    
    generateRecommendations: function(userProfile) {
        const recommendations = [];
        
        // Analyze user's recent mood data
        const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        const recentMoods = moodHistory.slice(0, 7);
        
        // Recommend based on mood patterns
        if (recentMoods.some(entry => entry.emotions && entry.emotions.includes('anxious'))) {
            recommendations.push({
                type: 'breathing',
                item: this.categories.breathing.items[0],
                reason: 'Based on your recent anxiety levels'
            });
        }
        
        if (recentMoods.some(entry => entry.mood <= 2)) {
            recommendations.push({
                type: 'mindfulness',
                item: this.categories.mindfulness.items[0],
                reason: 'To help improve your mood'
            });
        }
        
        // Add educational content
        recommendations.push({
            type: 'articles',
            item: this.categories.articles.items[0],
            reason: 'Recommended for your current focus areas'
        });
        
        return recommendations.slice(0, 3); // Return top 3 recommendations
    }
};

// ==========================================
// INITIALIZATION & DOM READY
// ==========================================

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Main initialization function that sets up all interactive features
 */
function initializeApp() {
    console.log('Initializing CounselCare Website...');
    
    // Initialize navigation
    setupNavigation();
    
    // Initialize forms
    setupForms();
    
    // Initialize chatbot
    setupChatbot();
    
    // Initialize meeting functionality (if on meeting page)
    if (document.body.classList.contains('meeting-body')) {
        setupMeeting();
    }
    
    // Initialize FAQ functionality
    setupFAQ();
    
    // Initialize signup flow
    setupSignupFlow();
    
    // Initialize AI features
    initializeAIFeatures();
    
    console.log('Website initialization complete');
}

// ==========================================
// AI FEATURES INITIALIZATION
// ==========================================

/**
 * Initialize AI-powered features
 */
function initializeAIFeatures() {
    // Initialize sentiment analysis
    if (AppState.sentimentAnalysis.enabled) {
        initializeSentimentAnalysis();
    }
    
    // Initialize smart recommendations
    if (AppState.smartRecommendations.enabled) {
        initializeSmartRecommendations();
    }
    
    // Setup real-time monitoring
    setupRealTimeMonitoring();
    
    console.log('AI features initialized');
}

/**
 * Initialize sentiment analysis system
 */
function initializeSentimentAnalysis() {
    // Monitor text inputs for sentiment analysis
    const textInputs = document.querySelectorAll('textarea, input[type="text"]');
    
    textInputs.forEach(input => {
        let timeoutId;
        
        input.addEventListener('input', function() {
            clearTimeout(timeoutId);
            
            // Debounce sentiment analysis
            timeoutId = setTimeout(() => {
                const text = this.value.trim();
                if (text.length > 10) {
                    analyzeSentimentRealTime(text);
                }
            }, 1000);
        });
    });
    
    console.log('Sentiment analysis initialized');
}

/**
 * Analyze sentiment in real-time
 * @param {string} text - Text to analyze
 */
function analyzeSentimentRealTime(text) {
    const sentiment = performSentimentAnalysis(text);
    const riskLevel = assessRiskLevel(text, sentiment);
    
    // Update state
    AppState.sentimentAnalysis.currentSentiment = sentiment;
    AppState.sentimentAnalysis.riskLevel = riskLevel;
    
    // Handle high-risk situations
    if (riskLevel === 'high') {
        triggerCrisisAlert();
    } else if (riskLevel === 'medium') {
        offerSupportResources();
    }
    
    // Update recommendations based on sentiment
    updateSmartRecommendations();
    
    console.log('Sentiment analyzed:', sentiment, 'Risk level:', riskLevel);
}

/**
 * Perform sentiment analysis on text
 * @param {string} text - Text to analyze
 * @returns {string} - Sentiment classification
 */
function performSentimentAnalysis(text) {
    const lowerText = text.toLowerCase();
    
    // Positive indicators
    const positiveWords = [
        'happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'love', 'joy', 
        'excited', 'grateful', 'thankful', 'better', 'improving', 'hopeful', 'positive',
        'confident', 'peaceful', 'calm', 'relaxed', 'content', 'satisfied'
    ];
    
    // Negative indicators
    const negativeWords = [
        'sad', 'depressed', 'anxious', 'worried', 'stressed', 'angry', 'frustrated', 
        'hopeless', 'terrible', 'awful', 'hate', 'worse', 'struggling', 'overwhelmed',
        'lonely', 'scared', 'afraid', 'panic', 'crisis', 'desperate', 'worthless'
    ];
    
    // Crisis indicators
    const crisisWords = [
        'suicide', 'kill myself', 'end it all', 'hurt myself', 'can\'t go on',
        'want to die', 'better off dead', 'no point', 'give up', 'hopeless'
    ];
    
    let positiveScore = 0;
    let negativeScore = 0;
    let crisisScore = 0;
    
    // Count word occurrences
    positiveWords.forEach(word => {
        if (lowerText.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
        if (lowerText.includes(word)) negativeScore++;
    });
    
    crisisWords.forEach(word => {
        if (lowerText.includes(word)) crisisScore++;
    });
    
    // Determine sentiment
    if (crisisScore > 0) return 'crisis';
    if (negativeScore > positiveScore + 1) return 'negative';
    if (positiveScore > negativeScore + 1) return 'positive';
    return 'neutral';
}

/**
 * Assess risk level based on text and sentiment
 * @param {string} text - Original text
 * @param {string} sentiment - Detected sentiment
 * @returns {string} - Risk level (low, medium, high)
 */
function assessRiskLevel(text, sentiment) {
    if (sentiment === 'crisis') return 'high';
    
    const lowerText = text.toLowerCase();
    
    // High-risk phrases
    const highRiskPhrases = [
        'want to hurt myself', 'thinking about suicide', 'can\'t take it anymore',
        'no one would miss me', 'planning to end', 'have a plan'
    ];
    
    // Medium-risk indicators
    const mediumRiskPhrases = [
        'feeling hopeless', 'very depressed', 'severe anxiety', 'panic attacks',
        'can\'t cope', 'everything is falling apart', 'losing control'
    ];
    
    if (highRiskPhrases.some(phrase => lowerText.includes(phrase))) {
        return 'high';
    }
    
    if (mediumRiskPhrases.some(phrase => lowerText.includes(phrase)) || sentiment === 'negative') {
        return 'medium';
    }
    
    return 'low';
}

/**
 * Trigger crisis alert system
 */
function triggerCrisisAlert() {
    // Log crisis event
    const crisisEvent = {
        timestamp: new Date().toISOString(),
        type: 'sentiment_analysis',
        severity: 'high',
        context: 'Real-time text analysis detected crisis indicators'
    };
    
    // Store crisis event
    let crisisEvents = JSON.parse(localStorage.getItem('crisisEvents') || '[]');
    crisisEvents.push(crisisEvent);
    localStorage.setItem('crisisEvents', JSON.stringify(crisisEvents));
    
    // Show immediate support options
    showCrisisSupport();
    
    console.log('Crisis alert triggered:', crisisEvent);
}

/**
 * Show crisis support modal
 */
function showCrisisSupport() {
    // Create crisis support modal if it doesn't exist
    let modal = document.getElementById('crisisSupportModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'crisisSupportModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content crisis-modal">
                <div class="modal-header crisis-header">
                    <h3>🚨 Immediate Support Available</h3>
                </div>
                <div class="modal-body">
                    <p>I've detected that you might be going through a crisis. Your safety and wellbeing are our top priority.</p>
                    <div class="crisis-options">
                        <button class="crisis-btn emergency" onclick="callCrisisHotline()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            Call Crisis Hotline (988)
                        </button>
                        <button class="crisis-btn therapist" onclick="emergencyTherapistContact()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Emergency Therapist Contact
                        </button>
                        <button class="crisis-btn resources" onclick="viewCrisisResources()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14,2 14,8 20,8"></polyline>
                            </svg>
                            Crisis Resources
                        </button>
                    </div>
                    <p class="crisis-note">Remember: You are not alone, and help is always available.</p>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn secondary" onclick="closeCrisisSupport()">I'm Safe Now</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    modal.classList.add('active');
    modal.style.display = 'flex';
}

/**
 * Offer support resources for medium-risk situations
 */
function offerSupportResources() {
    // Show gentle support notification
    showNotification(
        'I notice you might be going through a difficult time. Would you like some coping resources or to talk to someone?',
        'info',
        8000 // Show for 8 seconds
    );
    
    // Update recommendations to include coping strategies
    const copingRecommendations = [
        {
            type: 'breathing',
            title: 'Breathing Exercise',
            description: '5-minute guided breathing to reduce stress',
            action: 'startBreathingExercise()'
        },
        {
            type: 'support',
            title: 'Talk to AI Companion',
            description: 'Get immediate support and guidance',
            action: 'window.location.href="ai-companion.html"'
        }
    ];
    
    AppState.smartRecommendations.recommendations = copingRecommendations;
}

/**
 * Initialize smart recommendations system
 */
function initializeSmartRecommendations() {
    // Generate initial recommendations
    updateSmartRecommendations();
    
    // Update recommendations periodically
    setInterval(updateSmartRecommendations, 5 * 60 * 1000); // Every 5 minutes
    
    console.log('Smart recommendations initialized');
}

/**
 * Update smart recommendations based on user data
 */
function updateSmartRecommendations() {
    const userProfile = getUserProfile();
    const recommendations = RecommendationsEngine.generateRecommendations(userProfile);
    
    AppState.smartRecommendations.recommendations = recommendations;
    AppState.smartRecommendations.lastUpdate = new Date().toISOString();
    
    // Update UI if recommendations panel exists
    updateRecommendationsDisplay();
    
    console.log('Smart recommendations updated:', recommendations.length, 'items');
}

/**
 * Get user profile for recommendations
 * @returns {Object} - User profile data
 */
function getUserProfile() {
    const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    const conversationHistory = JSON.parse(localStorage.getItem('aiConversationHistory') || '[]');
    
    return {
        moodHistory,
        conversationHistory,
        currentSentiment: AppState.sentimentAnalysis.currentSentiment,
        riskLevel: AppState.sentimentAnalysis.riskLevel,
        lastActivity: new Date().toISOString()
    };
}

/**
 * Update recommendations display in UI
 */
function updateRecommendationsDisplay() {
    const recommendationsContainer = document.querySelector('.recommendations-list');
    if (!recommendationsContainer) return;
    
    const recommendations = AppState.smartRecommendations.recommendations;
    
    // Clear existing recommendations
    recommendationsContainer.innerHTML = '';
    
    recommendations.forEach(rec => {
        const recElement = document.createElement('div');
        recElement.className = 'recommendation-item';
        recElement.innerHTML = `
            <div class="recommendation-icon">
                ${getRecommendationIcon(rec.type)}
            </div>
            <div class="recommendation-content">
                <h4>${rec.item ? rec.item.title : rec.title}</h4>
                <p>${rec.item ? rec.item.description || rec.reason : rec.description}</p>
            </div>
            <button class="try-btn" onclick="${rec.action || 'tryRecommendation(\'' + rec.type + '\')'}">
                Try Now
            </button>
        `;
        
        recommendationsContainer.appendChild(recElement);
    });
}

/**
 * Get icon for recommendation type
 * @param {string} type - Recommendation type
 * @returns {string} - SVG icon HTML
 */
function getRecommendationIcon(type) {
    const icons = {
        breathing: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11H1v3h8v3l8-5-8-5v3z"></path>
            </svg>
        `,
        mindfulness: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <path d="M12 17h.01"></path>
            </svg>
        `,
        articles: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
            </svg>
        `,
        support: `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        `
    };
    
    return icons[type] || icons.support;
}

/**
 * Setup real-time monitoring for user behavior
 */
function setupRealTimeMonitoring() {
    // Monitor page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // User switched away - might indicate distress
            console.log('User switched away from page');
        } else {
            // User returned
            console.log('User returned to page');
        }
    });
    
    // Monitor rapid clicking (might indicate frustration)
    let clickCount = 0;
    let clickTimer = null;
    
    document.addEventListener('click', function() {
        clickCount++;
        
        if (clickTimer) clearTimeout(clickTimer);
        
        clickTimer = setTimeout(() => {
            if (clickCount > 10) {
                console.log('Rapid clicking detected - possible frustration');
                offerSupportResources();
            }
            clickCount = 0;
        }, 5000);
    });
    
    console.log('Real-time monitoring setup complete');
}

// ==========================================
// CRISIS SUPPORT FUNCTIONS
// ==========================================

/**
 * Call crisis hotline
 */
function callCrisisHotline() {
    window.open('tel:988', '_self');
    closeCrisisSupport();
}

/**
 * Emergency therapist contact
 */
function emergencyTherapistContact() {
    showNotification('Emergency therapist notification sent. You will be contacted within 15 minutes.', 'info');
    closeCrisisSupport();
}

/**
 * View crisis resources
 */
function viewCrisisResources() {
    window.open('https://suicidepreventionlifeline.org/', '_blank');
    closeCrisisSupport();
}

/**
 * Close crisis support modal
 */
function closeCrisisSupport() {
    const modal = document.getElementById('crisisSupportModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

/**
 * Try recommendation
 * @param {string} type - Recommendation type
 */
function tryRecommendation(type) {
    switch (type) {
        case 'breathing':
            startBreathingExercise();
            break;
        case 'mindfulness':
            showNotification('Starting mindfulness exercise...', 'info');
            break;
        case 'articles':
            showNotification('Opening recommended article...', 'info');
            break;
        case 'support':
            window.location.href = 'ai-companion.html';
            break;
        default:
            showNotification('Feature coming soon!', 'info');
    }
}

// ==========================================
// NAVIGATION FUNCTIONALITY
// ==========================================

/**
 * Setup navigation functionality including mobile menu toggle
 */
function setupNavigation() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking on nav links
    if (navLinks) {
        navLinks.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-link')) {
                if (AppState.isMobileMenuOpen) {
                    toggleMobileMenu();
                }
            }
        });
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (AppState.isMobileMenuOpen && !e.target.closest('.nav')) {
            toggleMobileMenu();
        }
    });
}

/**
 * Toggle mobile navigation menu open/closed
 */
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (!navLinks || !mobileToggle) return;
    
    AppState.isMobileMenuOpen = !AppState.isMobileMenuOpen;
    
    // Toggle active class on nav links
    navLinks.classList.toggle('active', AppState.isMobileMenuOpen);
    
    // Animate hamburger menu icon
    const spans = mobileToggle.querySelectorAll('span');
    spans.forEach((span, index) => {
        if (AppState.isMobileMenuOpen) {
            if (index === 0) span.style.transform = 'rotate(45deg) translate(6px, 6px)';
            if (index === 1) span.style.opacity = '0';
            if (index === 2) span.style.transform = 'rotate(-45deg) translate(6px, -6px)';
        } else {
            span.style.transform = '';
            span.style.opacity = '';
        }
    });
    
    console.log('Mobile menu toggled:', AppState.isMobileMenuOpen ? 'open' : 'closed');
}

// ==========================================
// FORM HANDLING
// ==========================================

/**
 * Setup form validation and handling for all forms
 */
function setupForms() {
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignupStep1);
    }
    
    // Forgot password form
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
}

/**
 * Handle contact form submission with validation
 * @param {Event} event - Form submit event
 */
function handleContactSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Get form values
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const subject = formData.get('subject');
    const message = formData.get('message').trim();
    
    // Basic validation
    if (!name || !email || !subject || !message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Email validation
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Analyze message sentiment for support routing
    const sentiment = performSentimentAnalysis(message);
    const riskLevel = assessRiskLevel(message, sentiment);
    
    if (riskLevel === 'high') {
        showNotification('We\'ve detected you may need immediate support. A crisis counselor will contact you within 30 minutes.', 'warning');
    }
    
    // Simulate form submission
    const submitButton = form.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        showNotification('Thank you for contacting us! We\'ll get back to you within 24 hours.', 'success');
        form.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        console.log('Contact form submitted:', { name, email, subject, message });
    }, 1500);
}

/**
 * Handle login form submission with validation
 * @param {Event} event - Form submit event
 */
function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    
    // Clear previous errors
    clearFormErrors();
    
    let hasErrors = false;
    
    // Validate email
    if (!email) {
        showFieldError('emailError', 'Email is required');
        hasErrors = true;
    } else if (!isValidEmail(email)) {
        showFieldError('emailError', 'Please enter a valid email address');
        hasErrors = true;
    }
    
    // Validate password
    if (!password) {
        showFieldError('passwordError', 'Password is required');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    // Simulate login process
    const submitButton = form.querySelector('.login-button');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Signing In...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        // Simulate successful login
        showNotification('Welcome back! Redirecting to your dashboard...', 'success');
        
        // In a real app, this would redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
        console.log('Login successful for:', email);
    }, 1500);
}

/**
 * Handle first step of signup process
 * @param {Event} event - Form submit event
 */
function handleSignupStep1(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Validate required fields
    const firstName = formData.get('firstName').trim();
    const lastName = formData.get('lastName').trim();
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const dateOfBirth = formData.get('dateOfBirth');
    const agreeTerms = formData.get('agreeTerms');
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || !dateOfBirth || !agreeTerms) {
        showNotification('Please fill in all required fields and agree to the terms.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long.', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return;
    }
    
    // Store signup data (in real app, this would be sent to server)
    const signupData = {
        firstName,
        lastName,
        email,
        dateOfBirth,
        emailUpdates: formData.get('emailUpdates') === 'on'
    };
    
    localStorage.setItem('signupData', JSON.stringify(signupData));
    
    // Proceed to step 2
    goToStep(2);
    
    console.log('Signup Step 1 completed:', signupData);
}

/**
 * Handle second step of signup (assessment)
 * @param {Event} event - Form submit event
 */
function handleSignupStep2(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Get selected concerns
    const concerns = [];
    const concernInputs = form.querySelectorAll('input[name="concerns"]:checked');
    concernInputs.forEach(input => concerns.push(input.value));
    
    const assessmentData = {
        concerns,
        therapyExperience: formData.get('therapyExperience'),
        genderPreference: formData.get('genderPreference'),
        sessionFrequency: formData.get('sessionFrequency')
    };
    
    // Validate required fields
    if (concerns.length === 0 || !assessmentData.therapyExperience || !assessmentData.sessionFrequency) {
        showNotification('Please complete all required fields.', 'error');
        return;
    }
    
    // Store assessment data
    const existingData = JSON.parse(localStorage.getItem('signupData') || '{}');
    const completeSignupData = { ...existingData, ...assessmentData };
    localStorage.setItem('signupData', JSON.stringify(completeSignupData));
    
    // Proceed to matching step
    goToStep(3);
    startMatchingProcess();
    
    console.log('Assessment completed:', assessmentData);
}

/**
 * Handle forgot password form submission
 * @param {Event} event - Form submit event
 */
function handleForgotPassword(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.resetEmail.value.trim();
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    const submitButton = form.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    setTimeout(() => {
        showNotification('Password reset link sent to your email!', 'success');
        hideForgotPassword();
        form.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        console.log('Password reset requested for:', email);
    }, 1500);
}

// ==========================================
// FORM UTILITIES
// ==========================================

/**
 * Validate email address format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Clear all form error messages
 */
function clearFormErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.classList.remove('show');
        element.textContent = '';
    });
}

/**
 * Show error message for specific field
 * @param {string} fieldId - ID of error element
 * @param {string} message - Error message to display
 */
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

/**
 * Toggle password visibility
 * @param {string} passwordFieldId - ID of password input field
 */
function togglePassword(passwordFieldId) {
    const passwordField = document.getElementById(passwordFieldId);
    const toggleButton = passwordField.parentNode.querySelector('.password-toggle');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        passwordField.type = 'password';
        toggleButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

// ==========================================
// SIGNUP FLOW MANAGEMENT
// ==========================================

/**
 * Setup signup flow functionality
 */
function setupSignupFlow() {
    // Initialize matching process if on signup page
    if (document.getElementById('step3')) {
        // Set up assessment form handler
        const assessmentForm = document.querySelector('.assessment-form');
        if (assessmentForm) {
            assessmentForm.addEventListener('submit', handleSignupStep2);
        }
    }
}

/**
 * Navigate to specific signup step
 * @param {number} stepNumber - Step number to navigate to
 */
function goToStep(stepNumber) {
    // Hide all steps
    const steps = document.querySelectorAll('.signup-step');
    steps.forEach(step => step.classList.remove('active'));
    
    // Hide all progress steps
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach(step => step.classList.remove('active'));
    
    // Show target step
    const targetStep = document.getElementById(`step${stepNumber}`);
    const targetProgress = document.querySelector(`[data-step="${stepNumber}"]`);
    
    if (targetStep) targetStep.classList.add('active');
    if (targetProgress) targetProgress.classList.add('active');
    
    AppState.currentSignupStep = stepNumber;
    
    console.log('Navigated to signup step:', stepNumber);
}

/**
 * Start the therapist matching animation process
 */
function startMatchingProcess() {
    const matchingText = document.querySelector('.matching-text');
    const matchingResults = document.getElementById('matchingResults');
    
    if (!matchingText || !matchingResults) return;
    
    const messages = [
        "Analyzing your preferences...",
        "Searching our therapist database...",
        "Finding the perfect match...",
        "Almost done..."
    ];
    
    let messageIndex = 0;
    const interval = setInterval(() => {
        if (messageIndex < messages.length) {
            matchingText.textContent = messages[messageIndex];
            messageIndex++;
        } else {
            clearInterval(interval);
            // Show results after animation
            setTimeout(() => {
                document.querySelector('.matching-animation').style.display = 'none';
                matchingResults.style.display = 'block';
            }, 1000);
        }
    }, 1500);
    
    console.log('Matching process started');
}

// ==========================================
// CHATBOT FUNCTIONALITY
// ==========================================

/**
 * Initialize chatbot functionality
 */
function setupChatbot() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotInput = document.getElementById('chatbotInput');
    
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', toggleChatbot);
    }
    
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', handleChatInput);
    }
    
    // Add initial greeting after a short delay
    setTimeout(() => {
        addChatbotGreeting();
    }, 1000);
}

/**
 * Toggle chatbot window open/closed
 */
function toggleChatbot() {
    const chatbotWindow = document.getElementById('chatbotWindow');
    if (!chatbotWindow) return;
    
    AppState.isChatbotOpen = !AppState.isChatbotOpen;
    
    if (AppState.isChatbotOpen) {
        chatbotWindow.classList.add('active');
        chatbotWindow.style.display = 'flex';
        
        // Focus on input when opening
        const input = document.getElementById('chatbotInput');
        if (input) setTimeout(() => input.focus(), 100);
    } else {
        chatbotWindow.classList.remove('active');
        setTimeout(() => {
            chatbotWindow.style.display = 'none';
        }, 300);
    }
    
    console.log('Chatbot toggled:', AppState.isChatbotOpen ? 'open' : 'closed');
}

/**
 * Handle chat input keypress events
 * @param {Event} event - Keypress event
 */
function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

/**
 * Send chat message and generate bot response
 * @param {string} context - Optional context for specialized responses
 */
function sendChatMessage(context = 'general') {
    const input = document.getElementById('chatbotInput');
    const messagesContainer = document.getElementById('chatbotMessages');
    
    if (!input || !messagesContainer) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    addChatMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Analyze sentiment of user message
    const sentiment = performSentimentAnalysis(message);
    const riskLevel = assessRiskLevel(message, sentiment);
    
    // Handle crisis situations
    if (riskLevel === 'high') {
        setTimeout(() => {
            addChatMessage("I'm very concerned about what you've shared. Your safety is important. Let me connect you with immediate support resources.", 'bot');
            setTimeout(() => {
                showCrisisSupport();
            }, 1000);
        }, 500);
        return;
    }
    
    // Generate bot response after a delay
    setTimeout(() => {
        const response = generateChatbotResponse(message, context, sentiment);
        addChatMessage(response, 'bot');
    }, 1000);
    
    console.log('Chat message sent:', message);
}

/**
 * Add message to chat interface
 * @param {string} message - Message text
 * @param {string} sender - 'user' or 'bot'
 */
function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${sender}-message`;
    messageDiv.textContent = message;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Add initial chatbot greeting based on current page
 */
function addChatbotGreeting() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let greeting;
    
    switch (currentPage) {
        case 'how-it-works.html':
            greeting = "Hi! I can help you learn about our process. What would you like to know?";
            break;
        case 'contact.html':
            greeting = "Hi! I can help you with questions about contacting our team. What would you like to know?";
            break;
        case 'about.html':
            greeting = "Hi! I can tell you more about our team and mission. What would you like to know?";
            break;
        case 'dashboard.html':
            greeting = "Hi! I can help you navigate your dashboard and mental health tools. What would you like to explore?";
            break;
        default:
            greeting = "Hi there! How can I help you today?";
    }
    
    setTimeout(() => {
        addChatMessage(greeting, 'bot');
    }, 500);
}

/**
 * Generate chatbot response based on user message
 * @param {string} userMessage - User's message
 * @param {string} context - Context for response
 * @param {string} sentiment - Detected sentiment
 * @returns {string} - Bot response
 */
function generateChatbotResponse(userMessage, context, sentiment = 'neutral') {
    const message = userMessage.toLowerCase();
    
    // Check for specific keywords and respond accordingly
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        return getRandomResponse(ChatbotResponses.greetings);
    }
    
    if (message.includes('service') || message.includes('therapy') || message.includes('counseling')) {
        return getRandomResponse(ChatbotResponses.services);
    }
    
    if (message.includes('schedule') || message.includes('appointment') || message.includes('book')) {
        return getRandomResponse(ChatbotResponses.scheduling);
    }
    
    if (message.includes('private') || message.includes('secure') || message.includes('safe') || message.includes('confidential')) {
        return getRandomResponse(ChatbotResponses.privacy);
    }
    
    if (message.includes('ai') || message.includes('artificial intelligence') || message.includes('smart') || message.includes('companion')) {
        return getRandomResponse(ChatbotResponses.aiFeatures);
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('billing')) {
        return "Our pricing varies depending on your needs. Please contact our billing team at billing@counselcare.com for detailed pricing information.";
    }
    
    if (message.includes('emergency') || message.includes('crisis') || message.includes('urgent')) {
        return "If you're experiencing a mental health crisis, please call 988 (Suicide & Crisis Lifeline) or contact emergency services immediately. For non-emergency urgent support, call our crisis line at 1-800-CRISIS-1.";
    }
    
    // Sentiment-based responses
    if (sentiment === 'negative') {
        return "I can sense you might be going through a difficult time. Our AI companion and therapists are here to support you. Would you like me to connect you with some helpful resources?";
    }
    
    if (sentiment === 'positive') {
        return "I'm glad to hear you're feeling positive! It's wonderful when we can find moments of hope. How can I help you maintain this positive momentum?";
    }
    
    // Default response
    return getRandomResponse(ChatbotResponses.default);
}

/**
 * Get random response from response array
 * @param {Array} responses - Array of possible responses
 * @returns {string} - Random response
 */
function getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
}

// ==========================================
// FAQ FUNCTIONALITY
// ==========================================

/**
 * Setup FAQ toggle functionality
 */
function setupFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => toggleFAQ(question));
        }
    });
}

/**
 * Toggle FAQ item open/closed
 * @param {Element} questionElement - FAQ question element
 */
function toggleFAQ(questionElement) {
    const faqItem = questionElement.closest('.faq-item');
    const isActive = faqItem.classList.contains('active');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item.active').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
        }
    });
    
    // Toggle current item
    faqItem.classList.toggle('active', !isActive);
    
    console.log('FAQ item toggled:', questionElement.textContent.trim());
}

// ==========================================
// MODAL FUNCTIONALITY
// ==========================================

/**
 * Show booking modal
 */
function showBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        console.log('Booking modal shown');
    }
}

/**
 * Hide booking modal
 */
function hideBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        console.log('Booking modal hidden');
    }
}

/**
 * Show forgot password modal
 */
function showForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        
        // Focus on email input
        setTimeout(() => {
            const input = document.getElementById('resetEmail');
            if (input) input.focus();
        }, 100);
        
        console.log('Forgot password modal shown');
    }
}

/**
 * Hide forgot password modal
 */
function hideForgotPassword() {
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        console.log('Forgot password modal hidden');
    }
}

// ==========================================
// SOCIAL LOGIN HANDLERS
// ==========================================

/**
 * Handle social login attempts (demo functionality)
 * @param {string} provider - Social login provider ('google', 'microsoft', etc.)
 */
function handleSocialLogin(provider) {
    showNotification(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login would be implemented here.`, 'info');
    
    console.log(`Social login attempted with ${provider}`);
    
    // In a real implementation, this would redirect to OAuth provider
    // For demo purposes, we'll simulate a successful login
    setTimeout(() => {
        showNotification('Social login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }, 1000);
}

// ==========================================
// MEETING FUNCTIONALITY
// ==========================================

/**
 * Setup meeting page functionality
 */
function setupMeeting() {
    startSessionTimer();
    updateConnectionStatus();
    
    // Setup keyboard shortcuts
    document.addEventListener('keydown', handleMeetingKeyboard);
    
    console.log('Meeting functionality initialized');
}

/**
 * Start session timer
 */
function startSessionTimer() {
    const sessionTimeElement = document.getElementById('sessionTime');
    if (!sessionTimeElement) return;
    
    AppState.sessionDuration = 0;
    
    AppState.sessionTimer = setInterval(() => {
        AppState.sessionDuration++;
        const minutes = Math.floor(AppState.sessionDuration / 60);
        const seconds = AppState.sessionDuration % 60;
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        sessionTimeElement.textContent = timeString;
        
        // Also update the final time in modal
        const finalTimeElement = document.getElementById('finalSessionTime');
        if (finalTimeElement) {
            finalTimeElement.textContent = timeString;
        }
    }, 1000);
}

/**
 * Handle keyboard shortcuts in meeting
 * @param {Event} event - Keyboard event
 */
function handleMeetingKeyboard(event) {
    // Only handle shortcuts if not typing in input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch (event.key) {
        case 'm':
        case 'M':
            toggleMicrophone();
            break;
        case 'v':
        case 'V':
            toggleCamera();
            break;
        case 'c':
        case 'C':
            toggleChat();
            break;
        case 's':
        case 'S':
            toggleScreenShare();
            break;
        case 'Escape':
            if (AppState.isChatOpen) toggleChat();
            break;
    }
}

/**
 * Toggle microphone on/off
 */
function toggleMicrophone() {
    AppState.isAudioMuted = !AppState.isAudioMuted;
    const micBtn = document.getElementById('micBtn');
    
    if (micBtn) {
        micBtn.classList.toggle('muted', AppState.isAudioMuted);
        const label = micBtn.querySelector('.control-label');
        if (label) {
            label.textContent = AppState.isAudioMuted ? 'Unmute' : 'Mute';
        }
    }
    
    updateConnectionStatus();
    console.log('Microphone:', AppState.isAudioMuted ? 'muted' : 'unmuted');
}

/**
 * Toggle camera on/off
 */
function toggleCamera() {
    AppState.isVideoOff = !AppState.isVideoOff;
    const cameraBtn = document.getElementById('cameraBtn');
    const videoStatus = document.querySelector('.video-status');
    
    if (cameraBtn) {
        cameraBtn.classList.toggle('active', !AppState.isVideoOff);
        const label = cameraBtn.querySelector('.control-label');
        if (label) {
            label.textContent = AppState.isVideoOff ? 'Turn On' : 'Turn Off';
        }
    }
    
    if (videoStatus) {
        videoStatus.textContent = AppState.isVideoOff ? 'Camera Off' : 'Camera On';
    }
    
    console.log('Camera:', AppState.isVideoOff ? 'off' : 'on');
}

/**
 * Toggle screen sharing
 */
function toggleScreenShare() {
    AppState.isScreenSharing = !AppState.isScreenSharing;
    const screenBtn = document.getElementById('screenBtn');
    
    if (screenBtn) {
        screenBtn.classList.toggle('active', AppState.isScreenSharing);
        const label = screenBtn.querySelector('.control-label');
        if (label) {
            label.textContent = AppState.isScreenSharing ? 'Stop Share' : 'Share';
        }
    }
    
    // In a real implementation, this would start/stop screen sharing
    if (AppState.isScreenSharing) {
        showNotification('Screen sharing started', 'success');
    } else {
        showNotification('Screen sharing stopped', 'info');
    }
    
    console.log('Screen sharing:', AppState.isScreenSharing ? 'started' : 'stopped');
}

/**
 * Toggle chat sidebar
 */
function toggleChat() {
    AppState.isChatOpen = !AppState.isChatOpen;
    const chatSidebar = document.getElementById('chatSidebar');
    const chatBtn = document.getElementById('chatBtn');
    
    if (chatSidebar) {
        chatSidebar.classList.toggle('active', AppState.isChatOpen);
    }
    
    if (chatBtn) {
        chatBtn.classList.toggle('active', AppState.isChatOpen);
    }
    
    // Focus on chat input when opening
    if (AppState.isChatOpen) {
        setTimeout(() => {
            const chatInput = document.querySelector('#chatSidebar input');
            if (chatInput) chatInput.focus();
        }, 300);
    }
    
    console.log('Chat sidebar:', AppState.isChatOpen ? 'open' : 'closed');
}

/**
 * Handle chat input in meeting
 * @param {Event} event - Keyboard event
 */
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatMessage('meeting');
    }
}

/**
 * Toggle settings modal
 */
function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    const isActive = modal && modal.classList.contains('active');
    
    if (modal) {
        modal.classList.toggle('active', !isActive);
        modal.style.display = isActive ? 'none' : 'flex';
    }
    
    console.log('Settings modal:', isActive ? 'closed' : 'opened');
}

/**
 * End meeting session
 */
function endSession() {
    const modal = document.getElementById('endSessionModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
    
    console.log('End session modal shown');
}

/**
 * Hide end session modal
 */
function hideEndSessionModal() {
    const modal = document.getElementById('endSessionModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    console.log('End session modal hidden');
}

/**
 * Confirm session end and redirect
 */
function confirmEndSession() {
    // Clear session timer
    if (AppState.sessionTimer) {
        clearInterval(AppState.sessionTimer);
    }
    
    showNotification('Session ended. Thank you for using CounselCare!', 'success');
    
    // Redirect to home page after a delay
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
    
    console.log('Session ended');
}

/**
 * Update connection status indicator
 */
function updateConnectionStatus() {
    const statusElement = document.getElementById('connectionStatus');
    if (!statusElement) return;
    
    const indicator = statusElement.querySelector('.status-indicator');
    const statusText = statusElement.querySelector('.status-text');
    
    // Simulate connection quality based on current state
    let quality = 'good';
    let text = 'Connection: Good';
    
    if (AppState.isAudioMuted && AppState.isVideoOff) {
        quality = 'warning';
        text = 'Connection: Audio & Video Off';
    } else if (AppState.isAudioMuted) {
        quality = 'warning';
        text = 'Connection: Audio Muted';
    }
    
    // Update classes
    indicator.className = `status-indicator ${quality}`;
    if (statusText) statusText.textContent = text;
}

/**
 * Toggle session notes panel
 */
function toggleNotes() {
    const notesPanel = document.getElementById('sessionNotes');
    if (notesPanel) {
        const isVisible = notesPanel.style.display !== 'none';
        notesPanel.style.display = isVisible ? 'none' : 'block';
    }
}

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success', 'error', 'info', 'warning')
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 10000;
                min-width: 300px;
                max-width: 500px;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                animation: slideInRight 0.3s ease-out;
            }
            
            .notification-success {
                background: #10B981;
                color: white;
            }
            
            .notification-error {
                background: #EF4444;
                color: white;
            }
            
            .notification-warning {
                background: #F59E0B;
                color: white;
            }
            
            .notification-info {
                background: #3B82F6;
                color: white;
            }
            
            .notification-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
            }
            
            .notification-message {
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .notification {
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after specified duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
    
    console.log(`Notification shown: ${type} - ${message}`);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Smooth scroll to element
 * @param {string} elementId - ID of element to scroll to
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to execute immediately
 * @returns {Function} - Debounced function
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Format time duration
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted time string (MM:SS)
 */
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// ==========================================
// ERROR HANDLING
// ==========================================

/**
 * Global error handler
 */
window.addEventListener('error', function(event) {
    console.error('JavaScript Error:', event.error);
    
    // In development, show error notifications
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        showNotification('A JavaScript error occurred. Check console for details.', 'error');
    }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    
    // In development, show error notifications
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        showNotification('A promise rejection occurred. Check console for details.', 'error');
    }
});

// ==========================================
// DEVELOPMENT HELPERS
// ==========================================

/**
 * Development helper to log app state (only in development)
 */
function logAppState() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Current App State:', AppState);
    }
}

// Make development helpers available globally in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.AppState = AppState;
    window.logAppState = logAppState;
    window.showNotification = showNotification;
    window.RecommendationsEngine = RecommendationsEngine;
    window.performSentimentAnalysis = performSentimentAnalysis;
    window.assessRiskLevel = assessRiskLevel;
    
    console.log('Development mode active. Access AppState via window.AppState');
}
