class AttendanceCalendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDays = [];
    this.selectedMonth = this.currentDate.getMonth();
    this.selectedYear = this.currentDate.getFullYear();

    this.calendars = JSON.parse(localStorage.getItem("calendars")) || {};
    this.activeCalendar = localStorage.getItem("activeCalendar") || "Default";

    this.initElements();
    this.initEventListeners();
    this.renderCalendar(); 
    this.updateCurrentDayHighlight();
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

    // NEW: Emergency, Sick, Festival buttons
    this.emergencyBtn = document.querySelector('.btn-emergency');
    this.sickBtn = document.querySelector('.btn-sick');
    this.festivalBtn = document.querySelector('.btn-festival');
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

    // NEW: Event Listeners for Emergency, Sick, Festival
    // These are already covered by the general this.statusButtons.forEach loop
    // But explicitly adding them here for clarity if needed:
    // this.emergencyBtn.addEventListener('click', () => this.applyStatusToSelectedDays('emergency'));
    // this.sickBtn.addEventListener('click', () => this.applyStatusToSelectedDays('sick'));
    // this.festivalBtn.addEventListener('click', () => this.applyStatusToSelectedDays('festival'));
  }

  showModal(modalElement) {
    modalElement.classList.add('active');
    this.commonOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  }

  hideModal(modalElement) {
    modalElement.classList.remove('active');
    if (!this.dayDetails.classList.contains('active') && 
        !this.overtimeModal.classList.contains('active') && 
        !this.summaryModal.classList.contains('active') &&
        !this.shiftModal.classList.contains('active') && 
        !this.sideMenu.classList.contains('active')) { 
        this.commonOverlay.classList.remove('active');
        document.body.style.overflow = ''; 
    }
  }

  hideAllModals() {
    this.hideModal(this.dayDetails);
    this.hideModal(this.overtimeModal);
    this.hideModal(this.summaryModal);
    this.hideModal(this.shiftModal); 
    
    this.clearSelectionVisuals(); 
    this.selectedDays = []; 
    this.renderCalendar(); 
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
    if (this.dayDetails.classList.contains('active') || this.overtimeModal.classList.contains('active') || this.summaryModal.classList.contains('active') || this.shiftModal.classList.contains('active')) { 
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

    // NEW: Check for all possible data types when deciding to delete
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
    this.hideAllModals(); 
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
      this.showCustomAlert("कृपया कम से कम एक दिन चुनें!");
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
    this.hideAllModals(); 
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

    // NEW: Include new statuses in total recorded days for attendance rate if desired
    // For attendance rate, we typically count days where a 'status' like present, absent, half-day, leave is explicitly marked. Holidays are often excluded from this rate calculation.
    // Emergency, Sick, Festival might also be considered "absent" types or separate.
    // For now, let's include them in totalRecordedDays if they are types of "absence" from regular work.
    const totalRecordedDays = present + absent + halfDay + leave + emergency + sick; // Festival is usually a non-working day, like holiday
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
      if (this.sideMenu.classList.contains('active')) {
          document.body.style.overflow = 'hidden';
          this.commonOverlay.classList.add('active'); 
      } else {
          // Check if any other modal is active before removing overflow and common overlay
          if (!this.dayDetails.classList.contains('active') && 
              !this.overtimeModal.classList.contains('active') && 
              !this.summaryModal.classList.contains('active') &&
              !this.shiftModal.classList.contains('active')) { 
              document.body.style.overflow = '';
              this.commonOverlay.classList.remove('active');
          }
      }
    }
  }

  // Custom Alert/Message Box function
  showCustomAlert(message) {
    const alertModal = document.createElement('div');
    alertModal.className = 'modal-overlay active';
    alertModal.innerHTML = `
      <div class="summary-modal">
        <div class="modal-header">
          <h3 class="modal-title">सूचना</h3>
          <button class="close-modal" id="customAlertCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="summary-content">
          <p>${message}</p>
        </div>
        <div class="modal-actions">
          <button class="btn-modal btn-save" id="customAlertOkBtn">ठीक है</button>
        </div>
      </div>
    `;
    document.body.appendChild(alertModal);
    this.commonOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    const closeBtn = document.getElementById('customAlertCloseBtn');
    const okBtn = document.getElementById('customAlertOkBtn');

    const removeAlert = () => {
      alertModal.remove();
      if (!this.dayDetails.classList.contains('active') && 
          !this.overtimeModal.classList.contains('active') && 
          !this.summaryModal.classList.contains('active') &&
          !this.shiftModal.classList.contains('active') && 
          !this.sideMenu.classList.contains('active')) { 
          this.commonOverlay.classList.remove('active');
          document.body.style.overflow = ''; 
      }
    };

    closeBtn.addEventListener('click', removeAlert);
    okBtn.addEventListener('click', removeAlert);
    alertModal.addEventListener('click', (e) => {
        if (e.target === alertModal) {
            removeAlert();
        }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const calendar = new AttendanceCalendar();
});

