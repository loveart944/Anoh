class AttendanceCalendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDays = [];
    this.selectedMonth = this.currentDate.getMonth();
    this.selectedYear = this.currentDate.getFullYear();

    // Initialize calendars from localStorage, ensure 'Default' exists
    this.calendars = JSON.parse(localStorage.getItem("calendars")) || {};
    if (!this.calendars['Default']) {
      this.calendars['Default'] = {};
    }
    this.activeCalendar = localStorage.getItem("activeCalendar") || "Default";
    // Ensure activeCalendar is valid, if not, set to Default
    if (!this.calendars[this.activeCalendar]) {
        this.activeCalendar = "Default";
    }

    // Initialize birthdays from localStorage
    this.birthdays = JSON.parse(localStorage.getItem("birthdays")) || [];

    // Initialize user profile from localStorage
    this.userProfile = JSON.parse(localStorage.getItem("userProfile")) || {
        name: '',
        email: '',
        profileImage: 'https://placehold.co/120x120/4361ee/ffffff?text=Profile' // Default placeholder image
    };

    // Initialize settings from localStorage
    this.settings = JSON.parse(localStorage.getItem("settings")) || {
        dailyReminder: false
    };

    // Initialize holidays data (will be loaded from JSON)
    this.holidays = [];

    this.initElements();
    this.initEventListeners();
    this.renderCalendar();
    this.updateCurrentDayHighlight();
    this.renderCalendarsList(); // Render calendar list on load if page is ever opened
    this.renderBirthdaysList(); // Render birthdays list on load
    this.loadProfileData(); // Load profile data on init
    this.loadSettings(); // Load settings on init
    this.loadHolidays(); // Load holidays on init
  }

  initElements() {
    this.menuToggle = document.getElementById('menuToggle');
    this.sideMenu = document.getElementById('sideMenu');
    this.overlayMenu = document.getElementById('overlayMenu');
    this.monthYearDisplay = document.getElementById('monthYearDisplay');
    this.calendarGrid = document.getElementById('calendarGrid');
    this.prevMonthBtn = document.getElementById('prevMonthBtn');
    this.nextMonthBtn = document.getElementById('nextMonthBtn');

    this.dayDetails = document.getElementById('dayDetails');
    this.dayDetailsTitle = document.getElementById('dayDetailsTitle');
    this.dayNote = document.getElementById('dayNote');
    this.saveNoteBtn = document.getElementById('saveNoteBtn');
    this.closeDayDetails = document.getElementById('closeDayDetails');

    this.statusButtons = document.querySelectorAll('[data-status]');
    this.clearDayBtn = document.getElementById('clearDayBtn');
    this.overtimeBtn = document.getElementById('overtimeBtn');
    this.noteBtn = document.getElementById('noteBtn');
    this.monthSummaryBtn = document.getElementById('monthSummaryBtn');

    this.overtimeModal = document.getElementById('overtimeModal');
    this.overtimeInput = document.getElementById('overtimeInput');
    this.closeOvertimeModal = document.getElementById('closeOvertimeModal');
    this.cancelOvertime = document.getElementById('cancelOvertime');
    this.saveOvertime = document.getElementById('saveOvertime');

    this.summaryModal = document.getElementById('summaryModal');
    this.summaryModalTitle = document.getElementById('summaryModalTitle');
    this.summaryContent = document.getElementById('summaryContent');
    this.closeSummaryModal = document.getElementById('closeSummaryModal');
    this.okSummaryModal = document.getElementById('okSummaryModal');

    this.commonOverlay = document.getElementById('commonOverlay');

    // Shift elements
    this.shiftBtn = document.getElementById('shiftBtn');
    this.shiftModal = document.getElementById('shiftModal');
    this.closeShiftModal = document.getElementById('closeShiftModal');
    this.shiftOptionButtons = document.querySelectorAll('.btn-shift-option');
    this.cancelShift = document.getElementById('cancelShift');

    // Calendar Activities Page Elements
    this.calendarActivitiesBtn = document.getElementById('calendarActivitiesBtn');
    this.calendarActivitiesPage = document.getElementById('calendarActivitiesPage');
    this.backToMainBtn = document.getElementById('backToMainBtn');
    this.newCalendarInput = document.getElementById('newCalendarInput');
    this.addCalendarBtn = document.getElementById('addCalendarBtn');
    this.calendarsList = document.getElementById('calendarsList');
    this.activeCalendarNameDisplay = document.getElementById('activeCalendarNameDisplay');

    // Birthday Reminder Page Elements
    this.birthdayReminderBtn = document.getElementById('birthdayReminderBtn');
    this.birthdayReminderPage = document.getElementById('birthdayReminderPage');
    this.backToMainFromBirthdayBtn = document.getElementById('backToMainFromBirthdayBtn');
    this.birthdayNameInput = document.getElementById('birthdayNameInput');
    this.birthdayDateInput = document.getElementById('birthdayDateInput');
    this.birthdayRelationSelect = document.getElementById('birthdayRelationSelect');
    this.addBirthdayBtn = document.getElementById('addBirthdayBtn');
    this.birthdaysList = document.getElementById('birthdaysList');

    // My Profile Page Elements
    this.myProfileBtn = document.getElementById('myProfileBtn');
    this.myProfilePage = document.getElementById('myProfilePage');
    this.backToMainFromProfileBtn = document.getElementById('backToMainFromProfileBtn');
    this.profileImage = document.getElementById('profileImage');
    this.profileImageInput = document.getElementById('profileImageInput');
    this.uploadPhotoButton = document.getElementById('uploadPhotoButton');
    this.removePhotoButton = document.getElementById('removePhotoButton');
    this.profileNameInput = document.getElementById('profileNameInput');
    this.profileEmailInput = document.getElementById('profileEmailInput');
    this.saveProfileBtn = document.getElementById('saveProfileBtn');
    this.closeProfileBtn = document.getElementById('closeProfileBtn');

    // Settings Page Elements
    this.settingsBtn = document.getElementById('settingsBtn');
    this.settingsPage = document.getElementById('settingsPage');
    this.backToMainFromSettingsBtn = document.getElementById('backToMainFromSettingsBtn');
    this.dailyReminderToggle = document.getElementById('dailyReminderToggle');
    this.appThemeSetting = document.getElementById('appThemeSetting');
    this.shareAppSetting = document.getElementById('shareAppSetting');
    this.rateAppSetting = document.getElementById('rateAppSetting');
    this.privacyPolicySetting = document.getElementById('privacyPolicySetting');
    this.aboutSetting = document.getElementById('aboutSetting');

    // NEW: Holiday / Festival Page Elements
    this.holidayFestivalBtn = document.getElementById('holidayFestivalBtn');
    this.holidayFestivalPage = document.getElementById('holidayFestivalPage');
    this.backToMainFromHolidayBtn = document.getElementById('backToMainFromHolidayBtn');
    this.holidaysList = document.getElementById('holidaysList');
    this.holidayPageTitle = document.getElementById('holidayPageTitle');
  }

  initEventListeners() {
    this.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
    this.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));

    this.statusButtons.forEach(btn => {
      btn.addEventListener('click', () => this.applyStatusToSelectedDays(btn.dataset.status));
    });
    this.clearDayBtn.addEventListener('click', () => this.clearSelectedDays());
    this.overtimeBtn.addEventListener('click', () => this.showOvertimeModal());
    this.noteBtn.addEventListener('click', () => this.showDayDetails());
    this.saveNoteBtn.addEventListener('click', () => this.saveDayNote());
    this.closeDayDetails.addEventListener('click', () => this.hideModal(this.dayDetails));

    // Common overlay now hides all modals and the activities page
    this.commonOverlay.addEventListener('click', () => this.hideAllModals());

    this.overlayMenu.addEventListener('click', () => this.toggleMenu());

    this.monthSummaryBtn.addEventListener('click', () => this.showMonthSummary());

    this.closeOvertimeModal.addEventListener('click', () => this.hideModal(this.overtimeModal));
    this.cancelOvertime.addEventListener('click', () => this.hideModal(this.overtimeModal));
    this.saveOvertime.addEventListener('click', () => this.saveOvertimeHours());

    this.closeSummaryModal.addEventListener('click', () => this.hideModal(this.summaryModal));
    this.okSummaryModal.addEventListener('click', () => this.hideModal(this.summaryModal));

    if (this.menuToggle) {
      this.menuToggle.addEventListener('click', () => this.toggleMenu());
    }

    // Shift Event Listeners
    this.shiftBtn.addEventListener('click', () => this.showShiftModal());
    this.closeShiftModal.addEventListener('click', () => this.hideModal(this.shiftModal));
    this.cancelShift.addEventListener('click', () => this.hideModal(this.shiftModal));
    this.shiftOptionButtons.forEach(btn => {
      btn.addEventListener('click', () => this.applyShiftToSelectedDays(btn.dataset.shift));
    });

    // Calendar Activities Event Listeners
    this.calendarActivitiesBtn.addEventListener('click', (event) => { // Added event parameter
        event.preventDefault(); // Prevent default anchor behavior
        this.showCalendarActivitiesPage();
    });
    this.backToMainBtn.addEventListener('click', () => this.hideCalendarActivitiesPage());
    this.addCalendarBtn.addEventListener('click', () => this.addNewCalendar());

    // Delegated event listener for calendar list items (activate, edit, delete)
    this.calendarsList.addEventListener('click', (event) => {
        const target = event.target;
        const calendarItem = target.closest('.calendar-item');
        if (!calendarItem) return;

        const calendarName = calendarItem.dataset.calendarName;

        if (target.classList.contains('slider') || target.type === 'checkbox') {
            // This handles the toggle switch click
            this.activateCalendar(calendarName);
        } else if (target.closest('.edit-btn')) {
            this.editCalendar(calendarName);
        } else if (target.closest('.delete-btn')) {
            this.deleteCalendar(calendarName);
        }
    });


    // Birthday Reminder Event Listeners
    this.birthdayReminderBtn.addEventListener('click', (event) => { // Added event parameter
        event.preventDefault(); // Prevent default anchor behavior
        this.showBirthdayReminderPage();
    });
    this.backToMainFromBirthdayBtn.addEventListener('click', () => this.hideBirthdayReminderPage());
    this.addBirthdayBtn.addEventListener('click', () => this.addBirthday());

    // Delegated event listener for deleting birthdays
    this.birthdaysList.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.delete-birthday-btn');
        if (deleteButton) {
            const index = parseInt(deleteButton.dataset.index);
            this.deleteBirthday(index);
        }
    });

    // My Profile Event Listeners
    this.myProfileBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default anchor behavior
        this.showMyProfilePage();
    });
    this.backToMainFromProfileBtn.addEventListener('click', () => this.hideMyProfilePage());
    this.uploadPhotoButton.addEventListener('click', () => this.profileImageInput.click());
    this.profileImageInput.addEventListener('change', (event) => this.handleProfileImageUpload(event));
    this.removePhotoButton.addEventListener('click', () => this.removeProfileImage());
    this.saveProfileBtn.addEventListener('click', () => this.saveProfileData());
    this.closeProfileBtn.addEventListener('click', () => this.hideMyProfilePage());

    // Settings Page Event Listeners
    this.settingsBtn.addEventListener('click', (event) => {
        event.preventDefault();
        this.showSettingsPage();
    });
    this.backToMainFromSettingsBtn.addEventListener('click', () => this.hideSettingsPage());
    this.dailyReminderToggle.addEventListener('change', (event) => this.toggleDailyReminder(event.target.checked));
    this.appThemeSetting.addEventListener('click', () => this.showCustomAlert("ऐप थीम सेटिंग अभी उपलब्ध नहीं है।"));
    this.shareAppSetting.addEventListener('click', () => this.showCustomAlert("ऐप साझा करने की कार्यक्षमता अभी उपलब्ध नहीं है।"));
    this.rateAppSetting.addEventListener('click', () => this.showCustomAlert("ऐप को रेट करने की कार्यक्षमता अभी उपलब्ध नहीं है।"));
    this.privacyPolicySetting.addEventListener('click', () => this.showCustomAlert("गोपनीयता नीति अभी उपलब्ध नहीं है।"));
    this.aboutSetting.addEventListener('click', () => this.showCustomAlert("हमारे बारे में जानकारी अभी उपलब्ध नहीं है।"));

    // NEW: Holiday / Festival Event Listeners
    this.holidayFestivalBtn.addEventListener('click', (event) => {
        event.preventDefault();
        this.showHolidayFestivalPage();
    });
    this.backToMainFromHolidayBtn.addEventListener('click', () => this.hideHolidayFestivalPage());
  }


  // Helper to get the currently active page element
  getActivePageElement() {
    if (this.calendarActivitiesPage.classList.contains('active')) return this.calendarActivitiesPage;
    if (this.birthdayReminderPage.classList.contains('active')) return this.birthdayReminderPage;
    if (this.myProfilePage.classList.contains('active')) return this.myProfilePage;
    if (this.settingsPage.classList.contains('active')) return this.settingsPage;
    if (this.holidayFestivalPage.classList.contains('active')) return this.holidayFestivalPage; // NEW: Holiday page
    return null; // If no specific page is active, it means we are on the main calendar view
  }

  showModal(modalElement) {
    const activePage = this.getActivePageElement();
    if (activePage) {
        activePage.appendChild(this.commonOverlay); // Add overlay to the active page
    } else {
        document.body.appendChild(this.commonOverlay); // Add to body if on main calendar
    }
    this.commonOverlay.classList.add('active');
    modalElement.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  }

  hideModal(modalElement) {
    modalElement.classList.remove('active');
    // Common overlay को तभी हटाएँ जब कोई अन्य modal, side menu या calendar activities page active न हो
    if (!this.dayDetails.classList.contains('active') &&
        !this.overtimeModal.classList.contains('active') &&
        !this.summaryModal.classList.contains('active') &&
        !this.shiftModal.classList.contains('active') &&
        !this.sideMenu.classList.contains('active') &&
        !this.calendarActivitiesPage.classList.contains('active') &&
        !this.birthdayReminderPage.classList.contains('active') &&
        !this.myProfilePage.classList.contains('active') &&
        !this.settingsPage.classList.contains('active') &&
        !this.holidayFestivalPage.classList.contains('active')) { // NEW: Holiday Page की स्थिति भी चेक करें
        this.commonOverlay.classList.remove('active');
        // Remove commonOverlay from its parent if it's not needed
        if (this.commonOverlay.parentNode) {
            this.commonOverlay.parentNode.removeChild(this.commonOverlay);
        }
        document.body.style.overflow = '';
    }
  }
  
  hideAllModals() {
    this.hideModal(this.dayDetails);
    this.hideModal(this.overtimeModal);
    this.hideModal(this.summaryModal);
    this.hideModal(this.shiftModal);
    this.hideCalendarActivitiesPage(); // Also hide the activities page
    this.hideBirthdayReminderPage(); // Also hide the birthday page
    this.hideMyProfilePage(); // Also hide the profile page
    this.hideSettingsPage(); // Also hide the settings page
    this.hideHolidayFestivalPage(); // NEW: Also hide the holiday page

    this.clearSelectionVisuals();
    this.selectedDays = [];
    this.renderCalendar(); // Re-render main calendar in case active calendar changed
  }

  renderCalendar() {
    this.calendarGrid.innerHTML = '';
    this.monthYearDisplay.textContent = this.getFormattedMonthYear();

    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();

    const today = new Date();
    const isCurrentMonth = this.currentDate.getMonth() === today.getMonth() &&
                           this.currentDate.getFullYear() === today.getFullYear();

    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'day empty-day';
      this.calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'day';
      dayCell.textContent = day;
      dayCell.dataset.day = day;

      if ((firstDay + day - 1) % 7 === 0) {
        dayCell.classList.add('sunday');
      }

      if (isCurrentMonth && day === today.getDate()) {
        dayCell.classList.add('current-day');
      }

      const dayData = this.getDayData(day);
      if (dayData) {
        if (dayData.status) {
            dayCell.classList.add(dayData.status);
        }

        if (dayData.overtime && parseFloat(dayData.overtime) > 0) {
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

        // Show Shift Badge
        if (dayData.shift) {
          const shiftBadge = document.createElement('span');
          shiftBadge.className = 'shift-badge';
          shiftBadge.textContent = dayData.shift;
          dayCell.appendChild(shiftBadge);
        }
      }

      if (this.selectedDays.includes(day)) {
        dayCell.classList.add('selected');
      }

      dayCell.addEventListener('click', (event) => this.toggleDaySelection(dayCell, day, event));
      this.calendarGrid.appendChild(dayCell);
    }
  }

 toggleDaySelection(dayCell, day, event) {
    // Prevent selection if any modal or activities page is open
    if (this.dayDetails.classList.contains('active') || this.overtimeModal.classList.contains('active') || this.summaryModal.classList.contains('active') || this.shiftModal.classList.contains('active') || this.calendarActivitiesPage.classList.contains('active') || this.birthdayReminderPage.classList.contains('active') || this.myProfilePage.classList.contains('active') || this.settingsPage.classList.contains('active') || this.holidayFestivalPage.classList.contains('active')) { // NEW: Holiday Page की स्थिति भी चेक करें
        return;
    }

    if (this.selectedDays.includes(day)) {
      this.selectedDays = this.selectedDays.filter(d => d !== day);
      dayCell.classList.remove('selected');
    } else {
      this.selectedDays.push(day);
      dayCell.classList.add('selected');
    }

    this.selectedDays.sort((a, b) => a - b);

    this.selectedMonth = this.currentDate.getMonth();
    this.selectedYear = this.currentDate.getFullYear();
  }

  getDayData(day) {
    const monthYearKey = `${this.currentDate.getMonth()}-${this.currentDate.getFullYear()}`;
    // Ensure the active calendar and monthYearKey exist before trying to access day data
    if (!this.calendars[this.activeCalendar]) {
      this.calendars[this.activeCalendar] = {};
    }
    if (!this.calendars[this.activeCalendar][monthYearKey]) {
        this.calendars[this.activeCalendar][monthYearKey] = {};
    }
    return this.calendars[this.activeCalendar][monthYearKey][day];
  }

  setDayData(day, data) {
    const monthYearKey = `${this.currentDate.getMonth()}-${this.currentDate.getFullYear()}`;
    if (!this.calendars[this.activeCalendar]) {
      this.calendars[this.activeCalendar] = {};
    }
    if (!this.calendars[this.activeCalendar][monthYearKey]) {
      this.calendars[this.activeCalendar][monthYearKey] = {};
    }

    // Check for all possible data types when deciding to delete
    if (!data || Object.keys(data).length === 0 || (Object.keys(data).length === 1 && data.status === undefined && data.overtime === undefined && data.note === undefined && data.shift === undefined)) {
        delete this.calendars[this.activeCalendar][monthYearKey][day];
    } else {
        const existingData = this.calendars[this.activeCalendar][monthYearKey][day] || {};
        const updatedData = { ...existingData, ...data };

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

    this.renderCalendar();

    const dayCellElement = this.calendarGrid.querySelector(`.day[data-day="${day}"]`);
    if (dayCellElement && !dayCellElement.classList.contains('empty-day')) {
        dayCellElement.classList.add('updated');
        setTimeout(() => dayCellElement.classList.remove('updated'), 500);
    }
  }

  getFormattedMonthYear() {
    return this.currentDate.toLocaleString('default', {
      month: 'long',
      year: 'numeric'
    });
  }

  saveData() {
    localStorage.setItem("calendars", JSON.stringify(this.calendars));
    localStorage.setItem("activeCalendar", this.activeCalendar);
    localStorage.setItem("birthdays", JSON.stringify(this.birthdays)); // Save birthdays
    localStorage.setItem("userProfile", JSON.stringify(this.userProfile)); // Save user profile
    localStorage.setItem("settings", JSON.stringify(this.settings)); // Save settings
  }

  applyStatusToSelectedDays(status) {
    if (this.selectedDays.length === 0) {
      this.showCustomAlert("कृपया कम से कम एक दिन चुनें!");
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
  }

  clearSelectedDays() {
    if (this.selectedDays.length === 0) {
      this.showCustomAlert("कृपया कम से कम एक दिन चुनें!");
      return;
    }

    this.selectedDays.forEach(day => {
        this.setDayData(day, {
            status: undefined,
            overtime: undefined,
            note: undefined,
            shift: undefined
        });
    });
    this.clearSelectionVisuals();
    this.selectedDays = [];
    this.hideAllModals(); // This will also hide the activities page if open
  }

  showOvertimeModal() {
    if (this.selectedDays.length === 0) {
      this.showCustomAlert("कृपया कम से कम एक दिन चुनें!");
      return;
    }

  
    const firstSelectedDay = this.selectedDays[0];
    const currentData = this.getDayData(firstSelectedDay) || {};
    this.overtimeInput.value = currentData.overtime || '';
    this.showModal(this.overtimeModal);
    this.overtimeInput.focus();
  }

  saveOvertimeHours() {
    if (this.selectedDays.length === 0) {
      this.showCustomAlert("कोई दिन नहीं चुना गया है।");
      return;
    }

    const hours = parseFloat(this.overtimeInput.value);

    if (isNaN(hours) || hours < 0) {
      this.showCustomAlert("कृपया घंटों की एक वैध संख्या (0 या अधिक) दर्ज करें");
      return;
    }

    this.selectedDays.forEach(day => {
        const currentData = this.getDayData(day) || {};
        this.setDayData(day, {
            ...currentData,
            overtime: hours
        });
    });

    this.hideModal(this.overtimeModal);
    this.selectedDays = [];
    this.clearSelectionVisuals();
  }

  showDayDetails() {
    if (this.selectedDays.length === 0) {
      this.showCustomAlert(" कृपया कम से कम एक दिन चुनें!");
      return;
    }

    const firstSelectedDay = this.selectedDays[0];
    const dateStr = new Date(this.selectedYear, this.selectedMonth, firstSelectedDay).toLocaleDateString();

    if (this.selectedDays.length > 1) {
        this.dayDetailsTitle.textContent = `Details for ${firstSelectedDay} - ${this.selectedDays[this.selectedDays.length - 1]} & ${this.selectedDays.length - 2} more days...`;
    } else {
        this.dayDetailsTitle.textContent = `Details for ${dateStr}`;
    }

    const dayData = this.getDayData(firstSelectedDay) || {};
    this.dayNote.value = dayData.note || '';

    this.showModal(this.dayDetails);
  }

  saveDayNote() {
    if (this.selectedDays.length === 0) {
        this.showCustomAlert("कोई दिन नहीं चुना गया है।");
        return;
    }

    const note = this.dayNote.value.trim();

    this.selectedDays.forEach(day => {
        const currentData = this.getDayData(day) || {};
        this.setDayData(day, {
            ...currentData,
            note: note || undefined
        });
    });

    this.hideModal(this.dayDetails);
    this.selectedDays = [];
    this.clearSelectionVisuals();
  }

  // Shift Modal Functions
  showShiftModal() {
    if (this.selectedDays.length === 0) {
      this.showCustomAlert(" कृपया कम से कम एक दिन चुनें!");
      return;
    }
    this.showModal(this.shiftModal);
  }

  applyShiftToSelectedDays(shiftType) {
    if (this.selectedDays.length === 0) {
      this.showCustomAlert("कोई दिन नहीं चुना गया है।");
      return;
    }

    this.selectedDays.forEach(day => {
        const currentData = this.getDayData(day) || {};
        this.setDayData(day, {
            ...currentData,
            shift: shiftType
        });
    });

    this.hideModal(this.shiftModal);
    this.selectedDays = [];
    this.clearSelectionVisuals();
  }
  // END Shift Modal Functions

  changeMonth(offset) {
    this.currentDate.setMonth(this.currentDate.getMonth() + offset);
    this.selectedDays = [];
    this.hideAllModals(); // This ensures all overlays are hidden
    this.renderCalendar();
    this.updateCurrentDayHighlight();
  }

  clearSelectionVisuals() {
    document.querySelectorAll('.day').forEach(cell => {
      cell.classList.remove('selected');
    });
  }

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

  showMonthSummary() {
    const monthYearKey = `${this.currentDate.getMonth()}-${this.currentDate.getFullYear()}`;
    const data = this.calendars[this.activeCalendar]?.[monthYearKey] || {};
    let present = 0, absent = 0, holiday = 0, halfDay = 0, leave = 0, overtime = 0;
    let emergency = 0, sick = 0, festival = 0; // NEW: Counters for new statuses
    const shifts = {};

    Object.values(data).forEach(entry => {
      if (entry.status === 'present') present++;
      if (entry.status === 'absent') absent++;
      if (entry.status === 'holiday') holiday++;
      if (entry.status === 'half-day') halfDay++;
      if (entry.status === 'leave') leave++;
      // NEW: Count new statuses
      if (entry.status === 'emergency') emergency++;
      if (entry.status === 'sick') sick++;
      if (entry.status === 'festival') festival++;

      if (entry.overtime) overtime += parseFloat(entry.overtime);
      if (entry.shift) {
        shifts[entry.shift] = (shifts[entry.shift] || 0) + 1;
      }
    });


 const totalRecordedDays = present + absent + halfDay + leave + emergency + sick;
    const attendanceRate = totalRecordedDays > 0 ? Math.round((present / totalRecordedDays) * 100) : 0;

    this.summaryModalTitle.textContent = `month ${this.getFormattedMonthYear()}`;

    let shiftSummaryHtml = '';
    if (Object.keys(shifts).length > 0) {
      shiftSummaryHtml += '<li><i class="fas fa-exchange-alt" style="color: #1abc9c;"></i> shift:</li><ul>';
      for (const shiftType in shifts) {
        shiftSummaryHtml += `<li>&nbsp;&nbsp;&nbsp;&nbsp;${shiftType}: ${shifts[shiftType]} day</li>`;
      }
      shiftSummaryHtml += '</ul>';
    }

    this.summaryContent.innerHTML = `
      <ul class="summary-list">
        <li><i class="fas fa-check-circle" style="color: var(--color-present);"></i> Present: ${present} day</li>
        <li><i class="fas fa-hourglass-half" style="color: var(--color-half-day);"></i> half-day: ${halfDay} day</li>
        <li><i class="fas fa-times-circle" style="color: var(--color-absent);"></i> absent: ${absent} day</li>
        <li><i class="fas fa-plane-departure"     style="color: var(--color-leave);"></i> leave:  ${leave}         day</li>
        <li><i class="fas fa-exclamation-triangle" style="color: var(--color-emergency);"></i> emergency: ${emergency} day</li>
        <li><i class="fas fa-procedures" style="color: var(--color-sick);"></i> sick: ${sick} day</li>
        <li><i class="fas fa-gift" style="color: var(--color-festival);"></i> festival: ${festival} day</li>
        <li><i class="fas fa-umbrella-beach" style="color: var(--color-holiday);"></i> holiday: ${holiday} day</li>
        <li><i class="fas fa-clock" style="color: var(--color-overtime);"></i> overtime: ${overtime.toFixed(1)} hours</li>
        ${shiftSummaryHtml}
        <li class="attendance-rate-item"><i class="fas fa-chart-line" style="color: var(--color-primary);"></i> Attendance rate: ${attendanceRate}%</li>
      </ul>
    `;

    this.showModal(this.summaryModal);
  }



  toggleMenu() {
    if (this.sideMenu && this.overlayMenu) {
      this.sideMenu.classList.toggle('active');
      this.overlayMenu.classList.toggle('active');
      // NEW: simple-menu-button पर भी active क्लास टॉगल करें
      if (this.menuToggle) {
        this.menuToggle.classList.toggle('active');
      }

      if (this.sideMenu.classList.contains('active')) {
          document.body.style.overflow = 'hidden';
          // Overlay for side menu should always be on body
          document.body.appendChild(this.commonOverlay);
          this.commonOverlay.classList.add('active');
      } else {
          // Check if any other modal or calendar activities page is active before removing overflow and common overlay
          if (!this.dayDetails.classList.contains('active') &&
              !this.overtimeModal.classList.contains('active') &&
              !this.summaryModal.classList.contains('active') &&
              !this.shiftModal.classList.contains('active') &&
              !this.calendarActivitiesPage.classList.contains('active') &&
              !this.birthdayReminderPage.classList.contains('active') &&
              !this.myProfilePage.classList.contains('active') &&
              !this.settingsPage.classList.contains('active') &&
              !this.holidayFestivalPage.classList.contains('active')) { // NEW: Holiday Page की स्थिति भी चेक करें
              document.body.style.overflow = '';
              // Remove commonOverlay from its parent if it's not needed
              if (this.commonOverlay.parentNode) {
                  this.commonOverlay.parentNode.removeChild(this.commonOverlay);
              }
          }
      }
    }
  }


  // Custom Alert/Message Box function
  showCustomAlert(message, onConfirm = null) {
    const alertModal = document.createElement('div');
    alertModal.className = 'modal-overlay active';
    alertModal.innerHTML = `
      <div class="summary-modal">
        <div class="modal-header">
          <h3 class="modal-title">${onConfirm ? 'पुष्टि करें' : 'सूचना'}</h3>
          <button class="close-modal" id="customAlertCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="summary-content">
          <p>${message}</p>
        </div>
        <div class="modal-actions">
          ${onConfirm ? `<button class="btn-modal btn-cancel" id="customAlertCancelBtn">रद्द करें</button>` : ''}
          <button class="btn-modal btn-save" id="customAlertOkBtn">ठीक है</button>
        </div>
      </div>
    `;

    const activePage = this.getActivePageElement();
    if (activePage) {
        activePage.appendChild(alertModal); // Add alert to the active page
        activePage.appendChild(this.commonOverlay); // Add overlay to the active page
    } else {
        document.body.appendChild(alertModal); // Add to body if on main calendar
        document.body.appendChild(this.commonOverlay); // Add overlay to the body
    }

    this.commonOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    const closeBtn = document.getElementById('customAlertCloseBtn');
    const okBtn = document.getElementById('customAlertOkBtn');
    const cancelBtn = document.getElementById('customAlertCancelBtn'); // Will be null if not a confirm dialog

    const removeAlert = () => {
      alertModal.remove();
      // Check if any other modal, side menu or calendar activities page is active before removing overflow and common overlay
      if (!this.dayDetails.classList.contains('active') &&
          !this.overtimeModal.classList.contains('active') &&
          !this.summaryModal.classList.contains('active') &&
          !this.shiftModal.classList.contains('active') &&
          !this.sideMenu.classList.contains('active') &&
          !this.calendarActivitiesPage.classList.contains('active') &&
          !this.birthdayReminderPage.classList.contains('active') &&
          !this.myProfilePage.classList.contains('active') &&
          !this.settingsPage.classList.contains('active') &&
          !this.holidayFestivalPage.classList.contains('active')) { // NEW: Holiday Page की स्थिति भी चेक करें
          this.commonOverlay.classList.remove('active');
          // Remove commonOverlay from its parent if it's not needed
          if (this.commonOverlay.parentNode) {
              this.commonOverlay.parentNode.removeChild(this.commonOverlay);
          }
          document.body.style.overflow = '';
      }
    };

    closeBtn.addEventListener('click', removeAlert);
    okBtn.addEventListener('click', () => {
        removeAlert();
        if (onConfirm) onConfirm(true);
    });

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            removeAlert();
            if (onConfirm) onConfirm(false);
        });
    }

    alertModal.addEventListener('click', (e) => {
        if (e.target === alertModal) {
            removeAlert();
            if (onConfirm) onConfirm(false); // If clicked outside, treat as cancel for confirm dialog
        }
    });
  }

  // Calendar Activities Page Functions
  showCalendarActivitiesPage() {
    this.hideAllModals(); // Hide any other open modals/pages first
    this.toggleMenu(); // Close the side menu if open
    this.calendarActivitiesPage.classList.add('active');
    this.commonOverlay.classList.add('active');
    this.calendarActivitiesPage.appendChild(this.commonOverlay); // Add overlay to this page
    document.body.style.overflow = 'hidden';
    this.renderCalendarsList();
  }

  hideCalendarActivitiesPage() {
    this.calendarActivitiesPage.classList.remove('active');
    // Remove commonOverlay from this page if it's not needed by other modals/pages
    if (this.commonOverlay.parentNode === this.calendarActivitiesPage) {
        this.calendarActivitiesPage.removeChild(this.commonOverlay);
    }
    // Check if any other modal or side menu is active before removing common overlay and overflow
    if (!this.dayDetails.classList.contains('active') &&
        !this.overtimeModal.classList.contains('active') &&
        !this.summaryModal.classList.contains('active') &&
        !this.shiftModal.classList.contains('active') &&
        !this.sideMenu.classList.contains('active') &&
        !this.birthdayReminderPage.classList.contains('active') &&
        !this.myProfilePage.classList.contains('active') &&
        !this.settingsPage.classList.contains('active') &&
        !this.holidayFestivalPage.classList.contains('active')) { // NEW: Holiday Page की स्थिति भी चेक करें
        this.commonOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    this.renderCalendar(); // Re-render the main calendar to reflect any active calendar changes
  }

  renderCalendarsList() {
    this.calendarsList.innerHTML = '';
    this.activeCalendarNameDisplay.textContent = this.activeCalendar;

    for (const calendarName in this.calendars) {
      const listItem = document.createElement('li');
      listItem.className = 'calendar-item';
      listItem.dataset.calendarName = calendarName;

      const isActive = calendarName === this.activeCalendar;

      listItem.innerHTML = `
        <span class="calendar-item-name">
          <i class="fas fa-calendar-alt"></i>
          ${calendarName}
        </span>
        <div class="calendar-actions">
          <label class="toggle-switch">
            <input type="checkbox" ${isActive ? 'checked' : ''} ${calendarName === 'Default' ? 'disabled' : ''}>
            <span class="slider"></span>
          </label>
          <button class="action-icon-btn edit-btn" ${calendarName === 'Default' ? 'disabled' : ''}>
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-icon-btn delete-btn" ${calendarName === 'Default' ? 'disabled' : ''}>
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;
      this.calendarsList.appendChild(listItem);
    }
  }

 addNewCalendar() {
    const newName = this.newCalendarInput.value.trim();
    if (!newName) {
      this.showCustomAlert("कृपया कैलेंडर के लिए एक नाम दर्ज करें।");
      return;
    }
    if (this.calendars[newName]) {
      this.showCustomAlert("इस नाम का एक कैलेंडर पहले से मौजूद है।");
      return;
    }

    this.calendars[newName] = {}; // Create a new empty calendar
    this.activeCalendar = newName; // Make it active immediately
    this.saveData();
    this.renderCalendarsList();
    this.renderCalendar(); // Update main calendar view
    this.newCalendarInput.value = '';
    // this.showCustomAlert(`कैलेंडर "${newName}" सफलतापूर्वक जोड़ा गया और सक्रिय किया गया!`); // यह लाइन हटा दी गई है
  }

  activateCalendar(calendarName) {
    if (this.activeCalendar === calendarName) {
        // this.showCustomAlert(`कैलेंडर "${calendarName}" पहले से ही सक्रिय है।`);
        // No need to alert, just do nothing if already active
        this.renderCalendarsList(); // Ensure toggle state is correct
        return;
    }
    this.activeCalendar = calendarName;
    this.saveData();
    this.renderCalendarsList(); // Update toggle states
    this.renderCalendar(); // Update main calendar view
    // this.showCustomAlert(`कैलेंडर "${calendarName}" सक्रिय किया गया!`); // यह लाइन हटा दी गई है
  }

  editCalendar(calendarName) {
    if (calendarName === 'Default') {
      this.showCustomAlert("आप 'Default' कैलेंडर का नाम संपादित नहीं कर सकते।");
      return;
    }

    // Using prompt for now, but for a full app, a custom modal input would be better
    const newName = prompt(`कैलेंडर "${calendarName}" के लिए नया नाम दर्ज करें:`);
    if (!newName || newName.trim() === '' || newName.trim() === calendarName) {
      return; // User cancelled or entered same/empty name
    }
    const trimmedNewName = newName.trim();

    if (this.calendars[trimmedNewName]) {
      this.showCustomAlert("इस नाम का एक कैलेंडर पहले से मौजूद है।");
      return;
    }

    // Copy data to new name
    this.calendars[trimmedNewName] = { ...this.calendars[calendarName] };
    delete this.calendars[calendarName];

    if (this.activeCalendar === calendarName) {
      this.activeCalendar = trimmedNewName;
    }

    this.saveData();
    this.renderCalendarsList();
    this.renderCalendar(); // Update main calendar view
    // this.showCustomAlert(`कैलेंडर का नाम "${calendarName}" से बदलकर "${trimmedNewName}" कर दिया गया है।`); // यह लाइन हटा दी गई है
  }

  deleteCalendar(calendarName) {
    if (calendarName === 'Default') {
      this.showCustomAlert("आप 'Default' कैलेंडर को हटा नहीं सकते।");
      return;
    }
    if (this.activeCalendar === calendarName) {
      this.showCustomAlert("आप सक्रिय कैलेंडर को हटा नहीं सकते। कृपया हटाने से पहले एक अलग कैलेंडर सक्रिय करें।");
      return;
    }

    this.showCustomAlert(`क्या आप वास्तव में कैलेंडर "${calendarName}" को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।`, (confirmed) => {
        if (confirmed) {
            delete this.calendars[calendarName];
            this.saveData();
            this.renderCalendarsList();
            // this.showCustomAlert(`कैलेंडर "${calendarName}" हटा दिया गया है।`);
        }
    });
  }

  // Birthday Reminder Page Functions
  showBirthdayReminderPage() {
    this.hideAllModals(); // Hide any other open modals/pages first
    this.toggleMenu(); // Close the side menu if open
    this.birthdayReminderPage.classList.add('active');
    this.commonOverlay.classList.add('active');
    this.birthdayReminderPage.appendChild(this.commonOverlay); // Add overlay to this page
    document.body.style.overflow = 'hidden';
    this.renderBirthdaysList();
  }

  hideBirthdayReminderPage() {
    this.birthdayReminderPage.classList.remove('active');
    // Remove commonOverlay from this page if it's not needed by other modals/pages
    if (this.commonOverlay.parentNode === this.birthdayReminderPage) {
        this.birthdayReminderPage.removeChild(this.commonOverlay);
    }
    // Check if any other modal, side menu or calendar activities page is active before removing common overlay and overflow
    if (!this.dayDetails.classList.contains('active') &&
        !this.overtimeModal.classList.contains('active') &&
        !this.summaryModal.classList.contains('active') &&
        !this.shiftModal.classList.contains('active') &&
        !this.sideMenu.classList.contains('active') &&
        !this.calendarActivitiesPage.classList.contains('active') &&
        !this.myProfilePage.classList.contains('active') &&
        !this.settingsPage.classList.contains('active') &&
        !this.holidayFestivalPage.classList.contains('active')) { // NEW: Holiday Page की स्थिति भी चेक करें
        this.commonOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
  }
  
  renderBirthdaysList() {
    this.birthdaysList.innerHTML = '';
    if (this.birthdays.length === 0) {
      this.birthdaysList.innerHTML = '<li class="no-birthdays-message" style="text-align: center; color: #777; padding: 20px;">कोई जन्मदिन नहीं जोड़ा गया है।</li>';
      return;
    }

    // Sort birthdays by month and day
    const sortedBirthdays = [...this.birthdays].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getMonth() !== dateB.getMonth()) {
        return dateA.getMonth() - dateB.getMonth();
      }
      return dateA.getDate() - dateB.getDate();
    });

    sortedBirthdays.forEach((birthday, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'birthday-item';
      listItem.dataset.index = this.birthdays.indexOf(birthday); // Use original index for deletion

      const birthdayDate = new Date(birthday.date);
      const formattedDate = birthdayDate.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      listItem.innerHTML = `
        <div class="birthday-details">
          <h4>${birthday.name}</h4>
          <p><i class="fas fa-calendar-alt"></i> जन्मदिन: ${formattedDate}</p>
          ${birthday.relation ? `<p class="relation"><i class="fas fa-user-friends"></i> संबंध: ${birthday.relation}</p>` : ''}
        </div>
        <button class="action-icon-btn delete-birthday-btn" data-index="${this.birthdays.indexOf(birthday)}">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
      this.birthdaysList.appendChild(listItem);
    });
  }

  addBirthday() {
    const name = this.birthdayNameInput.value.trim();
    const date = this.birthdayDateInput.value; // YYYY-MM-DD format
    const relation = this.birthdayRelationSelect.value;

    if (!name || !date) {
      this.showCustomAlert("कृपया नाम और जन्मदिन की तारीख दर्ज करें।");
      return;
    }

    const newBirthday = { name, date, relation };
    this.birthdays.push(newBirthday);
    this.saveData();
    this.renderBirthdaysList();

    // Clear form fields
    this.birthdayNameInput.value = '';
    this.birthdayDateInput.value = '';
    this.birthdayRelationSelect.value = '';

    // this.showCustomAlert(`जन्मदिन "${name}" सफलतापूर्वक जोड़ा गया!`); // यह लाइन हटा दी गई है
  }

  deleteBirthday(index) {
    this.showCustomAlert(`क्या आप वास्तव में इस जन्मदिन को हटाना चाहते हैं?`, (confirmed) => {
        if (confirmed) {
            if (index > -1 && index < this.birthdays.length) {
              this.birthdays.splice(index, 1);
              this.saveData();
              this.renderBirthdaysList();
              // this.showCustomAlert("जन्मदिन सफलतापूर्वक हटा दिया गया है।");
            }
        }
    });
  }

  // My Profile Page Functions
  showMyProfilePage() {
    this.hideAllModals(); // Hide any other open modals/pages first
    this.toggleMenu(); // Close the side menu if open
    this.myProfilePage.classList.add('active');
    this.commonOverlay.classList.add('active');
    this.myProfilePage.appendChild(this.commonOverlay); // Add overlay to this page
    document.body.style.overflow = 'hidden';
    this.loadProfileData(); // Load data into form fields when showing the page
  }

  hideMyProfilePage() {
    this.myProfilePage.classList.remove('active');
    // Remove commonOverlay from this page if it's not needed by other modals/pages
    if (this.commonOverlay.parentNode === this.myProfilePage) {
        this.myProfilePage.removeChild(this.commonOverlay);
    }
    // Check if any other modal, side menu or calendar activities page is active before removing common overlay and overflow
    if (!this.dayDetails.classList.contains('active') &&
        !this.overtimeModal.classList.contains('active') &&
        !this.summaryModal.classList.contains('active') &&
        !this.shiftModal.classList.contains('active') &&
        !this.sideMenu.classList.contains('active') &&
        !this.calendarActivitiesPage.classList.contains('active') &&
        !this.birthdayReminderPage.classList.contains('active') &&
        !this.settingsPage.classList.contains('active') &&
        !this.holidayFestivalPage.classList.contains('active')) { // NEW: Holiday Page की स्थिति भी चेक करें
        this.commonOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
  }


  loadProfileData() {
    this.profileNameInput.value = this.userProfile.name || '';
    this.profileEmailInput.value = this.userProfile.email || '';
    this.profileImage.src = this.userProfile.profileImage || 'https://placehold.co/120x120/4361ee/ffffff?text=Profile';
  }

  saveProfileData() {
    this.userProfile.name = this.profileNameInput.value.trim();
    this.userProfile.email = this.profileEmailInput.value.trim();
    // Profile image is saved directly in handleProfileImageUpload or removeProfileImage
    this.saveData();
    // this.showCustomAlert("प्रोफ़ाइल सफलतापूर्वक सहेजी गई!"); // यह लाइन हटा दी गई है
    // this.hideMyProfilePage(); // Optionally close after saving
  }

  handleProfileImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.userProfile.profileImage = e.target.result;
        this.profileImage.src = e.target.result;
        this.saveData();
        // this.showCustomAlert("प्रोफ़ाइल तस्वीर अपलोड की गई!"); // यह लाइन हटा दी गई है
      };
      reader.readAsDataURL(file); // Read file as Data URL (base64)
    }
  }

  removeProfileImage() {
    this.showCustomAlert("क्या आप अपनी प्रोफ़ाइल तस्वीर हटाना चाहते हैं?", (confirmed) => {
        if (confirmed) {
            this.userProfile.profileImage = 'https://placehold.co/120x120/4361ee/ffffff?text=Profile'; // Reset to default
            this.profileImage.src = this.userProfile.profileImage;
            this.saveData();
            // this.showCustomAlert("प्रोफ़ाइल तस्वीर हटा दी गई!");
        }
    });
  }

  // Settings Page Functions
  showSettingsPage() {
    this.hideAllModals(); // Hide any other open modals/pages first
    this.toggleMenu(); // Close the side menu if open
    this.settingsPage.classList.add('active');
    this.commonOverlay.classList.add('active');
    this.settingsPage.appendChild(this.commonOverlay); // Add overlay to this page
    document.body.style.overflow = 'hidden';
    this.loadSettings(); // Load settings data into UI
  }

  hideSettingsPage() {
    this.settingsPage.classList.remove('active');
    // Remove commonOverlay from this page if it's not needed by other modals/pages
    if (this.commonOverlay.parentNode === this.settingsPage) {
        this.settingsPage.removeChild(this.commonOverlay);
    }
    // Check if any other modal, side menu or activity page is active before removing common overlay and overflow
    if (!this.dayDetails.classList.contains('active') &&
        !this.overtimeModal.classList.contains('active') &&
        !this.summaryModal.classList.contains('active') &&
        !this.shiftModal.classList.contains('active') &&
        !this.sideMenu.classList.contains('active') &&
        !this.calendarActivitiesPage.classList.contains('active') &&
        !this.birthdayReminderPage.classList.contains('active') &&
        !this.myProfilePage.classList.contains('active') &&
        !this.holidayFestivalPage.classList.contains('active')) { // NEW: Holiday Page की स्थिति भी चेक करें
        this.commonOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
  }

  loadSettings() {
    this.dailyReminderToggle.checked = this.settings.dailyReminder;
  }

  toggleDailyReminder(isChecked) {
    this.settings.dailyReminder = isChecked;
    this.saveData();
    // this.showCustomAlert(`दैनिक रिमाइंडर ${isChecked ? 'सक्रिय' : 'निष्क्रिय'} किया गया।`); // यह लाइन हटा दी गई है
  }

  // NEW: Holiday / Festival Page Functions
  showHolidayFestivalPage() {
    this.hideAllModals(); // Hide any other open modals/pages first
    this.toggleMenu(); // Close the side menu if open
    this.holidayFestivalPage.classList.add('active');
    this.commonOverlay.classList.add('active');
    this.holidayFestivalPage.appendChild(this.commonOverlay); // Add overlay to this page
    document.body.style.overflow = 'hidden';
    this.renderHolidaysList();
  }

  hideHolidayFestivalPage() {
    this.holidayFestivalPage.classList.remove('active');
    // Remove commonOverlay from this page if it's not needed by other modals/pages
    if (this.commonOverlay.parentNode === this.holidayFestivalPage) {
        this.holidayFestivalPage.removeChild(this.commonOverlay);
    }
    // Check if any other modal, side menu or activity page is active before removing common overlay and overflow
    if (!this.dayDetails.classList.contains('active') &&
        !this.overtimeModal.classList.contains('active') &&
        !this.summaryModal.classList.contains('active') &&
        !this.shiftModal.classList.contains('active') &&
        !this.sideMenu.classList.contains('active') &&
        !this.calendarActivitiesPage.classList.contains('active') &&
        !this.birthdayReminderPage.classList.contains('active') &&
        !this.myProfilePage.classList.contains('active') &&
        !this.settingsPage.classList.contains('active')) {
        this.commonOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
  }

  async loadHolidays() {
    try {
      const response = await fetch('holidays.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.holidays = await response.json();
      this.renderHolidaysList();
    } catch (error) {
      console.error("छुट्टियों का डेटा लोड करने में त्रुटि:", error);
      this.holidaysList.innerHTML = '<li style="text-align: center; color: #e74c3c; padding: 20px;">छुट्टियों का डेटा लोड करने में असमर्थ।</li>';
    }
  }

  renderHolidaysList() {
    this.holidaysList.innerHTML = '';
    const currentYear = new Date().getFullYear();
    this.holidayPageTitle.textContent = `${currentYear} Holidays & Festivals`; // Update title with current year

    const holidaysForCurrentYear = this.holidays.filter(holiday => {
        const holidayDate = new Date(holiday.date);
        return holidayDate.getFullYear() === currentYear;
    });

    if (holidaysForCurrentYear.length === 0) {
      this.holidaysList.innerHTML = '<li style="text-align: center; color: #777; padding: 20px;">इस वर्ष के लिए कोई छुट्टी या त्योहार नहीं मिला।</li>';
      return;
    }

    holidaysForCurrentYear.sort((a, b) => new Date(a.date) - new Date(b.date));

    holidaysForCurrentYear.forEach(holiday => {
      const listItem = document.createElement('li');
      listItem.className = 'holiday-item';

      const holidayDate = new Date(holiday.date);
      const formattedDate = holidayDate.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      listItem.innerHTML = `
        <span class="holiday-name">${holiday.name}</span>
        <span class="holiday-date">${formattedDate}</span>
      `;
      this.holidaysList.appendChild(listItem);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const calendar = new AttendanceCalendar();
});
