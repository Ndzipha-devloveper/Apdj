/**
 * ROADMAP JAVASCRIPT
 * 
 * This file contains all the interactive functionality for the mental health roadmap page.
 * It includes progress tracking, milestone management, achievement system, and goal setting.
 */

// ==========================================
// ROADMAP STATE MANAGEMENT
// ==========================================

const RoadmapState = {
    currentGoals: [],
    completedMilestones: [],
    achievements: [],
    overallProgress: 0,
    milestoneHistory: [],
    goalTemplates: {},
    userPreferences: {}
};

// Goal templates and milestone definitions
const GoalTemplates = {
    'anxiety-management': {
        id: 'anxiety-management',
        title: 'Anxiety Management',
        description: 'Learning coping strategies and techniques to manage anxiety in daily situations',
        icon: 'check-circle',
        estimatedDuration: '6-8 weeks',
        milestones: [
            {
                id: 'identify-triggers',
                title: 'Identify anxiety triggers',
                description: 'Learn to recognize personal anxiety triggers and patterns',
                order: 1,
                estimatedDays: 7
            },
            {
                id: 'breathing-techniques',
                title: 'Learn breathing techniques',
                description: 'Master various breathing exercises for anxiety management',
                order: 2,
                estimatedDays: 10
            },
            {
                id: 'mindfulness-practice',
                title: 'Practice mindfulness',
                description: 'Develop regular mindfulness and grounding practices',
                order: 3,
                estimatedDays: 14
            },
            {
                id: 'apply-strategies',
                title: 'Apply coping strategies',
                description: 'Consistently use learned techniques in real-world situations',
                order: 4,
                estimatedDays: 21
            },
            {
                id: 'maintain-progress',
                title: 'Maintain progress',
                description: 'Sustain anxiety management skills long-term',
                order: 5,
                estimatedDays: 30
            }
        ]
    },
    'stress-reduction': {
        id: 'stress-reduction',
        title: 'Stress Reduction',
        description: 'Developing healthy habits and boundaries to reduce overall stress levels',
        icon: 'flame',
        estimatedDuration: '8-10 weeks',
        milestones: [
            {
                id: 'stress-assessment',
                title: 'Stress assessment',
                description: 'Complete comprehensive stress level evaluation',
                order: 1,
                estimatedDays: 3
            },
            {
                id: 'identify-sources',
                title: 'Identify stress sources',
                description: 'Map out primary sources of stress in daily life',
                order: 2,
                estimatedDays: 7
            },
            {
                id: 'time-management',
                title: 'Time management skills',
                description: 'Learn effective time management and prioritization techniques',
                order: 3,
                estimatedDays: 14
            },
            {
                id: 'boundary-setting',
                title: 'Boundary setting',
                description: 'Develop healthy boundaries in personal and professional relationships',
                order: 4,
                estimatedDays: 21
            },
            {
                id: 'relaxation-techniques',
                title: 'Relaxation techniques',
                description: 'Master various relaxation and stress-relief methods',
                order: 5,
                estimatedDays: 28
            }
        ]
    },
    'self-esteem': {
        id: 'self-esteem',
        title: 'Self-Esteem Building',
        description: 'Building confidence and developing a positive self-image through various therapeutic approaches',
        icon: 'heart',
        estimatedDuration: '10-12 weeks',
        milestones: [
            {
                id: 'self-awareness',
                title: 'Self-awareness exercises',
                description: 'Develop deeper understanding of self-perception and beliefs',
                order: 1,
                estimatedDays: 14
            },
            {
                id: 'positive-affirmations',
                title: 'Positive affirmations',
                description: 'Create and practice personalized positive affirmations',
                order: 2,
                estimatedDays: 21
            },
            {
                id: 'achievement-recognition',
                title: 'Achievement recognition',
                description: 'Learn to acknowledge and celebrate personal accomplishments',
                order: 3,
                estimatedDays: 28
            },
            {
                id: 'confidence-building',
                title: 'Confidence building',
                description: 'Engage in activities that build self-confidence and self-worth',
                order: 4,
                estimatedDays: 35
            },
            {
                id: 'self-compassion',
                title: 'Self-compassion practice',
                description: 'Develop a kind and understanding relationship with yourself',
                order: 5,
                estimatedDays: 42
            }
        ]
    }
};

// Achievement definitions
const AchievementTemplates = {
    'first-steps': {
        id: 'first-steps',
        title: 'First Steps',
        description: 'Completed initial assessment',
        icon: 'star',
        condition: 'complete-assessment',
        points: 100
    },
    'consistent-tracker': {
        id: 'consistent-tracker',
        title: 'Consistent Tracker',
        description: '7-day mood tracking streak',
        icon: 'flame',
        condition: 'mood-streak-7',
        points: 150
    },
    'breathing-master': {
        id: 'breathing-master',
        title: 'Breathing Master',
        description: 'Completed 10 breathing exercises',
        icon: 'wind',
        condition: 'breathing-exercises-10',
        points: 200
    },
    'anxiety-warrior': {
        id: 'anxiety-warrior',
        title: 'Anxiety Warrior',
        description: 'Complete anxiety management goal',
        icon: 'shield',
        condition: 'complete-goal-anxiety-management',
        points: 500
    },
    'self-love-champion': {
        id: 'self-love-champion',
        title: 'Self-Love Champion',
        description: 'Complete self-esteem building program',
        icon: 'heart',
        condition: 'complete-goal-self-esteem',
        points: 500
    },
    'journey-complete': {
        id: 'journey-complete',
        title: 'Journey Complete',
        description: 'Complete all therapy goals',
        icon: 'trophy',
        condition: 'complete-all-goals',
        points: 1000
    }
};

// ==========================================
// ROADMAP INITIALIZATION
// ==========================================

/**
 * Initialize roadmap when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeRoadmap();
});

/**
 * Main roadmap initialization function
 */
function initializeRoadmap() {
    console.log('Initializing Mental Health Roadmap...');
    
    // Load user progress data
    loadProgressData();
    
    // Initialize current goals
    initializeCurrentGoals();
    
    // Update progress displays
    updateProgressDisplays();
    
    // Load timeline
    loadJourneyTimeline();
    
    // Update achievements
    updateAchievements();
    
    console.log('Roadmap initialization complete');
}

/**
 * Load progress data from storage
 */
function loadProgressData() {
    const savedProgress = JSON.parse(localStorage.getItem('roadmapProgress') || '{}');
    
    RoadmapState.currentGoals = savedProgress.currentGoals || [
        {
            ...GoalTemplates['anxiety-management'],
            status: 'in-progress',
            progress: 75,
            startDate: '2024-11-15',
            currentMilestone: 'apply-strategies'
        },
        {
            ...GoalTemplates['stress-reduction'],
            status: 'upcoming',
            progress: 25,
            startDate: null,
            currentMilestone: 'identify-sources'
        },
        {
            ...GoalTemplates['self-esteem'],
            status: 'planned',
            progress: 0,
            startDate: null,
            currentMilestone: null
        }
    ];
    
    RoadmapState.completedMilestones = savedProgress.completedMilestones || [
        'identify-triggers',
        'breathing-techniques',
        'mindfulness-practice',
        'stress-assessment'
    ];
    
    RoadmapState.achievements = savedProgress.achievements || [
        { ...AchievementTemplates['first-steps'], earnedDate: '2024-11-15' },
        { ...AchievementTemplates['consistent-tracker'], earnedDate: '2024-12-10' },
        { ...AchievementTemplates['breathing-master'], earnedDate: '2024-12-12' }
    ];
    
    RoadmapState.overallProgress = savedProgress.overallProgress || 68;
}

/**
 * Initialize current goals display
 */
function initializeCurrentGoals() {
    const goalsContainer = document.querySelector('.goals-grid');
    if (!goalsContainer) return;
    
    // Clear existing goals
    goalsContainer.innerHTML = '';
    
    RoadmapState.currentGoals.forEach(goal => {
        const goalCard = createGoalCard(goal);
        goalsContainer.appendChild(goalCard);
    });
}

/**
 * Create goal card element
 * @param {Object} goal - Goal object
 * @returns {HTMLElement} - Goal card element
 */
function createGoalCard(goal) {
    const card = document.createElement('div');
    card.className = `goal-card ${goal.status === 'in-progress' ? 'active' : ''}`;
    
    const statusClass = goal.status === 'in-progress' ? 'in-progress' : 
                       goal.status === 'upcoming' ? 'upcoming' : 'planned';
    
    const statusText = goal.status === 'in-progress' ? 'In Progress' :
                      goal.status === 'upcoming' ? 'Next' : 'Planned';
    
    card.innerHTML = `
        <div class="goal-header">
            <div class="goal-icon">
                ${getGoalIcon(goal.icon)}
            </div>
            <h3>${goal.title}</h3>
            <span class="goal-status ${statusClass}">${statusText}</span>
        </div>
        <div class="goal-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${goal.progress}%"></div>
            </div>
            <span class="progress-text">${goal.progress}% Complete</span>
        </div>
        <div class="goal-description">
            <p>${goal.description}</p>
        </div>
        <div class="goal-milestones">
            ${goal.milestones.map(milestone => createMilestoneElement(milestone, goal)).join('')}
        </div>
    `;
    
    return card;
}

/**
 * Create milestone element
 * @param {Object} milestone - Milestone object
 * @param {Object} goal - Parent goal object
 * @returns {string} - Milestone HTML
 */
function createMilestoneElement(milestone, goal) {
    const isCompleted = RoadmapState.completedMilestones.includes(milestone.id);
    const isCurrent = goal.currentMilestone === milestone.id;
    const isUpcoming = !isCompleted && !isCurrent;
    
    const statusClass = isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming';
    const statusIcon = isCompleted ? '✓' : isCurrent ? '●' : '○';
    
    return `
        <div class="milestone ${statusClass}">
            <div class="milestone-icon">${statusIcon}</div>
            <span>${milestone.title}</span>
        </div>
    `;
}

/**
 * Get goal icon SVG
 * @param {string} iconType - Icon type
 * @returns {string} - SVG HTML
 */
function getGoalIcon(iconType) {
    const icons = {
        'check-circle': `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
        `,
        'flame': `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
            </svg>
        `,
        'heart': `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        `
    };
    
    return icons[iconType] || icons['check-circle'];
}

// ==========================================
// PROGRESS TRACKING
// ==========================================

/**
 * Update progress displays
 */
function updateProgressDisplays() {
    updateProgressCircle();
    updateProgressStats();
}

/**
 * Update circular progress indicator
 */
function updateProgressCircle() {
    const progressRing = document.querySelector('.progress-ring-progress');
    const progressText = document.querySelector('.progress-percentage');
    
    if (progressRing && progressText) {
        const circumference = 2 * Math.PI * 50; // radius = 50
        const progress = RoadmapState.overallProgress;
        const offset = circumference - (progress / 100) * circumference;
        
        progressRing.style.stroke = 'var(--primary-color)';
        progressRing.style.strokeDasharray = circumference;
        progressRing.style.strokeDashoffset = offset;
        
        progressText.textContent = `${progress}%`;
    }
}

/**
 * Update progress statistics
 */
function updateProgressStats() {
    const stats = calculateProgressStats();
    
    // Update milestone count
    const milestoneElement = document.querySelector('.progress-stats .stat-item:first-child .stat-number');
    if (milestoneElement) {
        milestoneElement.textContent = stats.completedMilestones;
    }
    
    // Update goals count
    const goalsElement = document.querySelector('.progress-stats .stat-item:nth-child(2) .stat-number');
    if (goalsElement) {
        goalsElement.textContent = stats.completedGoals;
    }
    
    // Update sessions count
    const sessionsElement = document.querySelector('.progress-stats .stat-item:nth-child(3) .stat-number');
    if (sessionsElement) {
        sessionsElement.textContent = stats.sessionsAttended;
    }
}

/**
 * Calculate progress statistics
 * @returns {Object} - Progress statistics
 */
function calculateProgressStats() {
    const completedGoals = RoadmapState.currentGoals.filter(goal => goal.progress === 100).length;
    const completedMilestones = RoadmapState.completedMilestones.length;
    
    // Get sessions from mood tracker or other sources
    const moodHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');
    const sessionsAttended = Math.floor(moodHistory.length / 3); // Estimate based on mood entries
    
    return {
        completedGoals,
        completedMilestones,
        sessionsAttended: Math.max(12, sessionsAttended) // Minimum for demo
    };
}

// ==========================================
// TIMELINE FUNCTIONALITY
// ==========================================

/**
 * Load journey timeline
 */
function loadJourneyTimeline() {
    const timelineContainer = document.querySelector('.timeline');
    if (!timelineContainer) return;
    
    // Timeline is already populated in HTML for demo
    // In a real app, this would be dynamically generated from user data
    console.log('Timeline loaded with demo data');
}

/**
 * Add milestone to timeline
 * @param {Object} milestone - Milestone object
 * @param {string} status - Milestone status
 */
function addMilestoneToTimeline(milestone, status = 'completed') {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    
    const timelineItem = document.createElement('div');
    timelineItem.className = `timeline-item ${status}`;
    
    const markerIcon = status === 'completed' ? 
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg>' :
        status === 'current' ? '<div class="current-pulse"></div>' :
        '<div class="upcoming-dot"></div>';
    
    timelineItem.innerHTML = `
        <div class="timeline-marker">
            ${markerIcon}
        </div>
        <div class="timeline-content">
            <div class="timeline-date">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <h4>${milestone.title}</h4>
            <p>${milestone.description}</p>
            <div class="timeline-tags">
                <span class="tag">${milestone.category || 'Progress'}</span>
            </div>
        </div>
    `;
    
    // Insert at appropriate position based on date
    timeline.appendChild(timelineItem);
}

// ==========================================
// ACHIEVEMENTS SYSTEM
// ==========================================

/**
 * Update achievements display
 */
function updateAchievements() {
    const achievementsContainer = document.querySelector('.achievements-grid');
    if (!achievementsContainer) return;
    
    // Clear existing achievements
    achievementsContainer.innerHTML = '';
    
    // Display all achievements (earned and locked)
    Object.values(AchievementTemplates).forEach(achievement => {
        const earnedAchievement = RoadmapState.achievements.find(a => a.id === achievement.id);
        const achievementCard = createAchievementCard(achievement, earnedAchievement);
        achievementsContainer.appendChild(achievementCard);
    });
}

/**
 * Create achievement card element
 * @param {Object} achievement - Achievement template
 * @param {Object|null} earnedAchievement - Earned achievement data
 * @returns {HTMLElement} - Achievement card element
 */
function createAchievementCard(achievement, earnedAchievement) {
    const card = document.createElement('div');
    card.className = `achievement-card ${earnedAchievement ? 'earned' : 'locked'}`;
    
    const badgeIcon = getAchievementIcon(achievement.icon);
    const dateText = earnedAchievement ? 
        new Date(earnedAchievement.earnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
        getUnlockRequirement(achievement);
    
    card.innerHTML = `
        <div class="achievement-badge">
            ${badgeIcon}
        </div>
        <h4>${achievement.title}</h4>
        <p>${achievement.description}</p>
        <span class="${earnedAchievement ? 'earned-date' : 'unlock-requirement'}">${dateText}</span>
    `;
    
    return card;
}

/**
 * Get achievement icon SVG
 * @param {string} iconType - Icon type
 * @returns {string} - SVG HTML
 */
function getAchievementIcon(iconType) {
    const icons = {
        'star': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
            </svg>
        `,
        'flame': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
            </svg>
        `,
        'wind': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11H1v3h8v3l8-5-8-5v3z"></path>
            </svg>
        `,
        'shield': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"></path>
            </svg>
        `,
        'heart': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        `,
        'trophy': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55.47.98.97 1.21C12.04 18.75 14 20 14 20s1.96-1.25 3.03-1.79c.5-.23.97-.66.97-1.21v-2.34"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
            </svg>
        `
    };
    
    return icons[iconType] || icons['star'];
}

/**
 * Get unlock requirement text for achievement
 * @param {Object} achievement - Achievement object
 * @returns {string} - Unlock requirement text
 */
function getUnlockRequirement(achievement) {
    const requirements = {
        'anxiety-warrior': '2 milestones remaining',
        'self-love-champion': 'Goal not started',
        'journey-complete': 'Long-term goal'
    };
    
    return requirements[achievement.id] || 'Requirements not met';
}

/**
 * Check and award achievements
 * @param {string} condition - Achievement condition to check
 */
function checkAchievements(condition) {
    Object.values(AchievementTemplates).forEach(achievement => {
        if (achievement.condition === condition) {
            const alreadyEarned = RoadmapState.achievements.some(a => a.id === achievement.id);
            
            if (!alreadyEarned) {
                awardAchievement(achievement);
            }
        }
    });
}

/**
 * Award achievement to user
 * @param {Object} achievement - Achievement to award
 */
function awardAchievement(achievement) {
    const earnedAchievement = {
        ...achievement,
        earnedDate: new Date().toISOString()
    };
    
    RoadmapState.achievements.push(earnedAchievement);
    
    // Save to storage
    saveProgressData();
    
    // Show achievement notification
    showAchievementNotification(achievement);
    
    // Update display
    updateAchievements();
    
    console.log('Achievement awarded:', achievement.title);
}

/**
 * Show achievement notification
 * @param {Object} achievement - Awarded achievement
 */
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <div class="achievement-notification-icon">
                ${getAchievementIcon(achievement.icon)}
            </div>
            <div class="achievement-notification-text">
                <h4>Achievement Unlocked!</h4>
                <p>${achievement.title}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// ==========================================
// GOAL MANAGEMENT
// ==========================================

/**
 * Complete milestone
 * @param {string} milestoneId - Milestone ID
 * @param {string} goalId - Parent goal ID
 */
function completeMilestone(milestoneId, goalId) {
    // Add to completed milestones
    if (!RoadmapState.completedMilestones.includes(milestoneId)) {
        RoadmapState.completedMilestones.push(milestoneId);
    }
    
    // Update goal progress
    const goal = RoadmapState.currentGoals.find(g => g.id === goalId);
    if (goal) {
        const completedCount = goal.milestones.filter(m => 
            RoadmapState.completedMilestones.includes(m.id)
        ).length;
        
        goal.progress = Math.round((completedCount / goal.milestones.length) * 100);
        
        // Update current milestone
        const nextMilestone = goal.milestones.find(m => 
            !RoadmapState.completedMilestones.includes(m.id)
        );
        goal.currentMilestone = nextMilestone ? nextMilestone.id : null;
        
        // Check if goal is complete
        if (goal.progress === 100) {
            completeGoal(goalId);
        }
    }
    
    // Add to timeline
    const milestone = findMilestoneById(milestoneId);
    if (milestone) {
        addMilestoneToTimeline(milestone, 'completed');
    }
    
    // Save progress
    saveProgressData();
    
    // Update displays
    updateProgressDisplays();
    initializeCurrentGoals();
    
    // Check achievements
    checkAchievements(`complete-milestone-${milestoneId}`);
    
    console.log('Milestone completed:', milestoneId);
}

/**
 * Complete goal
 * @param {string} goalId - Goal ID
 */
function completeGoal(goalId) {
    const goal = RoadmapState.currentGoals.find(g => g.id === goalId);
    if (goal) {
        goal.status = 'completed';
        goal.completedDate = new Date().toISOString();
        
        // Update overall progress
        calculateOverallProgress();
        
        // Check achievements
        checkAchievements(`complete-goal-${goalId}`);
        
        // Show completion notification
        showNotification(`Congratulations! You've completed ${goal.title}!`, 'success');
        
        console.log('Goal completed:', goalId);
    }
}

/**
 * Calculate overall progress
 */
function calculateOverallProgress() {
    const totalGoals = RoadmapState.currentGoals.length;
    const totalProgress = RoadmapState.currentGoals.reduce((sum, goal) => sum + goal.progress, 0);
    
    RoadmapState.overallProgress = Math.round(totalProgress / totalGoals);
}

/**
 * Find milestone by ID
 * @param {string} milestoneId - Milestone ID
 * @returns {Object|null} - Milestone object
 */
function findMilestoneById(milestoneId) {
    for (const goal of RoadmapState.currentGoals) {
        const milestone = goal.milestones.find(m => m.id === milestoneId);
        if (milestone) {
            return milestone;
        }
    }
    return null;
}

// ==========================================
// ACTION HANDLERS
// ==========================================

/**
 * Schedule therapy session
 */
function scheduleSession() {
    window.location.href = 'meeting.html';
}

/**
 * Update goals (placeholder)
 */
function updateGoals() {
    showNotification('Goal customization coming soon!', 'info');
}

/**
 * Share progress (placeholder)
 */
function shareProgress() {
    // In real app, this would generate a shareable progress report
    const progressText = `I'm ${RoadmapState.overallProgress}% through my mental health journey with CounselCare! 🌟`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My Mental Health Progress',
            text: progressText,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(progressText).then(() => {
            showNotification('Progress copied to clipboard!', 'success');
        });
    }
}

// ==========================================
// DATA PERSISTENCE
// ==========================================

/**
 * Save progress data to storage
 */
function saveProgressData() {
    const progressData = {
        currentGoals: RoadmapState.currentGoals,
        completedMilestones: RoadmapState.completedMilestones,
        achievements: RoadmapState.achievements,
        overallProgress: RoadmapState.overallProgress,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('roadmapProgress', JSON.stringify(progressData));
}

/**
 * Export progress data
 * @returns {Object} - Progress data for export
 */
function exportProgressData() {
    return {
        ...RoadmapState,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get estimated completion date for goal
 * @param {Object} goal - Goal object
 * @returns {Date} - Estimated completion date
 */
function getEstimatedCompletionDate(goal) {
    if (!goal.startDate) return null;
    
    const startDate = new Date(goal.startDate);
    const remainingMilestones = goal.milestones.filter(m => 
        !RoadmapState.completedMilestones.includes(m.id)
    );
    
    const remainingDays = remainingMilestones.reduce((sum, milestone) => 
        sum + milestone.estimatedDays, 0
    );
    
    return new Date(startDate.getTime() + (remainingDays * 24 * 60 * 60 * 1000));
}

/**
 * Calculate time spent on goals
 * @returns {Object} - Time statistics
 */
function calculateTimeStats() {
    const activeGoals = RoadmapState.currentGoals.filter(g => g.startDate);
    const totalDays = activeGoals.reduce((sum, goal) => {
        const startDate = new Date(goal.startDate);
        const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        return sum + daysSinceStart;
    }, 0);
    
    return {
        totalDays,
        averageDaysPerGoal: activeGoals.length > 0 ? Math.round(totalDays / activeGoals.length) : 0,
        activeGoals: activeGoals.length
    };
}

// ==========================================
// DEVELOPMENT HELPERS
// ==========================================

// Make roadmap state available globally in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.RoadmapState = RoadmapState;
    window.completeMilestone = completeMilestone;
    window.awardAchievement = awardAchievement;
    window.exportProgressData = exportProgressData;
    console.log('Development mode: RoadmapState available globally');
}

// Add achievement notification CSS
const achievementCSS = `
.achievement-notification {
    position: fixed;
    top: 100px;
    right: -400px;
    width: 350px;
    background: linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%);
    color: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    transition: right 0.3s ease-out;
    z-index: 10000;
}

.achievement-notification.show {
    right: 20px;
}

.achievement-notification-content {
    display: flex;
    align-items: center;
    gap: 16px;
}

.achievement-notification-icon {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.achievement-notification-text h4 {
    margin: 0 0 4px 0;
    font-size: 1.125rem;
    font-weight: 600;
}

.achievement-notification-text p {
    margin: 0;
    opacity: 0.9;
}

@media (max-width: 768px) {
    .achievement-notification {
        right: -100%;
        left: 10px;
        width: calc(100vw - 20px);
        max-width: 350px;
    }
    
    .achievement-notification.show {
        right: auto;
    }
}
`;

// Inject achievement notification CSS
const achievementStyle = document.createElement('style');
achievementStyle.textContent = achievementCSS;
document.head.appendChild(achievementStyle);