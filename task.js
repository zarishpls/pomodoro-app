// task.js - Task Timer Implementation
class TaskTimer {
  constructor(options = {}) {
    // DOM Elements
    this.timerDisplay = document.getElementById('taskTimerDisplay');
    this.startBtn = document.getElementById('taskStartBtn');
    this.pauseBtn = document.getElementById('taskPauseBtn');
    this.resetBtn = document.getElementById('taskResetBtn');
    this.sessionsDisplay = document.getElementById('taskSessions');
    this.timerLabel = document.getElementById('taskTimerLabel');
    
    // Timer Variables
    this.workTime = 25 * 60; // 25 minutes focus by default
    this.breakTime = 5 * 60;  // 5 minutes break by default
    this.currentTime = this.workTime;
    this.isWorkSession = true;
    this.isRunning = false;
    this.timer = null;
    this.sessionsCompleted = 0;
    this.soundEnabled = true;
    this.timerSound = document.getElementById('timerSound');
    
    // Task Details
    this.taskName = '';
    this.taskEstimatedHours = 0;
    this.sessionsDone = 0;
    
    // Event Listeners
    this.startBtn.addEventListener('click', () => this.startTimer());
    this.pauseBtn.addEventListener('click', () => this.pauseTimer());
    this.resetBtn.addEventListener('click', () => this.resetTimer());
    
    // Initialize display
    this.updateDisplay();
  }
  
  setTaskDetails(name, estimatedHours) {
    this.taskName = name;
    this.taskEstimatedHours = estimatedHours;
    document.getElementById('currentTaskName').textContent = `Working on: ${name}`;
    document.getElementById('currentTaskEstimate').textContent = `Estimated: ${estimatedHours} hour${estimatedHours !== 1 ? 's' : ''}`;
  }
  
  updateDisplay() {
    const minutes = Math.floor(this.currentTime / 60);
    const seconds = this.currentTime % 60;
    this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    this.timerLabel.textContent = this.isWorkSession ? 'Focus Time' : 'Break Time';
  }
  
  playNotificationSound() {
    if (this.soundEnabled) {
      this.timerSound.currentTime = 0;
      this.timerSound.play().catch(e => console.log("Audio play failed:", e));
    }
  }
  
  startTimer() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.timer = setInterval(() => {
        this.currentTime--;
        this.updateDisplay();

        if (this.currentTime < 0) {
          clearInterval(this.timer);
          this.playNotificationSound();
          
          if (this.isWorkSession) {
            this.sessionsCompleted++;
            this.sessionsDisplay.textContent = this.sessionsCompleted;
          }
          
          this.isWorkSession = !this.isWorkSession;
          
          // Determine next session type
          if (this.isWorkSession) {
            this.currentTime = this.workTime;
            this.timerLabel.textContent = 'Focus Time';
          } else {
            this.currentTime = this.breakTime;
            this.timerLabel.textContent = 'Break Time';
          }
          
          // Visual feedback
          this.timerDisplay.classList.add('timer-complete');
          setTimeout(() => {
            this.timerDisplay.classList.remove('timer-complete');
            this.startTimer(); // Auto-start next session
          }, 1000);
        }
      }, 1000);
    }
  }
  
  pauseTimer() {
    clearInterval(this.timer);
    this.isRunning = false;
  }
  
  resetTimer() {
    this.pauseTimer();
    this.isWorkSession = true;
    this.currentTime = this.workTime;
    this.updateDisplay();
  }
}