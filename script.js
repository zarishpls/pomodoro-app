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
const longBreakTimeInput = document.getElementById('longBreakTime');
const sessionsBeforeLongBreakInput = document.getElementById('sessionsBeforeLongBreak');
const toggleSound = document.getElementById('toggleSound');
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

// Load settings from localStorage
function loadSettings() {
  const savedSettings = localStorage.getItem('pomodoroSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    workTime = settings.workTime * 60;
    breakTime = settings.breakTime * 60;
    longBreakTime = settings.longBreakTime * 60;
    sessionsBeforeLongBreak = settings.sessionsBeforeLongBreak;
    soundEnabled = settings.soundEnabled !== false;
    
    focusTimeInput.value = settings.workTime;
    breakTimeInput.value = settings.breakTime;
    longBreakTimeInput.value = settings.longBreakTime;
    sessionsBeforeLongBreakInput.value = settings.sessionsBeforeLongBreak;
    
    currentTime = isWorkSession ? workTime : breakTime;
    updateDisplay();
  }
  updateSoundButton();
}

// Save settings to localStorage
function saveSettingsToStorage() {
  const settings = {
    workTime: parseInt(focusTimeInput.value),
    breakTime: parseInt(breakTimeInput.value),
    longBreakTime: parseInt(longBreakTimeInput.value),
    sessionsBeforeLongBreak: parseInt(sessionsBeforeLongBreakInput.value),
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
  timerLabel.textContent = isWorkSession ? 'Focus Time' : sessionsCompleted % sessionsBeforeLongBreak === 0 ? 'Long Break' : 'Short Break';
  
  // Visual feedback for different states
  timerDisplay.className = 'timer';
  if (currentTime <= 10) {
    timerDisplay.classList.add('timer-warning');
  }
}

// Play sound notification
function playNotificationSound() {
  if (soundEnabled) {
    timerSound.currentTime = 0;
    timerSound.play().catch(e => console.log("Audio play failed:", e));
  }
}

// Toggle sound setting
function toggleSoundSetting() {
  soundEnabled = !soundEnabled;
  updateSoundButton();
  saveSettingsToStorage();
}

function updateSoundButton() {
  toggleSound.innerHTML = `<i class="fas fa-bell"></i> Sound ${soundEnabled ? 'On' : 'Off'}`;
  toggleSound.style.color = soundEnabled ? '' : '#aaa';
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
          const isLongBreak = sessionsCompleted % sessionsBeforeLongBreak === 0;
          currentTime = isLongBreak ? longBreakTime : breakTime;
          timerLabel.textContent = isLongBreak ? 'Long Break' : 'Short Break';
        }
        
        // Visual feedback
        timerDisplay.classList.add('timer-complete');
        setTimeout(() => {
          timerDisplay.classList.remove('timer-complete');
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

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
settingsBtn.addEventListener('click', toggleSettings);
saveSettings.addEventListener('click', saveSettingsToStorage);
toggleSound.addEventListener('click', toggleSoundSetting);

// Initialize
loadSettings();
updateDisplay();