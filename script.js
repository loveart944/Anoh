class AttendanceCalendar {
  constructor() {
    // Initialize properties by getting elements from the DOM
    this.currentDate = new Date(); // Current date for calendar display
    this.selectedDays = []; // Array to store selected days
    this.selectedMonth = this.currentDate.getMonth(); // Selected month
    this.selectedYear = this.currentDate.getFullYear(); // Selected year

    // DOM elements
    this.calendarGrid = document.getElementById('calendarGrid');
    this.monthYearDisplay = document.getElementById('monthYearDisplay');
    this.prevMonthBtn = document.getElementById('prevMonthBtn');
    this.nextMonthBtn = document.getElementById('nextMonthBtn');
    this.monthSummaryBtn = document.getElementById('monthSummaryBtn');
    this.clearDayBtn = document.getElementById('clearDayBtn');
    this.noteBtn = document.getElementById('noteBtn');
    this.overtimeBtn = document.getElementById('overtimeBtn');

    this.dayDetails = document.getElementById('dayDetails');
    this.dayDetailsTitle = document.getElementById('dayDetailsTitle');
    this.dayNote = document.getElementById('dayNote');
    this.saveDayNoteBtn = document.getElementById('saveDayNoteBtn');
    this.closeDayDetailsBtn = document.getElementById('closeDayDetailsBtn');
    this.overlay = document.getElementById('overlay');

    this.overtimeModal = document.getElementById('overtimeModal');
    this.overtimeInput = document.getElementById('overtimeInput');
    this.closeOvertimeModal = document.getElementById('closeOvertimeModal');
    this.cancelOvertime = document.getElementById('cancelOvertime');
    this.saveOvertime = document.getElementById('saveOvertime');

    // Shift Modal elements
    this.shiftModal = document.getElementById('shiftModal');
    this.closeShiftModal = document.getElementById('closeShiftModal');
    this.cancelShift = document.getElementById('cancelShift');
    this.shiftOptionButtons = document.querySelectorAll('.btn-shift-option');
    this.shiftBtn = document.getElementById('shiftBtn');

    this.sideMenu = document.getElementById('sideMenu');
    this.menuToggle = document.getElementById('menuToggle');
    this.overlayMenu = document.getElementById('overlayMenu');
    this.appContainer = document.getElementById('appContainer');

    // Holiday Screen elements
    this.holidaysFestivalsBtn = document.getElementById('holidaysFestivalsBtn');
    this.holidayScreen = document.getElementById('holidayScreen');
    this.backToCalendarFromHolidaysBtn = document.getElementById('backToCalendarFromHolidaysBtn');
    this.holidaysList = document.getElementById('holidaysList');

    // Birthday Screen elements
    this.birthdayReminderBtn = document.getElementById('birthdayReminderBtn');
    this.birthdayScreen = document.getElementById('birthdayScreen');
    this.backToCalendarFromBirthdaysBtn = document.getElementById('backToCalendarFromBirthdaysBtn');
    this.birthdayNameInput = document.getElementById('birthdayNameInput');
    this.birthdayDateInput = document.getElementById('birthdayDateInput');
    this.birthdayRelationSelect = document.getElementById('birthdayRelationSelect');
    this.addBirthdayBtn = document.getElementById('addBirthdayBtn');
    this.birthdaysListContainer = document.getElementById('birthdaysListContainer');

    // Settings Screen elements
    this.settingsBtn = document.getElementById('settingsBtn');
    this.settingsScreen = document.getElementById('settingsScreen');
    this.backToCalendarFromSettingsBtn = document.getElementById('backToCalendarFromSettingsBtn');
    this.dailyReminderToggle = document.getElementById('dailyReminderToggle');
    this.appThemeBtn = document.getElementById('appThemeBtn');
    this.shareAppBtn = document.getElementById('shareAppBtn');
    this.privacyPolicyBtn = document.getElementById('privacyPolicyBtn');
    this.aboutBtn = document.getElementById('aboutBtn');

    // About Screen elements
    this.aboutScreen = document.getElementById('aboutScreen');
    this.backToSettingsFromAboutBtn = document.getElementById('backToSettingsFromAboutBtn');

    // My Profile Screen elements
    this.myProfileBtn = document.getElementById('myProfileBtn');
    this.profileScreen = document.getElementById('profileScreen');
    this.backToCalendarFromProfileBtn = document.getElementById('backToCalendarFromProfileBtn');
    this.profileNameInput = document.getElementById('profileNameInput');
    this.profileEmailInput = document.getElementById('profileEmailInput');
    this.profileInitial = document.getElementById('profileInitial');
    this.saveProfileBtn = document.getElementById('saveProfileBtn');
    this.closeProfileBtn = document.getElementById('closeProfileBtn');

    // Calendar Activities Screen elements
    this.calendarActivitiesBtn = document.getElementById('calendarActivitiesBtn');
    this.calendarActivitiesScreen = document.getElementById('calendarActivitiesScreen');
    this.backToCalendarFromCalendarActivitiesBtn = document.getElementById('backToCalendarFromCalendarActivitiesBtn');
    this.newCalendarNameInput = document.getElementById('newCalendarNameInput');
    this.addCalendarBtn = document.getElementById('addCalendarBtn');
    this.calendarsList = document.getElementById('calendarsList');
    this.activeCalendarNameSpan = document.getElementById('activeCalendarNameSpan');

    // Top bar title element
    this.topBarTitle = document.querySelector('.top-bar .title');

    // Theme Modal Elements
    this.themeModal = document.getElementById('themeModal');
    this.closeThemeModal = document.getElementById('closeThemeModal');
    this.lightThemeBtn = document.getElementById('lightThemeBtn');
    this.darkThemeBtn = document.getElementById('darkThemeBtn');

    // Monthly Summary Modal Elements - NEW
    this.monthlySummaryModalOverlay = document.getElementById('monthlySummaryModalOverlay');
    this.monthSummaryContent = document.getElementById('monthSummaryContent');
    this.closeMonthSummaryModal = document.getElementById('closeMonthSummaryModal');
    this.closeMonthSummaryModalBottom = document.getElementById('closeMonthSummaryModalBottom');

    // Load data from localStorage or set initial values
    this.calendars = JSON.parse(localStorage.getItem("calendars")) || { "Default": {} };
    this.activeCalendar = localStorage.getItem("activeCalendar") || "Default";
    this.birthdays = JSON.parse(localStorage.getItem("birthdays")) || [];
    this.settings = JSON.parse(localStorage.getItem("settings")) || { dailyReminder: false, theme: 'light' }; // Add theme setting
    this.userProfile = JSON.parse(localStorage.getItem("userProfile")) || { name: "", email: "" };
    this.holidays = []; // Will load from JSON

    // Initialize the calendar and event listeners
    this.init();
  }

  async init() {
    // Load holidays from external JSON file
    await this.loadHolidays();

    // Apply saved theme first
    this.applyTheme(this.settings.theme);

    // Render the calendar
    this.setupCalendar();
    this.renderHolidays(); // Render holidays on initialization

    // Add event listeners for all status buttons
    document.querySelectorAll('.btn-action[data-status]').forEach(button => {
      button.addEventListener('click', (event) => {
        const status = event.currentTarget.dataset.status;
        // Only apply status if it's not the shift button
        if (status !== 'shift') {
          this.applyStatusToSelectedDays(status);
        }
      });
    });

    this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
    this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));

    this.clearDayBtn.addEventListener('click', () => this.clearSelectedDays());
    this.noteBtn.addEventListener('click', () => this.showDayDetails());
    this.overtimeBtn.addEventListener('click', () => this.showOvertimeModal());

    // Shift button and modal listeners
    this.shiftBtn.addEventListener('click', () => this.showShiftModal());
    this.closeShiftModal.addEventListener('click', () => this.hideShiftModal());
    this.cancelShift.addEventListener('click', () => this.hideShiftModal());
    this.shiftOptionButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const shiftType = event.currentTarget.dataset.shiftType;
            this.applyShiftToSelectedDays(shiftType);
        });
    });

    this.saveDayNoteBtn.addEventListener('click', () => this.saveDayNote());
    this.closeDayDetailsBtn.addEventListener('click', () => this.hideDayDetails());
    this.overlay.addEventListener('click', () => {
      this.hideDayDetails();
      this.hideOvertimeModal();
      this.hideShiftModal();
      this.hideThemeModal();
      this.hideMonthSummaryModal(); // NEW: Close month summary modal if overlay is clicked
      this.toggleMenu(); // Close side menu if overlay is clicked
    });

    this.overlayMenu.addEventListener('click', () => this.toggleMenu());


// Monthly Summary Modal Listeners - NEW
    if (this.monthSummaryBtn) {
        this.monthSummaryBtn.addEventListener('click', () => this.showMonthSummary());
    }
    if (this.closeMonthSummaryModal) {
        this.closeMonthSummaryModal.addEventListener('click', () => this.hideMonthSummaryModal());
    }
    if (this.closeMonthSummaryModalBottom) {
        this.closeMonthSummaryModalBottom.addEventListener('click', () => this.hideMonthSummaryModal());
    }


    this.closeOvertimeModal.addEventListener('click', () => this.hideOvertimeModal());
    this.cancelOvertime.addEventListener('click', () => this.hideOvertimeModal());
    this.saveOvertime.addEventListener('click', () => this.saveOvertimeHours());

    if (this.menuToggle) {
      this.menuToggle.addEventListener('click', () => this.toggleMenu());
    }

    // Event Listeners for Holiday Screen
    if (this.holidaysFestivalsBtn) {
        this.holidaysFestivalsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
            this.showScreen(this.holidayScreen);
        });
    }
    if (this.backToCalendarFromHolidaysBtn) {
        this.backToCalendarFromHolidaysBtn.addEventListener('click', () => this.hideScreen(this.holidayScreen));
    }

    // Event Listeners for Birthday Screen
    if (this.birthdayReminderBtn) {
        this.birthdayReminderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
            this.showScreen(this.birthdayScreen);
            this.renderBirthdays();
        });
    }
    if (this.backToCalendarFromBirthdaysBtn) {
        this.backToCalendarFromBirthdaysBtn.addEventListener('click', () => this.hideScreen(this.birthdayScreen));
    }
    if (this.addBirthdayBtn) {
        this.addBirthdayBtn.addEventListener('click', () => this.addBirthday());
    }

    // Event Listeners for Settings Screen
    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMenu();
        this.showScreen(this.settingsScreen);
        this.loadSettings();
      });
    }
    if (this.backToCalendarFromSettingsBtn) {
      this.backToCalendarFromSettingsBtn.addEventListener('click', () => this.hideScreen(this.settingsScreen));
    }
    if (this.dailyReminderToggle) {
      this.dailyReminderToggle.addEventListener('change', () => this.toggleDailyReminder());
    }
    // App Theme button listener
    if (this.appThemeBtn) {
      this.appThemeBtn.addEventListener('click', () => this.showThemeModal());
    }
    if (this.shareAppBtn) {
      this.shareAppBtn.addEventListener('click', () => {
        if (navigator.share) {
          navigator.share({
            title: 'Attendance Calendar App',
            text: 'Check out this awesome Attendance Calendar App!',
            url: window.location.href,
          }).then(() => console.log('Shared successfully'))
            .catch((error) => console.error('Error sharing:', error));
        } else {
          alert("Share functionality not supported on this device/browser.");
        }
      });
    }

    if (this.privacyPolicyBtn) {
      this.privacyPolicyBtn.addEventListener('click', () => alert("Privacy Policy will be displayed here."));
    }

    // About button listener
    if (this.aboutBtn) {
      this.aboutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showScreen(this.aboutScreen); // Show the new About screen
      });
    }

    // Back button for About screen
    if (this.backToSettingsFromAboutBtn) {
        this.backToSettingsFromAboutBtn.addEventListener('click', () => this.hideScreen(this.aboutScreen) || this.showScreen(this.settingsScreen)); // Go back to settings
    }

    // Event Listeners for My Profile Screen
    if (this.myProfileBtn) {
      this.myProfileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMenu();
        this.showScreen(this.profileScreen);
        this.loadProfile(); // Load data when opening the profile screen
      });
    }
    if (this.backToCalendarFromProfileBtn) {
      this.backToCalendarFromProfileBtn.addEventListener('click', () => this.hideScreen(this.profileScreen));
    }
    if (this.saveProfileBtn) {
      this.saveProfileBtn.addEventListener('click', () => this.saveProfile());
    }
    if (this.closeProfileBtn) {
      this.closeProfileBtn.addEventListener('click', () => this.hideScreen(this.profileScreen));
    }
    if (this.profileNameInput) {
        this.profileNameInput.addEventListener('input', () => this.updateProfileInitial());
    }

    // Event Listeners for Calendar Activities Screen
    if (this.calendarActivitiesBtn) {
        this.calendarActivitiesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
            this.showScreen(this.calendarActivitiesScreen);
            this.renderCalendarList();
        });
    }
    if (this.backToCalendarFromCalendarActivitiesBtn) {
        this.backToCalendarFromCalendarActivitiesBtn.addEventListener('click', () => this.hideScreen(this.calendarActivitiesScreen));
    }
    if (this.addCalendarBtn) {
        this.addCalendarBtn.addEventListener('click', () => this.addCalendar());
    }

    // Theme Modal Listeners
    if (this.closeThemeModal) {
        this.closeThemeModal.addEventListener('click', () => this.hideThemeModal());
    }
    if (this.lightThemeBtn) {
        this.lightThemeBtn.addEventListener('click', () => this.setTheme('light'));
    }
    if (this.darkThemeBtn) {
        this.darkThemeBtn.addEventListener('click', () => this.setTheme('dark'));
    }
  }



  setupCalendar() {
    if (!this.calendars[this.activeCalendar]) {
      this.calendars[this.activeCalendar] = {};
      this.activeCalendar = "Default"; // Fallback to Default if active calendar is deleted/missing
      this.saveData();
    }
    this.renderCalendar();
    this.updateTopBarTitle();
  }

  renderCalendar() {
    this.calendarGrid.innerHTML = '';
    this.monthYearDisplay.textContent = this.getFormattedMonthYear();

    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();

    const today = new Date();
    const isCurrentMonth = this.currentDate.getMonth() === today.getMonth() &&
                           this.currentDate.getFullYear() === today.getFullYear();

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'day empty-day';
      this.calendarGrid.appendChild(emptyCell);
    }

    // Populate calendar with days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'day';
      dayCell.textContent = day;
      dayCell.dataset.day = day;

      // Mark Sundays
      if ((firstDay + day - 1) % 7 === 0) {
        dayCell.classList.add('sunday');
      }

  // Mark current day
      if (isCurrentMonth && day === today.getDate()) {
        dayCell.classList.add('current-day');
      }

      // Apply status, overtime, note, and shift indicators
      const dayData = this.getDayData(day);
      if (dayData) {
        if (dayData.status) {
            dayCell.classList.add(dayData.status);
        }

        if (dayData.overtime) {
          const overtimeBadge = document.createElement('span');
          overtimeBadge.className = 'overtime-badge';
          overtimeBadge.textContent = dayData.overtime;
          dayCell.appendChild(overtimeBadge);
        }

        if (dayData.note) {
          const noteIndicator = document.createElement('span');
          noteIndicator.className = 'note-indicator';
          noteIndicator.innerHTML = '<i class="fas fa-pen"></i>';
          dayCell.appendChild(noteIndicator);
        }

        // Add Shift indicator
        if (dayData.shift) {
          const shiftIndicator = document.createElement('span');
          shiftIndicator.className = 'shift-indicator';
          shiftIndicator.textContent = dayData.shift;
          dayCell.appendChild(shiftIndicator);
        }
      }

      // Apply selected class if day is selected
      if (this.selectedDays.includes(day)) {
        dayCell.classList.add('selected');
      }

      // Add click listener to each day cell
      dayCell.addEventListener('click', (event) => this.toggleDaySelection(dayCell, day, event));
      this.calendarGrid.appendChild(dayCell);
    }
  }

  // Toggles selection of a day
  toggleDaySelection(dayCell, day, event) {
    // Prevent selection if any modal is active
    if (this.dayDetails.classList.contains('active') ||
        this.overtimeModal.classList.contains('active') ||
        this.shiftModal.classList.contains('active') ||
        this.themeModal.classList.contains('active') ||
        this.monthlySummaryModalOverlay.classList.contains('active')) { // NEW: Prevent if monthly summary modal is open
        return;
    }

    if (this.selectedDays.includes(day)) {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
      dayCell.classList.remove('selected');
    } else {
      this.selectedDays.push(day);
      dayCell.classList.add('selected');
    }

    this.selectedDays.sort((a, b) => a - b); // Keep selected days sorted

    this.selectedMonth = this.currentDate.getMonth();
    this.selectedYear = this.currentDate.getFullYear();

    // Hide modals if no days are selected
    if (this.selectedDays.length === 0) {
        this.hideDayDetails();
        this.hideOvertimeModal();
        this.hideShiftModal();
    }
  }


  // Gets data for a specific day from the active calendar
  getDayData(day) {
    const monthYearKey = `${this.currentDate.getMonth()}-${this.currentDate.getFullYear()}`;
    // Ensure active calendar and month key exist
    if (!this.calendars[this.activeCalendar]) {
      this.calendars[this.activeCalendar] = {};
    }
    if (!this.calendars[this.activeCalendar][monthYearKey]) {
        this.calendars[this.activeCalendar][monthYearKey] = {};
    }
    return this.calendars[this.activeCalendar][monthYearKey][day];
  }

  // Sets data for a specific day in the active calendar
  setDayData(day, data) {
    const monthYearKey = `${this.currentDate.getMonth()}-${this.currentDate.getFullYear()}`;
    // Ensure active calendar and month key exist
    if (!this.calendars[this.activeCalendar]) {
      this.calendars[this.activeCalendar] = {};
    }
    if (!this.calendars[this.activeCalendar][monthYearKey]) {
      this.calendars[this.activeCalendar][monthYearKey] = {};
    }

    const existingData = this.calendars[this.activeCalendar][monthYearKey][day] || {};
    const updatedData = { ...existingData, ...data };

    // Clean up data: remove empty/undefined values for status, overtime, note, and shift
    if (!updatedData.status && !updatedData.overtime && !updatedData.note && !updatedData.shift) {
        delete this.calendars[this.activeCalendar][monthYearKey][day];
    } else {
        // Filter out undefined/null/empty string values from updatedData
        for (const key in updatedData) {
            if (updatedData[key] === undefined || updatedData[key] === null || updatedData[key] === '') {
                delete updatedData[key];
            }
        }
        if (Object.keys(updatedData).length === 0) {
            delete this.calendars[this.activeCalendar][monthYearKey][day];
        } else {
            this.calendars[this.activeCalendar][monthYearKey][day] = updatedData;
        }
    }

    this.saveData();

    const dayCellElement = this.calendarGrid.querySelector(`.day[data-day="${day}"]`);
    if (dayCellElement && !dayCellElement.classList.contains('empty-day')) {
        dayCellElement.classList.add('updated');
        setTimeout(() => dayCellElement.classList.remove('updated'), 500);
    }
  }

  // Gets formatted month and year string
  getFormattedMonthYear() {
    return this.currentDate.toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });
  }

  // Saves all application data to localStorage
  saveData() {
    localStorage.setItem("calendars", JSON.stringify(this.calendars));
    localStorage.setItem("activeCalendar", this.activeCalendar);
    localStorage.setItem("birthdays", JSON.stringify(this.birthdays));
    localStorage.setItem("settings", JSON.stringify(this.settings));
    localStorage.setItem("userProfile", JSON.stringify(this.userProfile)); // Save profile data
  }


// Applies a given status to all selected days
  applyStatusToSelectedDays(status) {
    if (this.selectedDays.length === 0) {
      alert("कृपया कम से कम एक दिन चुनें!"); // Please select at least one day!
      return;
    }

    this.selectedDays.forEach(day => {
        const currentData = this.getDayData(day) || {};
        const newData = {
            status: status,
            overtime: currentData.overtime,
            note: currentData.note,
            shift: currentData.shift
        };
        this.setDayData(day, newData);
    });

    this.clearSelectionVisuals();
    this.selectedDays = [];
    this.renderCalendar();
  }


  // Clears status, overtime, notes, and shift for selected days
  clearSelectedDays() {
    if (this.selectedDays.length === 0) {
      alert("कृपया कम से कम एक दिन चुनें!"); // Please select at least one day!
      return;
    }

    this.selectedDays.forEach(day => {
        this.setDayData(day, {
            status: undefined,
            overtime: undefined,
            note: undefined,
            shift: undefined // Clear shift data
        });
    });
    this.clearSelectionVisuals();
    this.selectedDays = [];
    this.hideDayDetails();
    this.renderCalendar();
  }

  // Shows the overtime input modal
  showOvertimeModal() {
    if (this.selectedDays.length === 0) {
      alert("कृपया कम से कम एक दिन चुनें!"); // Please select at least one day!
      return;
    }

    const firstSelectedDay = this.selectedDays[0];
    const currentData = this.getDayData(firstSelectedDay) || {};
    this.overtimeInput.value = currentData.overtime || '';
    this.overtimeModal.classList.add('active');
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  }

// Hides the overtime input modal
  hideOvertimeModal() {
    this.overtimeModal.classList.remove('active');
    this.overlay.classList.remove('active');
    this.clearSelectionVisuals();
    this.selectedDays = [];
    this.renderCalendar();
    document.body.style.overflow = ''; // Restore body scroll
  }

  // Saves overtime hours for selected days
  saveOvertimeHours() {
    if (this.selectedDays.length === 0) {
      alert("कोई दिन नहीं चुना गया है।"); // No day selected.
      return;
    }

    const hours = parseFloat(this.overtimeInput.value);

    if (isNaN(hours) || hours < 0) {
      alert("कृपया घंटों की एक वैध संख्या (0 या अधिक) दर्ज करें"); // Please enter a valid number of hours (0 or more)
      return;
    }

    this.selectedDays.forEach(day => {
        const currentData = this.getDayData(day) || {};
        this.setDayData(day, {
            ...currentData,
            overtime: hours
        });
    });

    this.hideOvertimeModal();
  }

  // Shows the shift selection modal
  showShiftModal() {
      if (this.selectedDays.length === 0) {
          alert("कृपया कम से कम एक दिन चुनें!"); // Please select at least one day!
          return;
      }
      this.shiftModal.classList.add('active');
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent body scroll
  }

  // Hides the shift selection modal
  hideShiftModal() {
      this.shiftModal.classList.remove('active');
      this.overlay.classList.remove('active');
      this.clearSelectionVisuals(); // Clear selection after closing
      this.selectedDays = [];
      this.renderCalendar(); // Re-render to clear visual indicators
      document.body.style.overflow = ''; // Restore body scroll
  }

  // Applies a selected shift type to all selected days
  applyShiftToSelectedDays(shiftType) {
      if (this.selectedDays.length === 0) {
          alert("कोई दिन नहीं चुना गया है।"); // No day selected.
          return;
      }

      this.selectedDays.forEach(day => {
          const currentData = this.getDayData(day) || {};
          this.setDayData(day, {
              ...currentData,
              shift: shiftType // Save the shift type
          });
      });

      this.hideShiftModal(); // Hide modal and re-render calendar
  }

  // Shows the day details panel
  showDayDetails() {
    if (this.selectedDays.length === 0) {
      alert("कृपया कम से कम एक दिन चुनें!"); // Please select at least one day!
      return;
    }

    const firstSelectedDay = this.selectedDays[0];
    const dateStr = new Date(this.selectedYear, this.selectedMonth, firstSelectedDay).toLocaleDateString('hi-IN', {day: 'numeric', month: 'long', year: 'numeric'});

    if (this.selectedDays.length > 1) {
        this.dayDetailsTitle.textContent = `${firstSelectedDay} - ${this.selectedDays[this.selectedDays.length - 1]} (${this.selectedDays.length} दिन)`;
    } else {
        this.dayDetailsTitle.textContent = `विवरण: ${dateStr}`; // Details: [Date]
    }

    const dayData = this.getDayData(firstSelectedDay) || {};
    this.dayNote.value = dayData.note || '';

    this.dayDetails.classList.add('active');
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  }


  // Hides the day details panel
  hideDayDetails() {
    this.dayDetails.classList.remove('active');
    this.overlay.classList.remove('active');
    this.clearSelectionVisuals();
    this.selectedDays = [];
    this.renderCalendar();
    document.body.style.overflow = ''; // Restore body scroll
  }


  // Saves the note for selected days
  saveDayNote() {
    if (this.selectedDays.length === 0) {
        alert("कोई दिन नहीं चुना गया है।"); // No day selected.
        return;
    }

    const note = this.dayNote.value.trim();

    this.selectedDays.forEach(day => {
        const currentData = this.getDayData(day) || {};
        this.setDayData(day, {
            ...currentData,
            note: note || undefined // Set note to undefined if empty
        });
    });

    this.hideDayDetails();
  }

// Changes the displayed month
  changeMonth(offset) {
    this.currentDate.setMonth(this.currentDate.getMonth() + offset);
    this.selectedDays = [];
    this.hideDayDetails();
    this.hideOvertimeModal();
    this.hideShiftModal(); // Ensure shift modal is hidden on month change
    this.hideMonthSummaryModal(); // NEW: Hide month summary modal on month change
    this.renderCalendar();
    this.updateCurrentDayHighlight();
  }

  // Clears visual selection from all day cells
  clearSelectionVisuals() {
    document.querySelectorAll('.day').forEach(cell => {
      cell.classList.remove('selected');
    });
  }

  // Updates the highlight for the current day
  updateCurrentDayHighlight() {
    const previouslyHighlighted = document.querySelector('.day.current-day');
    if (previouslyHighlighted) {
      previouslyHighlighted.classList.remove('current-day');
    }

    const today = new Date();
    if (this.currentDate.getMonth() === today.getMonth() &&
        this.currentDate.getFullYear() === today.getFullYear()) {
      const currentDayCell = document.querySelector(`.calendar-grid .day[data-day="${today.getDate()}"]`);
      if (currentDayCell) {
        currentDayCell.classList.add('current-day');
      }
    }
  }

  // Shows a summary of attendance for the current month
  showMonthSummary() {
    const monthYearKey = `${this.currentDate.getMonth()}-${this.currentDate.getFullYear()}`;
    const data = this.calendars[this.activeCalendar]?.[monthYearKey] || {};
    let present = 0, absent = 0, holiday = 0, halfDay = 0, leave = 0, emergency = 0, sick = 0, shiftCount = 0, festival = 0, overtime = 0;

    Object.values(data).forEach(entry => {
      if (entry.status === 'present') present++;
      if (entry.status === 'absent') absent++;
      if (entry.status === 'holiday') holiday++;
      if (entry.status === 'half-day') halfDay++;
      if (entry.status === 'leave') leave++;
      if (entry.status === 'emergency') emergency++;
      if (entry.status === 'sick') sick++;
      if (entry.shift) shiftCount++;
      if (entry.status === 'festival') festival++;
      if (entry.overtime) overtime += parseFloat(entry.overtime);
    });

    const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
    const totalRecordedDays = present + absent + holiday + halfDay + leave + emergency + sick + festival;
    const attendanceRate = totalRecordedDays > 0 ? Math.round((present / totalRecordedDays) * 100) : 0;

    // Populate the modal content instead of an alert
    this.monthSummaryContent.innerHTML = `
        <p><i class="fas fa-calendar-alt"></i> **सारांश**: ${this.getFormattedMonthYear()}</p>
        <p><i class="fas fa-check-circle"></i> उपस्थित: ${present} दिन</p>
        <p><i class="fas fa-adjust"></i> आधा दिन: ${halfDay} दिन</p>
        <p><i class="fas fa-times-circle"></i> अनुपस्थित: ${absent} दिन</p>
        <p><i class="fas fa-plane"></i> छुट्टी: ${leave} दिन</p>
        <p><i class="fas fa-exclamation-triangle"></i> आपातकालीन: ${emergency} दिन</p>
        <p><i class="fas fa-medkit"></i> बीमार: ${sick} दिन</p>
        <p><i class="fas fa-sync-alt"></i> शिफ्ट: ${shiftCount} दिन</p>
        <p><i class="fas fa-fireworks"></i> त्योहार: ${festival} दिन</p>
        <p><i class="fas fa-umbrella-beach"></i> अवकाश: ${holiday} दिन</p>
        <p><i class="fas fa-hourglass-half"></i> ओवरटाइम: ${overtime.toFixed(1)} घंटे</p>
        <p class="summary-attendance-rate"><i class="fas fa-chart-line"></i> उपस्थिति दर: ${attendanceRate}%</p>
    `;

    // Show the modal
    this.monthlySummaryModalOverlay.classList.add('active');
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent body scroll
  }

  // Hides the monthly summary modal
  hideMonthSummaryModal() {
    this.monthlySummaryModalOverlay.classList.remove('active');
    this.overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore body scroll
  }

  // Toggles the side menu visibility
  toggleMenu() {
    if (this.sideMenu && this.overlayMenu) {
      this.sideMenu.classList.toggle('active');
      this.overlayMenu.classList.toggle('active');
      document.body.style.overflow = this.sideMenu.classList.contains('active') ? 'hidden' : '';
    }
  }

  // Helper function to show a specific screen
  showScreen(screenElement) {
    // Hide all major screens first
    this.appContainer.style.display = 'none';
    this.holidayScreen.classList.remove('active');
    this.birthdayScreen.classList.remove('active');
    this.settingsScreen.classList.remove('active');
    this.profileScreen.classList.remove('active');
    this.calendarActivitiesScreen.classList.remove('active');
    this.aboutScreen.classList.remove('active');
    this.themeModal.classList.remove('active');

    // Then show the requested screen
    screenElement.classList.add('active');

    // Ensure any modals are hidden
    this.hideDayDetails();
    this.hideOvertimeModal();
    this.hideShiftModal();
    this.hideMonthSummaryModal(); // NEW: Hide monthly summary modal when another screen is shown
    document.body.style.overflow = 'hidden'; // Prevent body scroll when a screen is active
  }

  // Helper function to hide a specific screen and show main calendar
  hideScreen(screenElement) {
    screenElement.classList.remove('active');
    // Determine if we should go back to the main calendar or settings screen
    if (screenElement === this.aboutScreen) {
      // If hiding about screen, go back to settings
      this.showScreen(this.settingsScreen);
    } else {
      // Otherwise, go back to the main app container (calendar)
      this.appContainer.style.display = 'flex'; // Show calendar and action buttons
      document.body.style.overflow = ''; // Restore body scroll
    }
  }

  // Holiday Screen Functions
  async loadHolidays() {
    try {
      const response = await fetch('holidays.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.holidays = await response.json();
      console.log('Holidays loaded:', this.holidays);
    } catch (error) {
      console.error('Could not load holidays:', error);
      // Fallback to empty array or a default set if fetch fails
      this.holidays = [];
    }
  }

  renderHolidays() {
    this.holidaysList.innerHTML = '';
    if (this.holidays.length === 0) {
      const noHolidaysMessage = document.createElement('p');
      noHolidaysMessage.textContent = "कोई छुट्टी नहीं मिली।"; // No holidays found.
      noHolidaysMessage.style.textAlign = 'center';
      noHolidaysMessage.style.color = '#777';
      noHolidaysMessage.style.padding = '20px';
      this.holidaysList.appendChild(noHolidaysMessage);
      return;
    }

    this.holidays.forEach(holiday => {
      const holidayItem = document.createElement('div');
      holidayItem.className = 'holiday-item';
      holidayItem.innerHTML = `
        <span class="holiday-name">${holiday.name}</span>
        <span class="holiday-date">${holiday.date}</span>
      `;
      this.holidaysList.appendChild(holidayItem);
    });
  }


  // Birthday Reminder Functions
  addBirthday() {
    const name = this.birthdayNameInput.value.trim();
    const date = this.birthdayDateInput.value;
    const relation = this.birthdayRelationSelect.value;

    if (!name || !date) {
      alert("कृपया नाम और जन्मदिन की तारीख दर्ज करें।"); // Please enter name and birthday date.
      return;
    }

    const newBirthday = {
      id: Date.now(),
      name: name,
      date: date,
      relation: relation || 'कोई नहीं' // None
    };

    this.birthdays.push(newBirthday);
    this.saveData();
    this.renderBirthdays();

    // Clear form
    this.birthdayNameInput.value = '';
    this.birthdayDateInput.value = '';
    this.birthdayRelationSelect.value = '';
    alert("जन्मदिन सफलतापूर्वक जोड़ा गया!"); // Birthday added successfully!
  }

  renderBirthdays() {
    this.birthdaysListContainer.innerHTML = '';

  if (this.birthdays.length === 0) {
        const noBirthdaysMessage = document.createElement('p');
        noBirthdaysMessage.textContent = "अभी तक कोई जन्मदिन जोड़ा नहीं गया है। ऊपर दिए गए फ़ॉर्म का उपयोग करके जोड़ें।"; // No birthdays added yet. Use the form above to add.
        noBirthdaysMessage.style.textAlign = 'center';
        noBirthdaysMessage.style.color = '#777';
        noBirthdaysMessage.style.padding = '20px';
        this.birthdaysListContainer.appendChild(noBirthdaysMessage);
        return;
    }

    this.birthdays.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getMonth() !== dateB.getMonth()) {
            return dateA.getMonth() - dateB.getMonth();
        }
        return dateA.getDate() - dateB.getDate();
    });

    this.birthdays.forEach(bday => {
      const bdayItem = document.createElement('div');
      bdayItem.className = 'birthday-list-item';
      bdayItem.dataset.id = bday.id;

      const formattedDate = new Date(bday.date).toLocaleDateString('hi-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      bdayItem.innerHTML = `
        <strong>${bday.name}</strong>
        <span><i class="fas fa-gift"></i> जन्मदिन: ${formattedDate}</span>
        <span><i class="fas fa-user-friends"></i> संबंध: ${bday.relation}</span>
        <button class="delete-birthday-btn" aria-label="जन्मदिन हटाएँ">
            <i class="fas fa-trash-alt"></i>
        </button>
      `;

      const deleteBtn = bdayItem.querySelector('.delete-birthday-btn');
      deleteBtn.addEventListener('click', () => this.deleteBirthday(bday.id));

      this.birthdaysListContainer.appendChild(bdayItem);
    });
  }

  deleteBirthday(idToDelete) {
    if (confirm("क्या आप इस जन्मदिन को हटाना चाहते हैं?")) { // Do you want to delete this birthday?
      this.birthdays = this.birthdays.filter(bday => bday.id !== idToDelete);
      this.saveData();
      this.renderBirthdays();
      alert("जन्मदिन सफलतापूर्वक हटाया गया।"); // Birthday deleted successfully.
    }
  }

  // Settings Functions
  loadSettings() {
    this.dailyReminderToggle.checked = this.settings.dailyReminder;
    // Update theme buttons' active state
    this.lightThemeBtn.classList.toggle('active-theme', this.settings.theme === 'light');
    this.darkThemeBtn.classList.toggle('active-theme', this.settings.theme === 'dark');
  }

  toggleDailyReminder() {
    this.settings.dailyReminder = this.dailyReminderToggle.checked;
    this.saveData();
    alert(`दैनिक अनुस्मारक: ${this.settings.dailyReminder ? 'चालू' : 'बंद'}`); // Daily Reminder: On/Off
  }

  // Theme Functions
  showThemeModal() {
    this.themeModal.classList.add('active');
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.loadSettings(); // Update theme buttons' active state
  }

  hideThemeModal() {
    this.themeModal.classList.remove('active');
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  applyTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    this.settings.theme = theme;
    this.saveData();
    this.loadSettings(); // Update buttons immediately
  }

  setTheme(theme) {
    this.applyTheme(theme);
    this.hideThemeModal();
    alert(`थीम सफलतापूर्वक "${theme === 'light' ? 'लाइट' : 'डार्क'}" पर सेट की गई।`); // Theme successfully set to "Light/Dark".
  }

  // My Profile Functions
  loadProfile() {
    this.profileNameInput.value = this.userProfile.name;
    this.profileEmailInput.value = this.userProfile.email;
    this.updateProfileInitial();
  }


  updateProfileInitial() {
    const name = this.profileNameInput.value.trim();
    this.profileInitial.textContent = name.charAt(0).toUpperCase() || 'U';
  }

  saveProfile() {
    this.userProfile.name = this.profileNameInput.value.trim();
    this.userProfile.email = this.profileEmailInput.value.trim();
    this.saveData();
    this.updateProfileInitial(); // Update the icon immediately
    alert("प्रोफ़ाइल जानकारी सहेजी गई!"); // Profile information saved!
  }

  // Calendar Activities Functions
  updateTopBarTitle() {
    // This method is modified to only show "Attendance Calendar"
    if (this.topBarTitle) {
        this.topBarTitle.textContent = `उपस्थिति कैलेंडर`; // Attendance Calendar
    }
  }

  renderCalendarList() {
    this.calendarsList.innerHTML = '';
    this.activeCalendarNameSpan.textContent = this.activeCalendar;

    const calendarNames = Object.keys(this.calendars);

    if (calendarNames.length === 0) {
        const noCalendarsMessage = document.createElement('p');
        noCalendarsMessage.textContent = "कोई कैलेंडर नहीं मिला। नया जोड़ने के लिए ऊपर दिए गए फ़ॉर्म का उपयोग करें।"; // No calendar found. Use the form above to add a new one.
        noCalendarsMessage.style.textAlign = 'center';
        noCalendarsMessage.style.color = '#777';
        noCalendarsMessage.style.padding = '20px';
        this.calendarsList.appendChild(noCalendarsMessage);
        return;
    }

    calendarNames.forEach(name => {
        const listItem = document.createElement('div');
        listItem.className = 'calendar-list-item';
        if (name === this.activeCalendar) {
            listItem.classList.add('active-calendar');
        }

        listItem.innerHTML = `
            <span class="calendar-name">
                <i class="fas fa-calendar"></i> ${name}
            </span>
            <div class="calendar-actions">
                <button class="btn-switch" data-calendar-name="${name}" title="इस कैलेंडर पर स्विच करें">
                    <i class="fas fa-toggle-on"></i>
                </button>
                <button class="btn-edit" data-calendar-name="${name}" title="कैलेंडर का नाम संपादित करें">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" data-calendar-name="${name}" title="इस कैलेंडर को हटाएँ">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;

        listItem.querySelector('.btn-switch').addEventListener('click', (e) => {
            const calName = e.currentTarget.dataset.calendarName;
            if (calName !== this.activeCalendar) {
                this.switchCalendar(calName);
            }
        });
        listItem.querySelector('.btn-edit').addEventListener('click', (e) => {
            const oldName = e.currentTarget.dataset.calendarName;
            this.promptEditCalendar(oldName);
        });
        listItem.querySelector('.btn-delete').addEventListener('click', (e) => {
            const calName = e.currentTarget.dataset.calendarName;
            this.deleteCalendar(calName);
        });

        this.calendarsList.appendChild(listItem);
    });
  }


  addCalendar() {
    const newName = this.newCalendarNameInput.value.trim();
    if (!newName) {
        alert("कृपया एक वैध कैलेंडर नाम दर्ज करें।"); // Please enter a valid calendar name.
        return;
    }
    if (this.calendars[newName]) {
        alert(`"${newName}" नाम का कैलेंडर पहले से मौजूद है।`); // A calendar with the name "${newName}" already exists.
        return;
    }

    this.calendars[newName] = {};
    this.saveData();
    this.newCalendarNameInput.value = '';
    alert(`कैलेंडर "${newName}" सफलतापूर्वक जोड़ा गया।`); // Calendar "${newName}" successfully added.
    this.renderCalendarList();
  }

  switchCalendar(nameToSwitch) {
    if (!this.calendars[nameToSwitch]) {
        alert("कैलेंडर नहीं मिला।"); // Calendar not found.
        return;
    }
    if (this.activeCalendar === nameToSwitch) {
        alert("यह कैलेंडर पहले से ही सक्रिय है।"); // This calendar is already active.
        return;
    }

    this.activeCalendar = nameToSwitch;
    this.saveData();
    alert(`कैलेंडर "${nameToSwitch}" अब सक्रिय है।`); // Calendar "${nameToSwitch}" is now active.
    this.renderCalendarList(); // Update the list display
    this.renderCalendar(); // Re-render the main calendar view
    this.updateTopBarTitle(); // Update the title bar
    this.hideScreen(this.calendarActivitiesScreen); // Go back to calendar view
  }

  promptEditCalendar(oldName) {
    const newName = prompt(`"${oldName}" के लिए नया नाम दर्ज करें:`, oldName); // Enter new name for "${oldName}":
    if (newName === null || newName.trim() === '' || newName.trim() === oldName) {
        return; // User cancelled or entered same/empty name
    }
    const trimmedNewName = newName.trim();

    if (this.calendars[trimmedNewName] && trimmedNewName !== oldName) {
        alert(`"${trimmedNewName}" नाम का कैलेंडर पहले से मौजूद है।`); // A calendar with the name "${trimmedNewName}" already exists.
        return;
    }

    // Create a copy of the old calendar's data
    const oldCalendarData = this.calendars[oldName];
    // Delete the old entry
    delete this.calendars[oldName];
    // Add new entry with new name and old data
    this.calendars[trimmedNewName] = oldCalendarData;

    // If the edited calendar was active, update activeCalendar
    if (this.activeCalendar === oldName) {
        this.activeCalendar = trimmedNewName;
    }

    this.saveData();
    alert(`कैलेंडर का नाम "${oldName}" से बदलकर "${trimmedNewName}" कर दिया गया।`); // Calendar name changed from "${oldName}" to "${trimmedNewName}".
    this.renderCalendarList();
    this.updateTopBarTitle(); // Update the top bar title in case active calendar was renamed
  }

  deleteCalendar(nameToDelete) {
    if (Object.keys(this.calendars).length <= 1) {
        alert("आप एकमात्र कैलेंडर को हटा नहीं सकते। कम से कम एक कैलेंडर आवश्यक है।"); // You cannot delete the only calendar. At least one calendar is required.
        return;
    }
    if (nameToDelete === this.activeCalendar) {
        alert("आप सक्रिय कैलेंडर को हटा नहीं सकते। कृपया हटाने से पहले किसी अन्य कैलेंडर पर स्विच करें।"); // You cannot delete the active calendar. Please switch to another calendar before deleting.
        return;
    }

    if (confirm(`क्या आप वाकई कैलेंडर "${nameToDelete}" और इसके सभी डेटा को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।`)) { // Are you sure you want to delete calendar "${nameToDelete}" and all its data? This action cannot be undone.
        delete this.calendars[nameToDelete];
        this.saveData();
        alert(`कैलेंडर "${nameToDelete}" सफलतापूर्वक हटाया गया।`); // Calendar "${nameToDelete}" successfully deleted.
        this.renderCalendarList();
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const calendar = new AttendanceCalendar();

  // Demo data generation
  setTimeout(() => {
    const today = new Date().getDate();

    // Add some initial demo data if localStorage is empty for the 'Default' calendar
    // Ensure 'Default' exists before trying to add data
    if (!calendar.calendars['Default'] || Object.keys(calendar.calendars['Default']).length === 0) {
        calendar.activeCalendar = "Default"; // Temporarily ensure Default is active for demo data population
        calendar.setDayData(15, {status: 'present', note: 'टीम मीटिंग सुबह 10 बजे'}); // Team meeting at 10 AM
        calendar.setDayData(20, {status: 'holiday', note: 'राष्ट्रीय अवकाश'}); // National holiday
        calendar.setDayData(25, {status: 'absent', overtime: 2.5});
        calendar.setDayData(10, {status: 'present', overtime: 1.0, note: 'Client meeting till late'});
        calendar.setDayData(5, {status: 'holiday', overtime: 3.0});
        calendar.setDayData(3, {status: 'half-day', note: 'आधे दिन की छुट्टी'}); // Half day leave
        calendar.setDayData(7, {status: 'leave', note: 'पर्सनल लीव पर'}); // On personal leave
        calendar.setDayData(8, {status: 'emergency', note: 'आपातकालीन कार्य'}); // Emergency work
        calendar.setDayData(12, {status: 'sick', note: 'बीमार छुट्टी'}); // Sick leave
        calendar.setDayData(18, {status: 'shift', note: 'नाइट शिफ्ट', shift: 'N'}); // Night shift with N indicator
        calendar.setDayData(22, {status: 'festival', note: 'परिवार के साथ छुट्टियां'}); // Using festival for demo
    }

    // Add demo profile data if localStorage is empty
    if (!localStorage.getItem("userProfile") || !JSON.parse(localStorage.getItem("userProfile")).name) {
        calendar.userProfile.name = "उपयोगकर्ता"; // User
        calendar.userProfile.email = "user@example.com";
        calendar.saveData();
    }

    // Set 'Default' as active calendar if somehow it's not set
    if (!calendar.activeCalendar || !calendar.calendars[calendar.activeCalendar]) {
        calendar.activeCalendar = "Default";
        calendar.saveData();
    }

    const todayCell = document.querySelector(`.calendar-grid .day[data-day="${today}"]`);
    if (todayCell) {
      calendar.toggleDaySelection(todayCell, today);
    } else {
        console.warn("Could not find today's cell to apply demo data.");
        calendar.renderCalendar();
    }
    calendar.updateProfileInitial(); // Ensure profile initial is set on load
    calendar.updateTopBarTitle(); // Ensure top bar title is set on initial load
  }, 500);
});

