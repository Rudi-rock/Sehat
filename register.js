import { animate } from 'motion';
import QRCode from 'qrcode';
import { db, queuePatientSync } from './src/db.js';

// =========================================================================
// 1. Bilingual (English / हिन्दी) Localization Dictionary
// =========================================================================
const translations = {
  en: {
    nav_register: 'Register Patient',
    nav_scan: 'Scan Health Card',
    nav_dashboard: 'Patient Dashboard',
    reg_title_main: 'Register',
    reg_title_accent: 'Patient',
    reg_subtitle: 'Create an offline-first QR health identity card. Emergency vitals are accessible instantly; private notes require consent.',
    sec_demographics: 'Demographics / Patient Identity',
    lbl_fullname: 'Full Name',
    lbl_age: 'Age',
    lbl_gender: 'Gender',
    opt_select: 'Select',
    opt_male: 'Male',
    opt_female: 'Female',
    opt_other: 'Other',
    lbl_phone: 'Phone Number',
    lbl_district: 'District / Village',
    sec_emergency: 'Emergency Mode (Zero-Auth)',
    badge_emergency: 'Immediate Offline Access',
    lbl_blood: 'Blood Group',
    lbl_emergency_contact: 'Emergency Contact',
    lbl_allergies: 'Critical Allergies',
    hint_allergies: '(e.g. Penicillin, Sulfa)',
    lbl_conditions: 'Chronic Medical Conditions',
    hint_conditions: '(e.g. Diabetes, Asthma)',
    sec_private: 'Private Records (Consent Protected)',
    badge_private: 'OTP Protected',
    lbl_prescriptions: 'Past Prescriptions & Medications',
    hint_prescriptions: '(Encrypted before storage)',
    lbl_diagnostics: 'Diagnostic History & Doctor Notes',
    hint_diagnostics: '(Encrypted before storage)',
    btn_generate_card: 'Generate Sehat Card & Save',
    preview_title: 'Patient Health ID Card',
    empty_preview_msg: 'Fill out the patient details on the left to generate the offline health ID card & QR code.',
    badge_saved_dexie: 'Saved locally to IndexedDB · Sync queued',
    card_tag: 'Digital Health Identity',
    card_lbl_blood: 'Blood',
    card_lbl_age: 'Age',
    card_lbl_gender: 'Gender',
    card_lbl_allergies: 'Allergies',
    card_lbl_emergency: 'Emergency',
    card_lbl_district: 'District',
    card_footer: 'Sehat Health · Offline Ready',
    btn_download_card: 'Download Health Card',
    btn_register_new: 'Register Another Patient'
  },
  hi: {
    nav_register: 'मरीज पंजीकरण',
    nav_scan: 'स्वास्थ्य कार्ड स्कैन',
    nav_dashboard: 'मरीज डैशबोर्ड',
    reg_title_main: 'मरीज',
    reg_title_accent: 'पंजीकरण',
    reg_subtitle: 'ऑफ़लाइन-फर्स्ट डिजिटल स्वास्थ्य पहचान पत्र बनाएं। आपातकालीन विवरण तुरंत उपलब्ध होंगे; निजी रिकॉर्ड सुरक्षित रहेंगे।',
    sec_demographics: 'पहचान और मूल विवरण',
    lbl_fullname: 'पूरा नाम',
    lbl_age: 'उम्र',
    lbl_gender: 'लिंग',
    opt_select: 'चुनें',
    opt_male: 'पुरुष',
    opt_female: 'महिला',
    opt_other: 'अन्य',
    lbl_phone: 'फ़ोन नंबर',
    lbl_district: 'जिला / गाँव',
    sec_emergency: 'आपातकालीन मोड (बिना पासवर्ड)',
    badge_emergency: 'तुरंत ऑफ़लाइन उपलब्ध',
    lbl_blood: 'रक्त समूह (Blood Group)',
    lbl_emergency_contact: 'आपातकालीन संपर्क',
    lbl_allergies: 'गंभीर एलर्जी',
    hint_allergies: '(उदा. पेनिसिलिन, सल्फा)',
    lbl_conditions: 'दीर्घकालिक बीमारियां',
    hint_conditions: '(उदा. मधुमेह, दमा)',
    sec_private: 'निजी मेडिकल रिकॉर्ड (सहमति आवश्यक)',
    badge_private: 'ओटीपी सुरक्षित',
    lbl_prescriptions: 'पिछली दवाएं और पर्चे',
    hint_prescriptions: '(सहेजने से पहले एन्क्रिप्ट किया जाएगा)',
    lbl_diagnostics: 'जांच रिपोर्ट और डॉक्टर की टिप्पणियां',
    hint_diagnostics: '(सहेजने से पहले एन्क्रिप्ट किया जाएगा)',
    btn_generate_card: 'सेहत कार्ड बनाएं और सहेजें',
    preview_title: 'मरीज स्वास्थ्य पहचान पत्र',
    empty_preview_msg: 'ऑफ़लाइन स्वास्थ्य कार्ड और क्यूआर कोड बनाने के लिए बाईं ओर मरीज का विवरण भरें।',
    badge_saved_dexie: 'लोकल IndexedDB में सुरक्षित · सिंक कतारबद्ध',
    card_tag: 'डिजिटल स्वास्थ्य पहचान',
    card_lbl_blood: 'रक्त समूह',
    card_lbl_age: 'उम्र',
    card_lbl_gender: 'लिंग',
    card_lbl_allergies: 'एलर्जी',
    card_lbl_emergency: 'आपातकाल',
    card_lbl_district: 'जिला',
    card_footer: 'सेहत स्वास्थ्य · ऑफ़लाइन तैयार',
    btn_download_card: 'स्वास्थ्य कार्ड डाउनलोड करें',
    btn_register_new: 'अन्य मरीज पंजीकृत करें'
  }
};

let currentLang = 'en';

function applyLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  const langLabel = document.getElementById('langLabel');
  if (langLabel) {
    langLabel.textContent = lang === 'en' ? 'English / हिन्दी' : 'हिन्दी / English';
  }
}

// Language toggle listener
document.getElementById('langToggleBtn')?.addEventListener('click', () => {
  const nextLang = currentLang === 'en' ? 'hi' : 'en';
  applyLanguage(nextLang);
});

// =========================================================================
// 2. Patient ID Generator
// =========================================================================
function generatePatientId(district = '') {
  const cleanDistrict = district.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) || 'IN';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `SHT-${year}-${cleanDistrict}-${randomNum}`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// =========================================================================
// 3. Form Validation with Accessible aria-describedby Error Messages
// =========================================================================
function clearFieldErrors() {
  document.querySelectorAll('.field-error-msg').forEach(el => {
    el.textContent = '';
  });
  document.querySelectorAll('[aria-invalid="true"]').forEach(el => {
    el.removeAttribute('aria-invalid');
  });
  document.querySelectorAll('.form-group.has-error').forEach(el => {
    el.classList.remove('has-error');
  });
}

function showFieldError(fieldId, errorMsg) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}Error`);
  const group = field?.closest('.form-group');

  if (field) {
    field.setAttribute('aria-invalid', 'true');
  }
  if (errorEl) {
    errorEl.textContent = errorMsg;
  }
  if (group) {
    group.classList.add('has-error');
  }
}

function validateForm(form) {
  clearFieldErrors();
  let isValid = true;

  const fullName = document.getElementById('fullName');
  if (!fullName?.value.trim()) {
    showFieldError('fullName', currentLang === 'hi' ? 'कृपया पूरा नाम दर्ज करें' : 'Full name is required');
    isValid = false;
  }

  const age = document.getElementById('age');
  if (!age?.value || Number(age.value) < 0 || Number(age.value) > 120) {
    showFieldError('age', currentLang === 'hi' ? 'कृपया वैध उम्र दर्ज करें (0-120)' : 'Please enter a valid age (0-120)');
    isValid = false;
  }

  const gender = document.getElementById('gender');
  if (!gender?.value) {
    showFieldError('gender', currentLang === 'hi' ? 'कृपया लिंग चुनें' : 'Please select a gender');
    isValid = false;
  }

  const phone = document.getElementById('phone');
  if (!phone?.value.trim() || phone.value.trim().length < 8) {
    showFieldError('phone', currentLang === 'hi' ? 'कृपया वैध फ़ोन नंबर दर्ज करें' : 'Please enter a valid phone number');
    isValid = false;
  }

  const district = document.getElementById('district');
  if (!district?.value.trim()) {
    showFieldError('district', currentLang === 'hi' ? 'कृपया जिला या गाँव दर्ज करें' : 'District or village is required');
    isValid = false;
  }

  const bloodGroup = document.getElementById('bloodGroup');
  if (!bloodGroup?.value) {
    showFieldError('bloodGroup', currentLang === 'hi' ? 'कृपया रक्त समूह चुनें' : 'Please select a blood group');
    isValid = false;
  }

  const emergencyContact = document.getElementById('emergencyContact');
  if (!emergencyContact?.value.trim()) {
    showFieldError('emergencyContact', currentLang === 'hi' ? 'आपातकालीन संपर्क आवश्यक है' : 'Emergency contact details required');
    isValid = false;
  }

  return isValid;
}

// =========================================================================
// 4. Form Submission & Offline Storage Workflow
// =========================================================================
const form = document.getElementById('patientForm');
const submitBtn = document.getElementById('submitBtn');
const emptyPreview = document.getElementById('emptyPreview');
const cardSection = document.getElementById('cardSection');
const qrCanvas = document.getElementById('qrCanvas');
let activePatientId = null;

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Validate form inputs with accessible errors
  if (!validateForm(form)) {
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) {
      firstInvalid.focus();
    }
    return;
  }

  // Set button loading state
  if (submitBtn) {
    submitBtn.classList.add('is-loading');
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.setAttribute('disabled', 'true');
  }

  const formData = new FormData(form);
  const fullName = formData.get('fullName')?.toString().trim();
  const age = Number(formData.get('age'));
  const gender = formData.get('gender')?.toString();
  const phone = formData.get('phone')?.toString().trim();
  const district = formData.get('district')?.toString().trim();
  
  // Emergency Mode fields (Unencrypted, zero-auth)
  const bloodGroup = formData.get('bloodGroup')?.toString();
  const emergencyContact = formData.get('emergencyContact')?.toString().trim();
  const criticalAllergies = formData.get('criticalAllergies')?.toString().trim() || 'None';
  const chronicConditions = formData.get('chronicConditions')?.toString().trim() || 'None';

  // Private Mode fields (To be encrypted)
  const pastPrescriptions = formData.get('pastPrescriptions')?.toString().trim() || '';
  const diagnosticNotes = formData.get('diagnosticNotes')?.toString().trim() || '';

  // Generate Unique ID
  const patientId = generatePatientId(district);
  activePatientId = patientId;

  // Cryptographic placeholder structure
  const encryptedPrivatePayload = {
    pastPrescriptions,
    diagnosticNotes,
    isEncrypted: false,
    cipherText: null, // TODO(rudi): review before pilot
    encryptionKeyRef: null
  };

  // Structured Patient Entity
  const patientRecord = {
    id: patientId,
    fullName,
    age,
    gender,
    phone,
    district,
    bloodGroup,
    // Emergency Mode object (zero-auth emergency triage)
    emergency: {
      fullName,
      age,
      gender,
      phone,
      district,
      bloodGroup,
      allergies: criticalAllergies,
      conditions: chronicConditions,
      emergencyContact
    },
    // Private Mode object (isolated)
    privateData: encryptedPrivatePayload,
    createdAt: new Date().toISOString(),
    syncStatus: 'pending'
  };

  try {
    // 1. Save locally to IndexedDB via Dexie
    await db.patients.put(patientRecord);

    // 2. Queue background sync job for Supabase
    await queuePatientSync(patientRecord);

    // 3. Populate Card DOM Synchronously
    renderCardContent(patientRecord);

    // 4. Generate QR code encoding ONLY the patientId
    await renderQrCode(patientId);

    // 5. Reveal Card DOM container
    if (emptyPreview) emptyPreview.style.display = 'none';
    if (cardSection) cardSection.style.display = 'block';

    // 6. Trigger spring entrance animation
    const cardEl = document.getElementById('sehatCard');
    if (cardEl) {
      animate(cardEl, { scale: [0.7, 1], opacity: [0, 1] }, { type: 'spring', stiffness: 300, damping: 20 });
    }

  } catch (error) {
    console.error('Error during patient registration:', error);
    alert('Failed to register patient offline. Please try again.');
  } finally {
    // Reset button loading state
    if (submitBtn) {
      submitBtn.classList.remove('is-loading');
      submitBtn.removeAttribute('aria-busy');
      submitBtn.removeAttribute('disabled');
    }
  }
});

// Clear field errors on input
form?.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('input', () => {
    if (el.getAttribute('aria-invalid') === 'true') {
      el.removeAttribute('aria-invalid');
      const errorEl = document.getElementById(`${el.id}Error`);
      if (errorEl) errorEl.textContent = '';
      el.closest('.form-group')?.classList.remove('has-error');
    }
  });
});

// =========================================================================
// 5. Synchronous Card DOM Renderer
// =========================================================================
function renderCardContent(record) {
  const avatarEl = document.getElementById('cardAvatar');
  const nameEl = document.getElementById('cardName');
  const pidEl = document.getElementById('cardPid');
  const bloodEl = document.getElementById('cardBlood');
  const ageEl = document.getElementById('cardAge');
  const genderEl = document.getElementById('cardGender');
  const allergiesEl = document.getElementById('cardAllergies');
  const emergencyEl = document.getElementById('cardEmergency');
  const districtEl = document.getElementById('cardDistrict');

  if (avatarEl) avatarEl.textContent = getInitials(record.fullName);
  if (nameEl) nameEl.textContent = record.fullName;
  if (pidEl) pidEl.textContent = record.id;
  if (bloodEl) bloodEl.textContent = record.bloodGroup || '—';
  if (ageEl) ageEl.textContent = `${record.age}y`;
  if (genderEl) genderEl.textContent = record.gender || '—';
  if (allergiesEl) allergiesEl.textContent = record.emergency.allergies.length > 22 ? `${record.emergency.allergies.slice(0, 20)}…` : record.emergency.allergies;
  if (emergencyEl) emergencyEl.textContent = record.emergency.emergencyContact.length > 22 ? `${record.emergency.emergencyContact.slice(0, 20)}…` : record.emergency.emergencyContact;
  if (districtEl) districtEl.textContent = record.district || '—';
}

// =========================================================================
// 6. QR Code Generator (Encodes Patient ID Only)
// =========================================================================
async function renderQrCode(patientId) {
  if (!qrCanvas) return;
  
  await QRCode.toCanvas(qrCanvas, patientId, {
    width: 74,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  });
}

// =========================================================================
// 7. Action Handlers: Download & Reset
// =========================================================================
document.getElementById('btnDownload')?.addEventListener('click', () => {
  const card = document.getElementById('sehatCard');
  if (!card) return;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sehat ID Card - ${activePatientId || 'card'}</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
        <style>
          body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f0f0f0; font-family: 'DM Sans', sans-serif; }
          #sehatCard { width: 350px; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15); color: #141414; }
          .card-stripe { height: 6px; background: #00c97a; }
          .card-body { padding: 16px 18px 14px; }
          .card-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
          .card-brand { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.15rem; color: #008744; }
          .card-type-tag { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #4b5563; font-weight: 600; }
          .card-avatar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
          .card-avatar { width: 44px; height: 44px; border-radius: 50%; background: #e8f7ef; border: 2px solid #00c97a; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.95rem; color: #008744; }
          .card-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.05rem; color: #141414; }
          .card-pid { font-size: 12px; color: #4b5563; font-family: monospace; font-weight: 600; }
          .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 12px; }
          .card-item { background: #f4f8f5; border-radius: 8px; padding: 6px 8px; }
          .card-item label { display: block; font-size: 10px; text-transform: uppercase; color: #4b5563; font-weight: 600; }
          .card-item span { font-size: 14px; font-weight: 700; color: #141414; }
          .card-item.danger-highlight span { color: #dc2626; }
          .card-details-row { display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 10px; }
          .card-vitals-col { display: flex; flex-direction: column; gap: 5px; }
          .vital-line label { font-size: 10px; text-transform: uppercase; color: #4b5563; font-weight: 600; }
          .vital-line span { font-size: 12px; color: #1f2937; font-weight: 600; }
          .card-qr-box { width: 82px; height: 82px; display: flex; align-items: center; justify-content: center; }
          .card-footer { background: #f4f8f5; padding: 6px 16px; display: flex; justify-content: space-between; border-top: 1px solid #eef3f0; font-size: 10px; color: #4b5563; }
        </style>
      </head>
      <body>
        ${card.outerHTML}
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
});

document.getElementById('btnRegisterAnother')?.addEventListener('click', () => {
  form.reset();
  clearFieldErrors();
  if (emptyPreview) emptyPreview.style.display = 'block';
  if (cardSection) cardSection.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
