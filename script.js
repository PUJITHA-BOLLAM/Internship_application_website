/* =============================================
   script.js — Internship Application Form
   ============================================= */

// -----------------------------------------------
// 1. RADIO PILL TOGGLES
//    Clicking a radio pill deselects others in group
// -----------------------------------------------
document.querySelectorAll('.radio-group').forEach(group => {
  group.querySelectorAll('.radio-label').forEach(label => {
    label.addEventListener('click', () => {
      // Remove selected from all siblings
      group.querySelectorAll('.radio-label').forEach(l => l.classList.remove('selected'));
      // Mark clicked as selected and check its input
      label.classList.add('selected');
      label.querySelector('input').checked = true;
    });
  });
});

// -----------------------------------------------
// 2. CHECKBOX PILL TOGGLES
//    Clicking a checkbox pill toggles its state
// -----------------------------------------------
document.querySelectorAll('.checkbox-group').forEach(group => {
  group.querySelectorAll('.checkbox-label').forEach(label => {
    label.addEventListener('click', () => {
      label.classList.toggle('selected');
      label.querySelector('input').checked = label.classList.contains('selected');
    });
  });
});

// -----------------------------------------------
// 3. DECLARATION CONFIRM TOGGLE
// -----------------------------------------------
let confirmed = false;

function toggleConfirm() {
  confirmed = !confirmed;
  document.getElementById('confirmLabel').classList.toggle('checked', confirmed);
}

// -----------------------------------------------
// 4. SECTION COLLAPSE / EXPAND
//    Click the section-title row to toggle
// -----------------------------------------------
function toggleSection(titleEl) {
  titleEl.closest('.section').classList.toggle('collapsed');
}

// -----------------------------------------------
// 5. FILE DRAG & DROP + CLICK UPLOAD
// -----------------------------------------------
const fileDrop   = document.getElementById('fileDrop');
const fileInput  = document.getElementById('resumeFile');
const fileNameEl = document.getElementById('fileName');

// Highlight drop zone on drag over
fileDrop.addEventListener('dragover', e => {
  e.preventDefault();
  fileDrop.classList.add('dragover');
});

// Remove highlight when drag leaves
fileDrop.addEventListener('dragleave', () => {
  fileDrop.classList.remove('dragover');
});

// Handle dropped file
fileDrop.addEventListener('drop', e => {
  e.preventDefault();
  fileDrop.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type === 'application/pdf') {
    setFile(file);
  }
});

// Handle file picker selection
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) setFile(fileInput.files[0]);
});

// Show file name and hide error
function setFile(file) {
  fileNameEl.textContent = '✓ ' + file.name;
  fileNameEl.style.display = 'block';
  document.getElementById('resumeErr').classList.remove('visible');
}

// -----------------------------------------------
// 6. CHARACTER COUNTER (Why us textarea)
// -----------------------------------------------
const whyUs    = document.getElementById('whyUs');
const charCount = document.getElementById('charCount');

whyUs.addEventListener('input', () => {
  charCount.textContent = whyUs.value.length;
});

// -----------------------------------------------
// 7. REAL-TIME FIELD VALIDATION
//    Shows error on blur, clears it when fixed
// -----------------------------------------------
function validateField(input, errId, checkFn) {
  // Show error when leaving the field
  input.addEventListener('blur', () => {
    const err = document.getElementById(errId);
    if (!checkFn(input.value)) {
      input.classList.add('error');
      input.classList.remove('valid');
      err.classList.add('visible');
    } else {
      input.classList.remove('error');
      input.classList.add('valid');
      err.classList.remove('visible');
    }
  });

  // Clear error as user types a valid value
  input.addEventListener('input', () => {
    if (input.classList.contains('error') && checkFn(input.value)) {
      input.classList.remove('error');
      input.classList.add('valid');
      document.getElementById(errId).classList.remove('visible');
    }
  });
}

// Wire up real-time validation for each field
validateField(
  document.getElementById('name'),
  'nameErr',
  v => v.trim().length > 1
);
validateField(
  document.getElementById('email'),
  'emailErr',
  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
);
validateField(
  document.getElementById('phone'),
  'phoneErr',
  v => v.replace(/\D/g, '').length >= 7
);
validateField(
  document.getElementById('college'),
  'collegeErr',
  v => v.trim().length > 1
);

// -----------------------------------------------
// 8. PROGRESS BAR
//    Lights up a step when its section has input
// -----------------------------------------------
function updateProgress() {
  const sections = document.querySelectorAll('.section[data-section]');

  sections.forEach((sec, i) => {
    // Text / select / textarea inputs (exclude radios, checkboxes, file)
    const inputs = sec.querySelectorAll(
      'input:not([type=radio]):not([type=checkbox]):not([type=file]), select, textarea'
    );
    const radios = sec.querySelectorAll('input[type=radio]');

    // Section counts as "has radio" if no radios exist OR one is checked
    const hasRadio = radios.length > 0
      ? [...radios].some(r => r.checked)
      : true;

    // Section counts as "has fields" if no text inputs exist OR one has a value
    const hasFields = inputs.length > 0
      ? [...inputs].some(inp => inp.value.trim() !== '')
      : true;

    const filled = hasFields && hasRadio;
    document.querySelector(`.progress-step[data-index="${i}"]`)
            .classList.toggle('active', filled);
  });
}

// Update progress on any input/change event in the form
document.getElementById('appForm').addEventListener('input', updateProgress);
document.getElementById('appForm').addEventListener('change', updateProgress);

// -----------------------------------------------
// 9. FORM SUBMISSION VALIDATION
// -----------------------------------------------
document.getElementById('appForm').addEventListener('submit', function (e) {
  e.preventDefault();
  let valid = true;

  // List of [fieldId, errorId, validationFn]
  const checks = [
    ['name',     'nameErr',     v => v.trim().length > 1],
    ['email',    'emailErr',    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)],
    ['phone',    'phoneErr',    v => v.replace(/\D/g, '').length >= 7],
    ['college',  'collegeErr',  v => v.trim().length > 1],
    ['degree',   'degreeErr',   v => v !== ''],
    ['year',     'yearErr',     v => v !== ''],
    ['position', 'positionErr', v => v !== ''],
    ['whyUs',    'whyErr',      v => v.trim().length >= 50],
  ];

  checks.forEach(([id, errId, fn]) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);

    if (!fn(el.value)) {
      el.classList.add('error');
      err.classList.add('visible');
      valid = false;
      // Make sure the section containing this field is open
      const sec = el.closest('.section');
      if (sec) sec.classList.remove('collapsed');
    } else {
      el.classList.remove('error');
      err.classList.remove('visible');
    }
  });

  // Validate resume upload
  if (!fileInput.files[0]) {
    document.getElementById('resumeErr').classList.add('visible');
    valid = false;
    document.getElementById('fileDrop').closest('.section').classList.remove('collapsed');
  }

  // Validate internship duration radio
  const duration = document.querySelector('input[name="duration"]:checked');
  if (!duration) {
    document.getElementById('durationErr').classList.add('visible');
    valid = false;
    document.querySelector('.section[data-section="3"]').classList.remove('collapsed');
  } else {
    document.getElementById('durationErr').classList.remove('visible');
  }

  // Validate declaration checkbox
  if (!confirmed) {
    document.getElementById('confirmErr').classList.add('visible');
    valid = false;
    document.querySelector('.section[data-section="4"]').classList.remove('collapsed');
  } else {
    document.getElementById('confirmErr').classList.remove('visible');
  }

  // If any validation failed, scroll to the first visible error
  if (!valid) {
    const firstErr = document.querySelector('.error, .field-error.visible');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // All valid — show success screen
  document.getElementById('appForm').style.display = 'none';
  document.querySelector('.progress-bar').style.display = 'none';
  document.getElementById('successScreen').classList.add('visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// -----------------------------------------------
// 10. RESET FORM
// -----------------------------------------------
function resetForm() {
  if (!confirm('Clear all fields?')) return;

  document.getElementById('appForm').reset();

  // Clear pill selections
  document.querySelectorAll('.radio-label, .checkbox-label')
          .forEach(l => l.classList.remove('selected'));

  // Clear declaration
  confirmed = false;
  document.getElementById('confirmLabel').classList.remove('checked');

  // Clear error states
  document.querySelectorAll('.field-error').forEach(e => e.classList.remove('visible'));
  document.querySelectorAll('input, select, textarea')
          .forEach(el => el.classList.remove('error', 'valid'));

  // Reset file name display
  fileNameEl.style.display = 'none';

  // Reset char counter
  charCount.textContent = '0';

  // Reset progress bar
  updateProgress();
}

// -----------------------------------------------
// 11. START OVER (from success screen)
// -----------------------------------------------
function startOver() {
  document.getElementById('appForm').style.display = 'block';
  document.querySelector('.progress-bar').style.display = 'flex';
  document.getElementById('successScreen').classList.remove('visible');
  resetForm();
}
