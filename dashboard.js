/**
 * DASHBOARD JAVASCRIPT
 * 
 * This file contains all the interactive functionality for the dashboard page.
 * It includes mood tracking, chart rendering, breathing exercises, and AI interactions.
 */

// ==========================================
// DASHBOARD STATE MANAGEMENT
// ==========================================

const DashboardState = {
    currentMood: null,
    selectedEmotions: [],
    selectedFactors: [],
    breathingTimer: null,
    breathingDuration: 0,
    isBreathing: false,
    moodChartData: {
        week: [3, 4, 3, 5, 4, 4, 4],
        month: [3.2, 3.8, 4.1, 3.9, 4.2, 4.0, 3.8, 4.3, 4.1, 3.9, 4.2, 4.4, 4.0, 3.8, 4.1, 4.3, 4.2, 3.9, 4.0, 4.1, 3.8, 4.2, 4.0, 3.9, 4.1, 4.3, 4.2, 4.0, 3.8, 4.1],
        quarter: [3.5, 3.8, 4.0, 3.9, 4.1, 4.2, 3.8, 4.0, 4.3, 4.1, 3.9, 4.2]
    }
};

// ==========================================
// DASHBOARD INITIALIZATION
// ==========================================

/**
 * Initialize dashboard when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

/**
 * Main dashboard initialization function
 */
function initializeDashboard() {
    console.log('Initializing Dashboard...');
    
    // Set current date
    updateCurrentDate();
    
    // Initialize mood chart
    initializeMoodChart();
    
    // Setup event listeners
    setupDashboardEventListeners();
    
    console.log('Dashboard initialization complete');
}

/**
 * Update current date display
 */
function updateCurrentDate() {
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        const today = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        currentDateElement.textContent = today.toLocaleDateString('en-US', options);
    }
}

/**
 * Setup dashboard event listeners
 */
function setupDashboardEventListeners() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeAllModals();
        }
    });
    
    // Handle escape key for modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// ==========================================
// MOOD TRACKING FUNCTIONALITY
// ==========================================

/**
 * Start quick mood check modal
 */
function startMoodCheck() {
    const modal = document.getElementById('moodCheckModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        
        // Reset previous selections
        DashboardState.currentMood = null;
        const moodOptions = document.querySelectorAll('.mood-option');
        moodOptions.forEach(option => option.classList.remove('selected'));
        
        console.log('Mood check modal opened');
    }
}

/**
 * Select mood option
 * @param {string} mood - Selected mood value
 */
function selectMood(mood) {
    DashboardState.currentMood = mood;
    
    // Update UI
    const moodOptions = document.querySelectorAll('.mood-option');
    moodOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.mood === mood) {
            option.classList.add('selected');
        }
    });
    
    console.log('Mood selected:', mood);
}

/**
 * Save mood check entry
 */
function saveMoodCheck() {
    if (!DashboardState.currentMood) {
        showNotification('Please select a mood first.', 'warning');
        return;
    }
    
    const moodNote = document.getElementById('moodNote').value.trim();
    
    // Create mood entry object
    const moodEntry = {
        mood: DashboardState.currentMood,
        note: moodNote,
        timestamp: new Date().toISOString(),
        date: new Date().toDateString()
    };
    
    // Save to localStorage (in real app, this would go to server)
    saveMoodEntryToStorage(moodEntry);
    
    // Update dashboard stats
    updateDashboardStats();
    
    // Close modal and show success
    closeMoodCheck();
    showNotification('Mood check saved successfully!', 'success');
    
    console.log('Mood entry saved:', moodEntry);
}

/**
 * Close mood check modal
 */
function closeMoodCheck() {
    const modal = document.getElementById('moodCheckModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        
        // Reset form
        document.getElementById('moodNote').value = '';
        DashboardState.currentMood = null;
    }
}

/**
 * Save mood entry to localStorage
 * @param {Object} entry - Mood entry object
 */
function saveMoodEntryToStorage(entry) {
    let moodEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    moodEntries.unshift(entry); // Add to beginning of array
    
    // Keep only last 100 entries
    if (moodEntries.length > 100) {
        moodEntries = moodEntries.slice(0, 100);
    }
    
    localStorage.setItem('moodEntries', JSON.stringify(moodEntries));
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats() {
    const moodEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    
    // Update streak
    const streak = calculateMoodStreak(moodEntries);
    const streakElement = document.querySelector('.stat-value');
    if (streakElement && streak > 0) {
        streakElement.textContent = `${streak} days`;
    }
    
    // Update current mood display
    if (moodEntries.length > 0) {
        const latestEntry = moodEntries[0];
        const moodElement = document.querySelector('.mood-icon').parentElement.querySelector('.stat-value');
        if (moodElement) {
            moodElement.textContent = getMoodLabel(latestEntry.mood);
        }
    }
}

/**
 * Calculate mood tracking streak
 * @param {Array} entries - Array of mood entries
 * @returns {number} - Streak count in days
 */
function calculateMoodStreak(entries) {
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    // Check if there's an entry for today or yesterday
    const hasRecentEntry = entries.some(entry => 
        entry.date === today || entry.date === yesterday
    );
    
    if (!hasRecentEntry) return 0;
    
    // Count consecutive days
    const uniqueDates = [...new Set(entries.map(entry => entry.date))];
    uniqueDates.sort((a, b) => new Date(b) - new Date(a));
    
    let currentDate = new Date();
    for (const dateStr of uniqueDates) {
        const entryDate = new Date(dateStr);
        const daysDiff = Math.floor((currentDate - entryDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= streak + 1) {
            streak++;
            currentDate = entryDate;
        } else {
            break;
        }
    }
    
    return streak;
}

/**
 * Get mood label from mood value
 * @param {string} moodValue - Mood value (1-5)
 * @returns {string} - Mood label
 */
function getMoodLabel(moodValue) {
    const moodLabels = {
        '5': 'Excellent',
        '4': 'Good',
        '3': 'Okay',
        '2': 'Low',
        '1': 'Struggling'
    };
    return moodLabels[moodValue] || 'Unknown';
}

// ==========================================
// MOOD CHART FUNCTIONALITY
// ==========================================

/**
 * Initialize mood trend chart
 */
function initializeMoodChart() {
    const canvas = document.getElementById('moodChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    drawMoodChart(ctx, DashboardState.moodChartData.week, 'week');
}

/**
 * Update mood chart based on time filter
 * @param {string} timeframe - Time filter (week, month, quarter)
 */
function updateMoodChart(timeframe) {
    const canvas = document.getElementById('moodChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = DashboardState.moodChartData[timeframe] || DashboardState.moodChartData.week;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw new chart
    drawMoodChart(ctx, data, timeframe);
    
    console.log('Mood chart updated for timeframe:', timeframe);
}

/**
 * Draw mood chart on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} data - Chart data points
 * @param {string} timeframe - Time period
 */
function drawMoodChart(ctx, data, timeframe) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;
    
    // Chart dimensions
    const chartWidth = width - (padding * 2);
    const chartHeight = height - (padding * 2);
    
    // Data processing
    const maxValue = 5;
    const minValue = 1;
    const dataRange = maxValue - minValue;
    
    // Calculate points
    const points = data.map((value, index) => ({
        x: padding + (index * chartWidth) / (data.length - 1),
        y: padding + chartHeight - ((value - minValue) / dataRange) * chartHeight
    }));
    
    // Draw grid lines
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
        const y = padding + (i * chartHeight) / 4;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw chart line
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
    
    // Draw data points
    ctx.fillStyle = '#8B5CF6';
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    points.forEach(point => {
        ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();
    ctx.fill();
}

// ==========================================
// BREATHING EXERCISE FUNCTIONALITY
// ==========================================

/**
 * Start breathing exercise modal
 */
function startBreathingExercise() {
    const modal = document.getElementById('breathingModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
        
        // Reset breathing state
        DashboardState.isBreathing = false;
        DashboardState.breathingDuration = 0;
        
        // Reset UI
        const circle = document.getElementById('breathingCircle');
        const text = document.getElementById('breathingText');
        const startBtn = document.getElementById('startBreathingBtn');
        const stopBtn = document.getElementById('stopBreathingBtn');
        
        if (circle) circle.className = 'breathing-circle';
        if (text) text.textContent = 'Get Ready';
        if (startBtn) startBtn.style.display = 'block';
        if (stopBtn) stopBtn.style.display = 'none';
        
        updateBreathingTimer();
        
        console.log('Breathing exercise modal opened');
    }
}

/**
 * Start breathing animation
 */
function startBreathing() {
    DashboardState.isBreathing = true;
    DashboardState.breathingDuration = 0;
    
    const startBtn = document.getElementById('startBreathingBtn');
    const stopBtn = document.getElementById('stopBreathingBtn');
    
    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'block';
    
    // Start breathing cycle
    breathingCycle();
    
    // Start timer
    DashboardState.breathingTimer = setInterval(() => {
        DashboardState.breathingDuration++;
        updateBreathingTimer();
    }, 1000);
    
    console.log('Breathing exercise started');
}

/**
 * Stop breathing exercise
 */
function stopBreathing() {
    DashboardState.isBreathing = false;
    
    if (DashboardState.breathingTimer) {
        clearInterval(DashboardState.breathingTimer);
        DashboardState.breathingTimer = null;
    }
    
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const startBtn = document.getElementById('startBreathingBtn');
    const stopBtn = document.getElementById('stopBreathingBtn');
    
    if (circle) circle.className = 'breathing-circle';
    if (text) text.textContent = 'Well Done!';
    if (startBtn) startBtn.style.display = 'block';
    if (stopBtn) stopBtn.style.display = 'none';
    
    console.log('Breathing exercise stopped');
}

/**
 * Execute breathing cycle animation
 */
function breathingCycle() {
    if (!DashboardState.isBreathing) return;
    
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    
    // Inhale phase (4 seconds)
    if (circle && text) {
        circle.classList.add('inhale');
        text.textContent = 'Breathe In';
    }
    
    setTimeout(() => {
        if (!DashboardState.isBreathing) return;
        
        // Hold phase (4 seconds)
        if (text) text.textContent = 'Hold';
        
        setTimeout(() => {
            if (!DashboardState.isBreathing) return;
            
            // Exhale phase (4 seconds)
            if (circle && text) {
                circle.classList.remove('inhale');
                circle.classList.add('exhale');
                text.textContent = 'Breathe Out';
            }
            
            setTimeout(() => {
                if (!DashboardState.isBreathing) return;
                
                // Reset and repeat
                if (circle) {
                    circle.classList.remove('exhale');
                }
                
                setTimeout(() => {
                    breathingCycle(); // Repeat cycle
                }, 1000);
            }, 4000);
        }, 4000);
    }, 4000);
}

/**
 * Update breathing timer display
 */
function updateBreathingTimer() {
    const timerElement = document.getElementById('breathingTimer');
    if (timerElement) {
        const minutes = Math.floor(DashboardState.breathingDuration / 60);
        const seconds = DashboardState.breathingDuration % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

/**
 * Close breathing exercise modal
 */
function closeBreathingExercise() {
    stopBreathing();
    
    const modal = document.getElementById('breathingModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// ==========================================
// USER MENU FUNCTIONALITY
// ==========================================

/**
 * Toggle user dropdown menu
 */
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Close user menu when clicking outside
document.addEventListener('click', function(e) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown && !userMenu.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Close all open modals
 */
function closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay.active');
    modals.forEach(modal => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
    
    // Stop breathing exercise if active
    if (DashboardState.isBreathing) {
        stopBreathing();
    }
}

/**
 * Format time duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted time string
 */
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Get current date formatted for display
 * @returns {string} - Formatted date string
 */
function getCurrentDateString() {
    const today = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
}

// ==========================================
// DEVELOPMENT HELPERS
// ==========================================

// Make dashboard state available globally in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.DashboardState = DashboardState;
    console.log('Development mode: DashboardState available globally');
}