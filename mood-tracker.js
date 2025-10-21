/**
 * MOOD TRACKER JAVASCRIPT
 * 
 * This file contains all the interactive functionality for the mood tracker page.
 * It includes mood selection, emotion tagging, journaling, analytics, and AI insights.
 */

// ==========================================
// MOOD TRACKER STATE MANAGEMENT
// ==========================================

const MoodTrackerState = {
    currentMood: null,
    selectedEmotions: [],
    selectedFactors: [],
    journalEntry: '',
    todayEntry: null,
    moodHistory: [],
    emotionPatterns: {},
    insights: [],
    chartInstance: null
};

// Mood and emotion data
const MoodData = {
    moodLabels: {
        '5': 'Excellent',
        '4': 'Good', 
        '3': 'Okay',
        '2': 'Low',
        '1': 'Struggling'
    },
    moodEmojis: {
        '5': '😊',
        '4': '🙂',
        '3': '😐',
        '2': '😔',
        '1': '😢'
    },
    emotionCategories: {
        positive: ['happy', 'excited', 'grateful', 'peaceful', 'confident'],
        negative: ['anxious', 'sad', 'angry', 'frustrated', 'lonely', 'overwhelmed'],
        neutral: ['stressed', 'tired', 'bored', 'confused']
    }
};

// Journal prompts for inspiration
const JournalPrompts = [
    "What made me feel this way today?",
    "What am I grateful for today?",
    "What would help me feel better?",
    "What was the highlight of my day?",
    "What challenged me today and how did I handle it?",
    "What do I need more of in my life?",
    "What patterns do I notice in my emotions?",
    "How can I be kinder to myself today?"
];

// ==========================================
// MOOD TRACKER INITIALIZATION
// ==========================================

/**
 * Initialize mood tracker when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeMoodTracker();
});

/**
 * Main mood tracker initialization function
 */
function initializeMoodTracker() {
    console.log('Initializing Mood Tracker...');
    
    // Set today's date
    updateTodayDate();
    
    // Load mood history
    loadMoodHistory();
    
    // Check for existing today's entry
    checkTodayEntry();
    
    // Initialize analytics
    initializeMoodAnalytics();
    
    // Setup event listeners
    setupMoodTrackerEventListeners();
    
    console.log('Mood Tracker initialization complete');
}

/**
 * Update today's date display
 */
function updateTodayDate() {
    const todayDateElement = document.getElementById('todayDate');
    if (todayDateElement) {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        todayDateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

/**
 * Setup mood tracker event listeners
 */
function setupMoodTrackerEventListeners() {
    // Journal textarea auto-resize
    const journalTextarea = document.getElementById('journalEntry');
    if (journalTextarea) {
        journalTextarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 200) + 'px';
        });
    }
}

/**
 * Load mood history from storage
 */
function loadMoodHistory() {
    const history = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    MoodTrackerState.moodHistory = history;
    
    // Update recent entries display
    displayRecentEntries();
    
    // Calculate emotion patterns
    calculateEmotionPatterns();
}

/**
 * Check if there's already an entry for today
 */
function checkTodayEntry() {
    const today = new Date().toDateString();
    const todayEntry = MoodTrackerState.moodHistory.find(entry => 
        new Date(entry.date).toDateString() === today
    );
    
    if (todayEntry) {
        MoodTrackerState.todayEntry = todayEntry;
        populateExistingEntry(todayEntry);
    }
}

/**
 * Populate form with existing entry data
 * @param {Object} entry - Existing mood entry
 */
function populateExistingEntry(entry) {
    // Select mood
    if (entry.mood) {
        selectMood(entry.mood);
    }
    
    // Select emotions
    if (entry.emotions) {
        entry.emotions.forEach(emotion => {
            toggleEmotion(emotion);
        });
    }
    
    // Populate journal
    if (entry.journal) {
        const journalTextarea = document.getElementById('journalEntry');
        if (journalTextarea) {
            journalTextarea.value = entry.journal;
        }
    }
    
    // Select factors
    if (entry.factors) {
        entry.factors.forEach(factor => {
            toggleFactor(factor);
        });
    }
}

// ==========================================
// MOOD SELECTION FUNCTIONALITY
// ==========================================

/**
 * Select mood option
 * @param {string} mood - Selected mood value (1-5)
 */
function selectMood(mood) {
    MoodTrackerState.currentMood = mood;
    
    // Update UI
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.mood === mood) {
            option.classList.add('selected');
        }
    });
    
    // Show next sections
    showSection('emotionTagsSection');
    showSection('journalSection');
    showSection('factorsSection');
    showSection('entryActions');
    
    console.log('Mood selected:', mood, MoodData.moodLabels[mood]);
}

/**
 * Toggle emotion selection
 * @param {string} emotion - Emotion to toggle
 */
function toggleEmotion(emotion) {
    const index = MoodTrackerState.selectedEmotions.indexOf(emotion);
    const emotionTag = document.querySelector(`[data-emotion="${emotion}"]`);
    
    if (index === -1) {
        // Add emotion
        MoodTrackerState.selectedEmotions.push(emotion);
        if (emotionTag) emotionTag.classList.add('selected');
    } else {
        // Remove emotion
        MoodTrackerState.selectedEmotions.splice(index, 1);
        if (emotionTag) emotionTag.classList.remove('selected');
    }
    
    console.log('Selected emotions:', MoodTrackerState.selectedEmotions);
}

/**
 * Toggle factor selection
 * @param {string} factor - Factor to toggle
 */
function toggleFactor(factor) {
    const index = MoodTrackerState.selectedFactors.indexOf(factor);
    const factorTag = document.querySelector(`[data-factor="${factor}"]`);
    
    if (index === -1) {
        // Add factor
        MoodTrackerState.selectedFactors.push(factor);
        if (factorTag) factorTag.classList.add('selected');
    } else {
        // Remove factor
        MoodTrackerState.selectedFactors.splice(index, 1);
        if (factorTag) factorTag.classList.remove('selected');
    }
    
    console.log('Selected factors:', MoodTrackerState.selectedFactors);
}

/**
 * Use journal prompt
 * @param {string} prompt - Journal prompt text
 */
function usePrompt(prompt) {
    const journalTextarea = document.getElementById('journalEntry');
    if (journalTextarea) {
        const currentText = journalTextarea.value.trim();
        const newText = currentText ? `${currentText}\n\n${prompt}\n` : `${prompt}\n`;
        journalTextarea.value = newText;
        journalTextarea.focus();
        
        // Trigger resize
        journalTextarea.style.height = 'auto';
        journalTextarea.style.height = Math.min(journalTextarea.scrollHeight, 200) + 'px';
    }
}

/**
 * Show section by ID
 * @param {string} sectionId - Section ID to show
 */
function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        section.classList.add('animate-slideInUp');
    }
}

// ==========================================
// MOOD ENTRY SAVING
// ==========================================

/**
 * Save mood entry
 */
function saveMoodEntry() {
    if (!MoodTrackerState.currentMood) {
        showNotification('Please select a mood first.', 'warning');
        return;
    }
    
    const journalTextarea = document.getElementById('journalEntry');
    const journalText = journalTextarea ? journalTextarea.value.trim() : '';
    
    // Create mood entry object
    const moodEntry = {
        id: MoodTrackerState.todayEntry ? MoodTrackerState.todayEntry.id : generateEntryId(),
        date: new Date().toISOString(),
        mood: parseInt(MoodTrackerState.currentMood),
        emotions: [...MoodTrackerState.selectedEmotions],
        factors: [...MoodTrackerState.selectedFactors],
        journal: journalText,
        timestamp: Date.now()
    };
    
    // Save or update entry
    if (MoodTrackerState.todayEntry) {
        updateMoodEntry(moodEntry);
    } else {
        addMoodEntry(moodEntry);
    }
    
    // Update UI
    showNotification('Mood entry saved successfully!', 'success');
    
    // Refresh analytics
    initializeMoodAnalytics();
    
    // Update recent entries
    displayRecentEntries();
    
    console.log('Mood entry saved:', moodEntry);
}

/**
 * Add new mood entry
 * @param {Object} entry - Mood entry object
 */
function addMoodEntry(entry) {
    MoodTrackerState.moodHistory.unshift(entry);
    
    // Keep only last 365 entries (1 year)
    if (MoodTrackerState.moodHistory.length > 365) {
        MoodTrackerState.moodHistory = MoodTrackerState.moodHistory.slice(0, 365);
    }
    
    // Save to localStorage
    localStorage.setItem('moodHistory', JSON.stringify(MoodTrackerState.moodHistory));
    
    MoodTrackerState.todayEntry = entry;
}

/**
 * Update existing mood entry
 * @param {Object} entry - Updated mood entry object
 */
function updateMoodEntry(entry) {
    const index = MoodTrackerState.moodHistory.findIndex(e => e.id === entry.id);
    if (index !== -1) {
        MoodTrackerState.moodHistory[index] = entry;
        localStorage.setItem('moodHistory', JSON.stringify(MoodTrackerState.moodHistory));
        MoodTrackerState.todayEntry = entry;
    }
}

/**
 * Generate unique entry ID
 * @returns {string} - Unique ID
 */
function generateEntryId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==========================================
// MOOD ANALYTICS
// ==========================================

/**
 * Initialize mood analytics and charts
 */
function initializeMoodAnalytics() {
    // Initialize mood trend chart
    initializeMoodTrendChart();
    
    // Update emotion patterns
    updateEmotionPatterns();
    
    // Generate AI insights
    generateAIInsights();
}

/**
 * Initialize mood trend chart
 */
function initializeMoodTrendChart() {
    const canvas = document.getElementById('moodTrendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const chartData = getMoodChartData('week');
    
    drawMoodTrendChart(ctx, chartData);
}

/**
 * Update mood chart based on time filter
 * @param {string} timeframe - Time filter (week, month, quarter)
 */
function updateMoodChart(timeframe) {
    const canvas = document.getElementById('moodTrendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const chartData = getMoodChartData(timeframe);
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw new chart
    drawMoodTrendChart(ctx, chartData);
    
    console.log('Mood chart updated for timeframe:', timeframe);
}

/**
 * Get mood chart data for specified timeframe
 * @param {string} timeframe - Time period
 * @returns {Array} - Chart data points
 */
function getMoodChartData(timeframe) {
    const now = new Date();
    let startDate;
    let days;
    
    switch (timeframe) {
        case 'week':
            startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            days = 7;
            break;
        case 'month':
            startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            days = 30;
            break;
        case 'quarter':
            startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
            days = 90;
            break;
        default:
            startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            days = 7;
    }
    
    const chartData = [];
    
    for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
        const dateString = date.toDateString();
        
        // Find mood entry for this date
        const entry = MoodTrackerState.moodHistory.find(e => 
            new Date(e.date).toDateString() === dateString
        );
        
        chartData.push(entry ? entry.mood : null);
    }
    
    return chartData;
}

/**
 * Draw mood trend chart on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} data - Chart data points
 */
function drawMoodTrendChart(ctx, data) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 30;
    
    // Chart dimensions
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Filter out null values for line drawing
    const validData = data.map((value, index) => ({ value, index }))
                         .filter(item => item.value !== null);
    
    if (validData.length === 0) {
        // Draw "No data" message
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('No mood data available', width / 2, height / 2);
        return;
    }
    
    // Draw grid lines
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines (mood levels)
    for (let i = 1; i <= 5; i++) {
        const y = padding + chartHeight - ((i - 1) * chartHeight) / 4;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        
        // Mood labels
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(MoodData.moodLabels[i.toString()], padding - 5, y + 4);
    }
    
    // Calculate points for valid data
    const points = validData.map(item => ({
        x: padding + (item.index * chartWidth) / (data.length - 1),
        y: padding + chartHeight - ((item.value - 1) * chartHeight) / 4
    }));
    
    // Draw connecting lines
    if (points.length > 1) {
        ctx.strokeStyle = '#8B5CF6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
    }
    
    // Draw data points
    ctx.fillStyle = '#8B5CF6';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // White center
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#8B5CF6';
    });
}

/**
 * Update emotion patterns display
 */
function updateEmotionPatterns() {
    calculateEmotionPatterns();
    
    const patternsContainer = document.querySelector('.patterns-list');
    if (!patternsContainer) return;
    
    // Clear existing patterns
    patternsContainer.innerHTML = '';
    
    // Get top emotions
    const sortedEmotions = Object.entries(MoodTrackerState.emotionPatterns)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 4);
    
    sortedEmotions.forEach(([emotion, count]) => {
        const total = MoodTrackerState.moodHistory.length;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        const emoji = getEmotionEmoji(emotion);
        
        const patternItem = document.createElement('div');
        patternItem.className = 'pattern-item';
        patternItem.innerHTML = `
            <div class="pattern-emotion">${emoji} ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</div>
            <div class="pattern-frequency">
                <div class="frequency-bar">
                    <div class="frequency-fill" style="width: ${percentage}%"></div>
                </div>
                <span>${percentage}%</span>
            </div>
        `;
        
        patternsContainer.appendChild(patternItem);
    });
}

/**
 * Calculate emotion patterns from mood history
 */
function calculateEmotionPatterns() {
    const patterns = {};
    
    MoodTrackerState.moodHistory.forEach(entry => {
        if (entry.emotions) {
            entry.emotions.forEach(emotion => {
                patterns[emotion] = (patterns[emotion] || 0) + 1;
            });
        }
    });
    
    MoodTrackerState.emotionPatterns = patterns;
}

/**
 * Get emoji for emotion
 * @param {string} emotion - Emotion name
 * @returns {string} - Emoji representation
 */
function getEmotionEmoji(emotion) {
    const emotionEmojis = {
        happy: '😊',
        sad: '😢',
        anxious: '😰',
        angry: '😠',
        excited: '🤩',
        peaceful: '😌',
        stressed: '😤',
        grateful: '🙏',
        frustrated: '😤',
        lonely: '😔',
        overwhelmed: '😵',
        confident: '😎'
    };
    
    return emotionEmojis[emotion] || '😐';
}

// ==========================================
// AI INSIGHTS GENERATION
// ==========================================

/**
 * Generate AI insights based on mood data
 */
function generateAIInsights() {
    const insights = [];
    
    // Analyze mood trends
    const recentMoods = MoodTrackerState.moodHistory.slice(0, 7).map(e => e.mood);
    if (recentMoods.length >= 3) {
        const trend = analyzeMoodTrend(recentMoods);
        insights.push(generateTrendInsight(trend));
    }
    
    // Analyze emotion patterns
    const topEmotion = getTopEmotion();
    if (topEmotion) {
        insights.push(generateEmotionInsight(topEmotion));
    }
    
    // Analyze factors
    const triggerFactors = analyzeTriggerFactors();
    if (triggerFactors.length > 0) {
        insights.push(generateTriggerInsight(triggerFactors[0]));
    }
    
    // Update insights display
    displayAIInsights(insights);
    
    MoodTrackerState.insights = insights;
}

/**
 * Analyze mood trend
 * @param {Array} moods - Recent mood values
 * @returns {string} - Trend direction
 */
function analyzeMoodTrend(moods) {
    if (moods.length < 2) return 'stable';
    
    const recent = moods.slice(0, 3);
    const older = moods.slice(3, 6);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
}

/**
 * Get most frequent emotion
 * @returns {string|null} - Top emotion
 */
function getTopEmotion() {
    const patterns = MoodTrackerState.emotionPatterns;
    const emotions = Object.keys(patterns);
    
    if (emotions.length === 0) return null;
    
    return emotions.reduce((a, b) => patterns[a] > patterns[b] ? a : b);
}

/**
 * Analyze trigger factors
 * @returns {Array} - Trigger factors sorted by impact
 */
function analyzeTriggerFactors() {
    const factorImpact = {};
    
    MoodTrackerState.moodHistory.forEach(entry => {
        if (entry.factors && entry.mood <= 2) { // Low mood entries
            entry.factors.forEach(factor => {
                factorImpact[factor] = (factorImpact[factor] || 0) + 1;
            });
        }
    });
    
    return Object.entries(factorImpact)
        .sort(([,a], [,b]) => b - a)
        .map(([factor]) => factor);
}

/**
 * Generate trend insight
 * @param {string} trend - Trend direction
 * @returns {Object} - Insight object
 */
function generateTrendInsight(trend) {
    const insights = {
        improving: {
            icon: '📈',
            title: 'Positive Trend',
            description: 'Your mood has been trending upward over the past week. Keep up the great work!'
        },
        declining: {
            icon: '📉',
            title: 'Mood Decline',
            description: 'Your mood has been lower recently. Consider reaching out for support or trying some coping strategies.'
        },
        stable: {
            icon: '📊',
            title: 'Stable Mood',
            description: 'Your mood has been relatively stable. Consistency is a positive sign of emotional regulation.'
        }
    };
    
    return insights[trend] || insights.stable;
}

/**
 * Generate emotion insight
 * @param {string} emotion - Top emotion
 * @returns {Object} - Insight object
 */
function generateEmotionInsight(emotion) {
    const positiveEmotions = ['happy', 'excited', 'grateful', 'peaceful', 'confident'];
    const negativeEmotions = ['anxious', 'sad', 'angry', 'frustrated', 'lonely', 'overwhelmed'];
    
    if (positiveEmotions.includes(emotion)) {
        return {
            icon: '💡',
            title: 'Positive Pattern',
            description: `You frequently experience ${emotion} feelings. This suggests good emotional wellbeing and effective coping strategies.`
        };
    } else if (negativeEmotions.includes(emotion)) {
        return {
            icon: '⚠️',
            title: 'Attention Needed',
            description: `${emotion.charAt(0).toUpperCase() + emotion.slice(1)} appears frequently in your entries. Consider discussing coping strategies with your therapist.`
        };
    } else {
        return {
            icon: '🔍',
            title: 'Pattern Detected',
            description: `${emotion.charAt(0).toUpperCase() + emotion.slice(1)} is a common emotion in your entries. Understanding this pattern can help improve your emotional awareness.`
        };
    }
}

/**
 * Generate trigger insight
 * @param {string} trigger - Top trigger factor
 * @returns {Object} - Insight object
 */
function generateTriggerInsight(trigger) {
    return {
        icon: '🎯',
        title: 'Trigger Identified',
        description: `${trigger.charAt(0).toUpperCase() + trigger.slice(1)} appears to be a consistent trigger for lower moods. Consider developing specific strategies for managing this area.`
    };
}

/**
 * Display AI insights
 * @param {Array} insights - Array of insight objects
 */
function displayAIInsights(insights) {
    const insightsContainer = document.querySelector('.insights-list');
    if (!insightsContainer) return;
    
    // Clear existing insights
    insightsContainer.innerHTML = '';
    
    insights.forEach(insight => {
        const insightItem = document.createElement('div');
        insightItem.className = 'insight-item';
        insightItem.innerHTML = `
            <div class="insight-icon">${insight.icon}</div>
            <div class="insight-content">
                <h4>${insight.title}</h4>
                <p>${insight.description}</p>
            </div>
        `;
        
        insightsContainer.appendChild(insightItem);
    });
}

// ==========================================
// RECENT ENTRIES DISPLAY
// ==========================================

/**
 * Display recent mood entries
 */
function displayRecentEntries() {
    const entriesContainer = document.querySelector('.entries-list');
    if (!entriesContainer) return;
    
    // Clear existing entries
    entriesContainer.innerHTML = '';
    
    // Get recent entries (excluding today if it exists)
    const today = new Date().toDateString();
    const recentEntries = MoodTrackerState.moodHistory
        .filter(entry => new Date(entry.date).toDateString() !== today)
        .slice(0, 5);
    
    recentEntries.forEach(entry => {
        const entryDate = new Date(entry.date);
        const dayLabel = getDayLabel(entryDate);
        const dateLabel = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const entryItem = document.createElement('div');
        entryItem.className = 'entry-item';
        entryItem.innerHTML = `
            <div class="entry-date">
                <span class="day">${dayLabel}</span>
                <span class="date">${dateLabel}</span>
            </div>
            <div class="entry-mood">
                <span class="mood-emoji">${MoodData.moodEmojis[entry.mood.toString()]}</span>
                <span class="mood-label">${MoodData.moodLabels[entry.mood.toString()]}</span>
            </div>
            <div class="entry-emotions">
                ${entry.emotions ? entry.emotions.slice(0, 2).map(emotion => 
                    `<span class="emotion-tag small">${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</span>`
                ).join('') : ''}
            </div>
            <div class="entry-preview">
                <p>${entry.journal ? entry.journal.substring(0, 100) + (entry.journal.length > 100 ? '...' : '') : 'No journal entry'}</p>
            </div>
            <button class="view-entry-btn" onclick="viewEntry('${entry.id}')">View</button>
        `;
        
        entriesContainer.appendChild(entryItem);
    });
}

/**
 * Get day label for date
 * @param {Date} date - Date object
 * @returns {string} - Day label
 */
function getDayLabel(date) {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        const daysAgo = Math.floor((today - date) / (24 * 60 * 60 * 1000));
        if (daysAgo < 7) {
            return `${daysAgo} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        }
    }
}

/**
 * View specific entry
 * @param {string} entryId - Entry ID
 */
function viewEntry(entryId) {
    const entry = MoodTrackerState.moodHistory.find(e => e.id === entryId);
    if (!entry) return;
    
    // Populate modal with entry details
    const modal = document.getElementById('entryDetailModal');
    const content = document.getElementById('entryDetailContent');
    
    if (modal && content) {
        const entryDate = new Date(entry.date);
        
        content.innerHTML = `
            <div class="entry-detail-header">
                <h4>${entryDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</h4>
            </div>
            <div class="entry-detail-mood">
                <div class="mood-display">
                    <span class="mood-emoji large">${MoodData.moodEmojis[entry.mood.toString()]}</span>
                    <span class="mood-label large">${MoodData.moodLabels[entry.mood.toString()]}</span>
                </div>
            </div>
            ${entry.emotions && entry.emotions.length > 0 ? `
                <div class="entry-detail-emotions">
                    <h5>Emotions</h5>
                    <div class="emotions-list">
                        ${entry.emotions.map(emotion => 
                            `<span class="emotion-tag">${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</span>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
            ${entry.journal ? `
                <div class="entry-detail-journal">
                    <h5>Journal Entry</h5>
                    <div class="journal-text">${entry.journal}</div>
                </div>
            ` : ''}
            ${entry.factors && entry.factors.length > 0 ? `
                <div class="entry-detail-factors">
                    <h5>Contributing Factors</h5>
                    <div class="factors-list">
                        ${entry.factors.map(factor => 
                            `<span class="factor-tag">${factor.charAt(0).toUpperCase() + factor.slice(1)}</span>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
        `;
        
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

/**
 * Close entry detail modal
 */
function closeEntryDetail() {
    const modal = document.getElementById('entryDetailModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

/**
 * Edit entry (placeholder function)
 */
function editEntry() {
    showNotification('Edit functionality coming soon!', 'info');
    closeEntryDetail();
}

/**
 * View all entries (placeholder function)
 */
function viewAllEntries() {
    showNotification('Full history view coming soon!', 'info');
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Calculate mood statistics
 * @returns {Object} - Mood statistics
 */
function calculateMoodStats() {
    const history = MoodTrackerState.moodHistory;
    if (history.length === 0) return null;
    
    const moods = history.map(entry => entry.mood);
    const average = moods.reduce((a, b) => a + b, 0) / moods.length;
    
    const moodCounts = moods.reduce((acc, mood) => {
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
    }, {});
    
    const mostCommon = Object.keys(moodCounts).reduce((a, b) => 
        moodCounts[a] > moodCounts[b] ? a : b
    );
    
    return {
        totalEntries: history.length,
        averageMood: average,
        mostCommonMood: mostCommon,
        moodDistribution: moodCounts
    };
}

// ==========================================
// DEVELOPMENT HELPERS
// ==========================================

// Make mood tracker state available globally in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.MoodTrackerState = MoodTrackerState;
    window.calculateMoodStats = calculateMoodStats;
    console.log('Development mode: MoodTrackerState available globally');
}