// DOM Elements
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionsDisplay = document.getElementById('sessions');
const timerLabel = document.getElementById('timerLabel');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const saveSettings = document.getElementById('saveSettings');
const focusTimeInput = document.getElementById('focusTime');
const breakTimeInput = document.getElementById('breakTime');
const timerSound = document.getElementById('timerSound');

// Timer Variables
let workTime = 25 * 60; // 25 minutes in seconds
let breakTime = 5 * 60;  // 5 minutes in seconds
let longBreakTime = 15 * 60; // 15 minutes in seconds
let sessionsBeforeLongBreak = 4;
let currentTime = workTime;
let isWorkSession = true;
let isRunning = false;
let timer;
let sessionsCompleted = 0;
let soundEnabled = true;

// Initialize task timer
let taskTimerInstance;

// Load settings from localStorage
function loadSettings() {
  const savedSettings = localStorage.getItem('pomodoroSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    workTime = (settings.workTime || 25) * 60;
    breakTime = (settings.breakTime || 5) * 60;
    longBreakTime = (settings.longBreakTime || 15) * 60;
    sessionsBeforeLongBreak = settings.sessionsBeforeLongBreak || 4;
    soundEnabled = settings.soundEnabled !== false;
    
    if (focusTimeInput) focusTimeInput.value = settings.workTime || 25;
    if (breakTimeInput) breakTimeInput.value = settings.breakTime || 5;
    
    currentTime = isWorkSession ? workTime : breakTime;
    updateDisplay();
  }
}

// Save settings to localStorage
function saveSettingsToStorage() {
  const settings = {
    workTime: parseInt(focusTimeInput.value) || 25,
    breakTime: parseInt(breakTimeInput.value) || 5,
    longBreakTime: 15, // Default value
    sessionsBeforeLongBreak: 4, // Default value
    soundEnabled: soundEnabled
  };
  localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  
  workTime = settings.workTime * 60;
  breakTime = settings.breakTime * 60;
  longBreakTime = settings.longBreakTime * 60;
  sessionsBeforeLongBreak = settings.sessionsBeforeLongBreak;
  
  if (!isRunning) {
    currentTime = isWorkSession ? workTime : breakTime;
    updateDisplay();
  }
  
  settingsPanel.style.display = 'none';
}

// Update Display
function updateDisplay() {
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  timerLabel.textContent = isWorkSession ? 'Focus Time' : (sessionsCompleted % sessionsBeforeLongBreak === 0 && sessionsCompleted > 0) ? 'Long Break' : 'Short Break';
}

// Play sound notification
function playNotificationSound() {
  if (soundEnabled && timerSound) {
    timerSound.currentTime = 0;
    timerSound.play().catch(e => console.log("Audio play failed:", e));
  }
}

// Start Timer
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    timer = setInterval(() => {
      currentTime--;
      updateDisplay();

      if (currentTime < 0) {
        clearInterval(timer);
        playNotificationSound();
        
        if (isWorkSession) {
          sessionsCompleted++;
          sessionsDisplay.textContent = sessionsCompleted;
        }
        
        isWorkSession = !isWorkSession;
        
        // Determine next session type
        if (isWorkSession) {
          currentTime = workTime;
          timerLabel.textContent = 'Focus Time';
        } else {
          const isLongBreak = sessionsCompleted % sessionsBeforeLongBreak === 0 && sessionsCompleted > 0;
          currentTime = isLongBreak ? longBreakTime : breakTime;
          timerLabel.textContent = isLongBreak ? 'Long Break' : 'Short Break';
        }
        
        updateDisplay();
        
        // Visual feedback and auto-start
        setTimeout(() => {
          startTimer(); // Auto-start next session
        }, 1000);
      }
    }, 1000);
  }
}

// Pause Timer
function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

// Reset Timer
function resetTimer() {
  pauseTimer();
  isWorkSession = true;
  currentTime = workTime;
  updateDisplay();
}

// Toggle settings panel
function toggleSettings() {
  settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
}

// View Management
let views = {};
let timeOptions = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  // Get view elements
  views = {
    landing: document.getElementById('landingView'),
    taskForm: document.getElementById('taskFormView'),
    standardTimer: document.getElementById('standardTimerView'),
    taskTimer: document.getElementById('taskTimerView')
  };

  // Get time options
  timeOptions = document.querySelectorAll('.time-option');
  
  // Set up event listeners
  if (startBtn) startBtn.addEventListener('click', startTimer);
  if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);
  if (settingsBtn) settingsBtn.addEventListener('click', toggleSettings);
  if (saveSettings) saveSettings.addEventListener('click', saveSettingsToStorage);

  // Navigation
  document.getElementById('standardModeBtn').addEventListener('click', () => showView(views.standardTimer));
  document.getElementById('taskModeBtn').addEventListener('click', () => showView(views.taskForm));
  document.getElementById('backToLandingBtn').addEventListener('click', () => showView(views.landing));
  document.getElementById('backToLandingFromTimer').addEventListener('click', () => {
    pauseTimer();
    showView(views.landing);
  });
  document.getElementById('backToLandingFromTaskTimer').addEventListener('click', () => {
    if (taskTimerInstance) {
      taskTimerInstance.pauseTimer();
    }
    showView(views.landing);
  });

  // Time Selection
  timeOptions.forEach(option => {
    option.addEventListener('click', function() {
      timeOptions.forEach(opt => {
        opt.classList.remove('selected');
      });
      this.classList.add('selected');
    });
  });

  // Task Form Submission
  document.getElementById('startTaskBtn').addEventListener('click', function() {
    const taskName = document.getElementById('taskName').value.trim();
    const selectedOption = document.querySelector('.time-option.selected');
    
    if (!taskName) {
      alert('Please enter a task name');
      return;
    }
    
    if (!selectedOption) {
      alert('Please select an estimated time');
      return;
    }
    
    const estimatedHours = parseFloat(selectedOption.dataset.value);
    
    // Initialize task timer if not already initialized
    if (!taskTimerInstance) {
      taskTimerInstance = new TaskTimer();
    }
    
    // Set task details and show task timer view
    taskTimerInstance.setTaskDetails(taskName, estimatedHours);
    showView(views.taskTimer);
  });

  // Load settings and initialize display
  loadSettings();
  updateDisplay();
});

// Show view function
function showView(view) {
  Object.values(views).forEach(v => v.classList.remove('active'));
  view.classList.add('active');
}