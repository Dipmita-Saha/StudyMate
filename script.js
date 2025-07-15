// Cleaned and polished JS. All functions are in use and data is handled via localStorage.
// script.js
// Placeholder for main JavaScript functionality

console.log('Smart Study Planner loaded');

// Display current date in the header
function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}

// Subject Manager Logic
const subjectForm = document.getElementById('subject-form');
const subjectList = document.getElementById('subject-list');
const subjectIdInput = document.getElementById('subject-id');
const subjectNameInput = document.getElementById('subject-name');
const subjectColorInput = document.getElementById('subject-color');
const subjectIconInput = document.getElementById('subject-icon');
const cancelEditBtn = document.getElementById('cancel-edit');

function getSubjects() {
  return JSON.parse(localStorage.getItem('subjects') || '[]');
}

function saveSubjects(subjects) {
  localStorage.setItem('subjects', JSON.stringify(subjects));
}

function renderSubjects() {
  const subjects = getSubjects();
  subjectList.innerHTML = '';
  subjects.forEach((subj, idx) => {
    const li = document.createElement('li');
    li.className = 'subject-item';
    li.innerHTML = `
      <span class="subject-color" style="background:${subj.color}"></span>
      <span class="subject-icon">${subj.icon}</span>
      <span class="subject-name">${subj.name}</span>
      <span class="subject-actions">
        <button class="edit" data-idx="${idx}">Edit</button>
        <button class="delete" data-idx="${idx}">Delete</button>
      </span>
    `;
    subjectList.appendChild(li);
  });
}

function resetForm() {
  subjectIdInput.value = '';
  subjectNameInput.value = '';
  subjectColorInput.value = '#4F8A8B';
  subjectIconInput.value = '📚';
  cancelEditBtn.style.display = 'none';
  subjectForm.querySelector('button[type="submit"]').textContent = 'Add Subject';
}

subjectForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const id = subjectIdInput.value;
  const name = subjectNameInput.value.trim();
  const color = subjectColorInput.value;
  const icon = subjectIconInput.value;
  if (!name) return;
  let subjects = getSubjects();
  if (id) {
    // Edit
    subjects[+id] = { name, color, icon };
  } else {
    // Add
    subjects.push({ name, color, icon });
  }
  saveSubjects(subjects);
  renderSubjects();
  resetForm();
});

subjectList.addEventListener('click', function(e) {
  if (e.target.classList.contains('edit')) {
    const idx = e.target.getAttribute('data-idx');
    const subjects = getSubjects();
    const subj = subjects[idx];
    subjectIdInput.value = idx;
    subjectNameInput.value = subj.name;
    subjectColorInput.value = subj.color;
    subjectIconInput.value = subj.icon;
    cancelEditBtn.style.display = 'inline-block';
    subjectForm.querySelector('button[type="submit"]').textContent = 'Update Subject';
  } else if (e.target.classList.contains('delete')) {
    const idx = e.target.getAttribute('data-idx');
    let subjects = getSubjects();
    subjects.splice(idx, 1);
    saveSubjects(subjects);
    renderSubjects();
    resetForm();
  }
});

cancelEditBtn.addEventListener('click', function() {
  resetForm();
});

// Weekly Planner Logic
const weeklyGrid = document.getElementById('weekly-grid');
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const taskModal = document.getElementById('task-modal');
const closeTaskModal = document.getElementById('close-task-modal');
const taskForm = document.getElementById('task-form');
const taskIdInput = document.getElementById('task-id');
const taskDayInput = document.getElementById('task-day');
const taskNameInput = document.getElementById('task-name');
const taskSubjectInput = document.getElementById('task-subject');
const taskPriorityInput = document.getElementById('task-priority');
const cancelTaskBtn = document.getElementById('cancel-task');

function getTasks() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}

function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function openTaskModal(dayIdx, task) {
  taskModal.style.display = 'flex';
  taskDayInput.value = dayIdx;
  if (task) {
    taskIdInput.value = task.id;
    taskNameInput.value = task.name;
    taskSubjectInput.value = task.subjectIdx;
    taskPriorityInput.value = task.priority;
    taskForm.querySelector('button[type="submit"]').textContent = 'Update Task';
  } else {
    taskIdInput.value = '';
    taskNameInput.value = '';
    taskSubjectInput.value = '';
    taskPriorityInput.value = 'medium';
    taskForm.querySelector('button[type="submit"]').textContent = 'Add Task';
  }
  populateSubjectDropdown(taskSubjectInput);
}

function closeTaskModalFn() {
  taskModal.style.display = 'none';
  taskForm.reset();
}

function renderWeeklyGrid() {
  const tasks = getTasks();
  const subjects = getSubjects();
  const todayIdx = new Date().getDay();
  weeklyGrid.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const dayCol = document.createElement('div');
    dayCol.className = 'weekly-day' + (i === todayIdx ? ' today' : '');
    dayCol.innerHTML = `
      <div class="weekly-day-header">${daysOfWeek[i]}</div>
      <ul class="task-list" id="task-list-${i}"></ul>
      <button class="add-task-btn" data-day="${i}">+ Add Task</button>
    `;
    weeklyGrid.appendChild(dayCol);
  }
  // Render tasks for each day
  for (let i = 0; i < 7; i++) {
    const list = document.getElementById(`task-list-${i}`);
    const dayTasks = tasks.filter(t => t.dayIdx === i);
    dayTasks.forEach((task, idx) => {
      const li = document.createElement('li');
      li.className = 'task-item';
      const subj = subjects[task.subjectIdx] || { name: 'No Subject', color: '#ccc', icon: '' };
      li.innerHTML = `
        <span class="task-subject" style="color:${subj.color}">${subj.icon} ${subj.name}</span>
        <span class="task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
        <span class="task-name">${task.name}</span>
        <span class="task-actions">
          <button class="edit" data-day="${i}" data-idx="${task.id}">Edit</button>
          <button class="delete" data-day="${i}" data-idx="${task.id}">Delete</button>
        </span>
      `;
      list.appendChild(li);
    });
  }
}

// Unique task id generator
function getNextTaskId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

// Add/Edit Task
if (taskForm) {
  taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = taskIdInput.value;
    const dayIdx = +taskDayInput.value;
    const name = taskNameInput.value.trim();
    const subjectIdx = +taskSubjectInput.value;
    const priority = taskPriorityInput.value;
    if (!name || isNaN(dayIdx)) return;
    let tasks = getTasks();
    if (id) {
      // Edit
      const idx = tasks.findIndex(t => t.id == id);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], name, subjectIdx, priority, dayIdx };
      }
    } else {
      // Add
      tasks.push({ id: getNextTaskId(), name, subjectIdx, priority, dayIdx });
    }
    saveTasks(tasks);
    renderWeeklyGrid();
    closeTaskModalFn();
  });
}

// Open modal for add task
weeklyGrid.addEventListener('click', function(e) {
  if (e.target.classList.contains('add-task-btn')) {
    const dayIdx = +e.target.getAttribute('data-day');
    openTaskModal(dayIdx);
  } else if (e.target.classList.contains('edit')) {
    const dayIdx = +e.target.getAttribute('data-day');
    const id = e.target.getAttribute('data-idx');
    const tasks = getTasks();
    const task = tasks.find(t => t.id == id);
    openTaskModal(dayIdx, task);
  } else if (e.target.classList.contains('delete')) {
    const id = e.target.getAttribute('data-idx');
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id != id);
    saveTasks(tasks);
    renderWeeklyGrid();
  }
});

closeTaskModal.addEventListener('click', closeTaskModalFn);
cancelTaskBtn.addEventListener('click', function(e) {
  e.preventDefault();
  closeTaskModalFn();
});

// Close modal on outside click
window.addEventListener('click', function(e) {
  if (e.target === taskModal) {
    closeTaskModalFn();
  }
});

// Daily Tasks Logic
const dailyTaskList = document.getElementById('daily-task-list');
const noDailyTasksMsg = document.getElementById('no-daily-tasks');

function renderDailyTasks() {
  const tasks = getTasks();
  const subjects = getSubjects();
  const todayIdx = new Date().getDay();
  const todayTasks = tasks.filter(t => t.dayIdx === todayIdx);
  dailyTaskList.innerHTML = '';
  if (todayTasks.length === 0) {
    noDailyTasksMsg.style.display = 'block';
    return;
  } else {
    noDailyTasksMsg.style.display = 'none';
  }
  todayTasks.forEach(task => {
    const subj = subjects[task.subjectIdx] || { name: 'No Subject', color: '#ccc', icon: '' };
    const li = document.createElement('li');
    li.className = 'daily-task-item' + (task.completed ? ' completed' : '') + (task.rescheduled ? ' rescheduled' : '');
    li.innerHTML = `
      <input type="checkbox" class="daily-task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''} />
      ${task.rescheduled ? '<span class="reschedule-icon" title="Rescheduled">🔄</span>' : ''}
      <span class="daily-task-subject" style="color:${subj.color}">${subj.icon} ${subj.name}</span>
      <span class="daily-task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
      <span class="daily-task-name">${task.name}</span>
    `;
    dailyTaskList.appendChild(li);
  });
}

dailyTaskList.addEventListener('change', function(e) {
  if (e.target.classList.contains('daily-task-checkbox')) {
    const id = e.target.getAttribute('data-id');
    let tasks = getTasks();
    const idx = tasks.findIndex(t => t.id == id);
    if (idx !== -1) {
      tasks[idx].completed = e.target.checked;
      saveTasks(tasks);
      renderDailyTasks();
      renderWeeklyGrid(); // Sync with weekly planner
    }
  }
});

// Update weekly planner to show completed tasks
function renderWeeklyGridWithCompletion() {
  const tasks = getTasks();
  const subjects = getSubjects();
  const todayIdx = new Date().getDay();
  weeklyGrid.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const dayCol = document.createElement('div');
    dayCol.className = 'weekly-day' + (i === todayIdx ? ' today' : '');
    dayCol.innerHTML = `
      <div class="weekly-day-header">${daysOfWeek[i]}</div>
      <ul class="task-list" id="task-list-${i}"></ul>
      <button class="add-task-btn" data-day="${i}">+ Add Task</button>
    `;
    weeklyGrid.appendChild(dayCol);
  }
  // Render tasks for each day
  for (let i = 0; i < 7; i++) {
    const list = document.getElementById(`task-list-${i}`);
    const dayTasks = tasks.filter(t => t.dayIdx === i);
    dayTasks.forEach((task, idx) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '') + (task.rescheduled ? ' rescheduled' : '');
      const subj = subjects[task.subjectIdx] || { name: 'No Subject', color: '#ccc', icon: '' };
      li.innerHTML = `
        ${task.rescheduled ? '<span class="reschedule-icon" title="Rescheduled">🔄</span>' : ''}
        <span class="task-subject" style="color:${subj.color}">${subj.icon} ${subj.name}</span>
        <span class="task-priority ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
        <span class="task-name">${task.name}</span>
        <span class="task-actions">
          <button class="edit" data-day="${i}" data-idx="${task.id}">Edit</button>
          <button class="delete" data-day="${i}" data-idx="${task.id}">Delete</button>
        </span>
      `;
      list.appendChild(li);
    });
  }
}

// Patch: Use new renderWeeklyGridWithCompletion everywhere
renderWeeklyGrid = renderWeeklyGridWithCompletion;

// Update all views on load and after changes
function updateAllTaskViews() {
  renderWeeklyGrid();
  renderDailyTasks();
}

// Progress Tracker Logic
const completedCountElem = document.getElementById('completed-count');
const totalCountElem = document.getElementById('total-count');
const rescheduledCountElem = document.getElementById('rescheduled-count');
const weeklyRateElem = document.getElementById('weekly-rate');
const progressPie = document.getElementById('progress-pie');

function getCurrentWeekTasks() {
  // Get all tasks for the current week (Sunday to Saturday)
  const tasks = getTasks();
  // Assume all tasks in storage are for this week (if you want to filter by week, add a week property)
  return tasks;
}

function updateProgressStats() {
  const weekTasks = getCurrentWeekTasks();
  const total = weekTasks.length;
  const completed = weekTasks.filter(t => t.completed).length;
  const rescheduled = weekTasks.filter(t => t.rescheduled).length;
  completedCountElem.textContent = completed;
  totalCountElem.textContent = total;
  rescheduledCountElem.textContent = rescheduled;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  weeklyRateElem.textContent = rate + '%';
  drawProgressPie(completed, rescheduled, total - completed - rescheduled);
}

function drawProgressPie(completed, rescheduled, remaining) {
  if (!progressPie) return;
  const ctx = progressPie.getContext('2d');
  ctx.clearRect(0, 0, progressPie.width, progressPie.height);
  const data = [completed, rescheduled, remaining];
  const colors = ['#4F8A8B', '#1976d2', '#FBD46D'];
  const labels = ['Completed', 'Rescheduled', 'Remaining'];
  const total = data.reduce((a, b) => a + b, 0);
  let startAngle = -0.5 * Math.PI;
  for (let i = 0; i < data.length; i++) {
    const sliceAngle = (data[i] / (total || 1)) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(110, 110);
    ctx.arc(110, 110, 100, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    startAngle += sliceAngle;
  }
  // Optional: Add legend
  ctx.font = '15px Open Sans, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < data.length; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(10, 20 + i * 28, 18, 18);
    ctx.fillStyle = '#222831';
    ctx.fillText(labels[i] + ` (${data[i]})`, 35, 29 + i * 28);
  }
}

// Patch updateAllTaskViews to also update progress
const _updateAllTaskViews = updateAllTaskViews;
updateAllTaskViews = function() {
  _updateAllTaskViews();
  updateProgressStats();
};

document.addEventListener('DOMContentLoaded', () => {
  const dateElem = document.getElementById('current-date');
  if (dateElem) {
    const today = new Date();
    dateElem.textContent = formatDate(today);
  }
  renderSubjects();
  updateAllTaskViews();
  updateProgressStats();
});

// Utility: Populate a dropdown with subjects (for planner/tasks)
function populateSubjectDropdown(dropdownElem) {
  const subjects = getSubjects();
  dropdownElem.innerHTML = '';
  subjects.forEach((subj, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = `${subj.icon} ${subj.name}`;
    dropdownElem.appendChild(option);
  });
}

// Phase 6: Reschedule Missed Tasks Logic
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getLastLoginDate() {
  return localStorage.getItem('lastLoginDate');
}

function setLastLoginDate(dateStr) {
  localStorage.setItem('lastLoginDate', dateStr);
}

function rescheduleMissedTasks() {
  const lastLogin = getLastLoginDate();
  const todayStr = getTodayDateString();
  if (!lastLogin || lastLogin === todayStr) {
    setLastLoginDate(todayStr);
    return;
  }
  // Find unfinished tasks from the last login day
  let tasks = getTasks();
  const lastLoginDate = new Date(lastLogin);
  const lastDayIdx = lastLoginDate.getDay();
  const todayIdx = new Date().getDay();
  let changed = false;
  tasks = tasks.map(task => {
    // Only reschedule if:
    // - Task is from last login day
    // - Not completed
    // - Not already rescheduled (has rescheduledFor == todayStr)
    if (
      task.dayIdx === lastDayIdx &&
      !task.completed &&
      task.rescheduledFor !== todayStr
    ) {
      changed = true;
      return {
        ...task,
        dayIdx: todayIdx,
        rescheduled: true,
        rescheduledFor: todayStr
      };
    }
    return task;
  });
  if (changed) {
    saveTasks(tasks);
  }
  setLastLoginDate(todayStr);
}

// Call rescheduleMissedTasks before rendering tasks
(function() {
  rescheduleMissedTasks();
})();

// Dark/Light Mode Toggle Logic
const themeToggleBtn = document.getElementById('theme-toggle');

function setTheme(mode) {
  if (mode === 'dark') {
    document.body.classList.add('dark');
    themeToggleBtn.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark');
    themeToggleBtn.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  }
}

function getPreferredTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

themeToggleBtn.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
});

// Apply theme on load
setTheme(getPreferredTheme()); 