/**
 * خوراک آرا - ماژول ارزیابی هوشمند و گام‌به‌گام بدن
 * Smart Interactive Body Assessment Stepper & Scientific Calculator
 */

const AssessmentState = {
  currentStep: 1,
  totalSteps: 5,
  gender: 'female',
  age: 28,
  height: 170,
  weight: 70,
  targetWeight: 62,
  activityLevel: 1.375, // light active
  activityLabel: 'فعالیت سبک (۱ الی ۳ روز ورزش سبک)',
  goal: 'weight_loss',
  goalLabel: 'کاهش وزن و چربی‌سوزی اصولی',
  dietPreference: 'balanced',
  dietLabel: 'رژیم متعادل سفره ایرانی',
  allergies: [],
  
  // Computed results
  bmi: 24.2,
  bmiStatus: 'نرمال (مستعد اضافه وزن خفیف)',
  bmr: 1480,
  tdee: 2035,
  targetCalories: 1550,
  waterNeeds: 2.5,
  proteinNeeds: 85,
  recommendedPlan: 'پلن ۳ ماهه کاهش وزن تخصصی',
  recommendedPrice: '۱,۲۰۰,۰۰۰ تومان'
};

document.addEventListener('DOMContentLoaded', () => {
  initSliders();
  initRadioOptions();
  initNavButtons();
  updateProgressUI();
});

function initSliders() {
  const heightSlider = document.getElementById('height-slider');
  const heightVal = document.getElementById('height-val');
  const weightSlider = document.getElementById('weight-slider');
  const weightVal = document.getElementById('weight-val');
  const ageInput = document.getElementById('age-input');

  if (heightSlider && heightVal) {
    heightSlider.addEventListener('input', (e) => {
      AssessmentState.height = parseInt(e.target.value);
      heightVal.textContent = toPersianNum(AssessmentState.height);
      calculateLiveMetrics();
    });
  }

  if (weightSlider && weightVal) {
    weightSlider.addEventListener('input', (e) => {
      AssessmentState.weight = parseInt(e.target.value);
      weightVal.textContent = toPersianNum(AssessmentState.weight);
      calculateLiveMetrics();
    });
  }

  if (ageInput) {
    ageInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (val >= 14 && val <= 90) {
        AssessmentState.age = val;
        calculateLiveMetrics();
      }
    });
  }
}

function initRadioOptions() {
  // Gender
  document.querySelectorAll('input[name="gender"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      AssessmentState.gender = e.target.value;
      calculateLiveMetrics();
    });
  });

  // Goal
  document.querySelectorAll('input[name="goal"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      AssessmentState.goal = e.target.value;
      const labelEl = e.target.closest('label')?.querySelector('.goal-title');
      if (labelEl) AssessmentState.goalLabel = labelEl.textContent.trim();
      calculateLiveMetrics();
    });
  });

  // Activity
  document.querySelectorAll('input[name="activity"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      AssessmentState.activityLevel = parseFloat(e.target.value);
      const labelEl = e.target.closest('label')?.querySelector('.activity-title');
      if (labelEl) AssessmentState.activityLabel = labelEl.textContent.trim();
      calculateLiveMetrics();
    });
  });

  // Diet preference
  document.querySelectorAll('input[name="diet_pref"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      AssessmentState.dietPreference = e.target.value;
      const labelEl = e.target.closest('label')?.querySelector('.diet-title');
      if (labelEl) AssessmentState.dietLabel = labelEl.textContent.trim();
      calculateLiveMetrics();
    });
  });
}

function initNavButtons() {
  const nextBtn = document.getElementById('next-step-btn');
  const prevBtn = document.getElementById('prev-step-btn');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (AssessmentState.currentStep < AssessmentState.totalSteps) {
        goToStep(AssessmentState.currentStep + 1);
      } else {
        // Final action: Telegram Order
        orderAssessmentPlan();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (AssessmentState.currentStep > 1) {
        goToStep(AssessmentState.currentStep - 1);
      }
    });
  }
}

function goToStep(stepNumber) {
  // Hide current step
  const currentEl = document.getElementById(`step-${AssessmentState.currentStep}`);
  if (currentEl) {
    currentEl.classList.remove('active');
  }

  AssessmentState.currentStep = stepNumber;

  // Show new step
  const nextEl = document.getElementById(`step-${AssessmentState.currentStep}`);
  if (nextEl) {
    nextEl.classList.add('active');
  }

  if (stepNumber === 5) {
    calculateLiveMetrics();
    renderAnalysisResults();
  }

  updateProgressUI();
  window.scrollTo({ top: 120, behavior: 'smooth' });
}

function updateProgressUI() {
  const progressBar = document.getElementById('progress-bar');
  const prevBtn = document.getElementById('prev-step-btn');
  const nextBtn = document.getElementById('next-step-btn');
  const nextBtnText = document.getElementById('next-btn-text');

  // Update progress bar width
  const percent = ((AssessmentState.currentStep - 1) / (AssessmentState.totalSteps - 1)) * 100;
  if (progressBar) {
    progressBar.style.width = `${Math.max(8, percent)}%`;
  }

  // Update step indicators
  document.querySelectorAll('[data-step-indicator]').forEach(ind => {
    const s = parseInt(ind.getAttribute('data-step-indicator'));
    ind.classList.remove('step-completed', 'step-active', 'pulse-step', 'bg-primary-container', 'text-white', 'border-primary-container');
    
    if (s < AssessmentState.currentStep) {
      ind.classList.add('step-completed', 'bg-primary-container', 'text-white', 'border-primary-container');
      ind.innerHTML = `<span class="material-symbols-outlined text-[18px]">check</span>`;
    } else if (s === AssessmentState.currentStep) {
      ind.classList.add('step-active', 'pulse-step');
      ind.style.borderColor = '#1b4332';
      ind.style.backgroundColor = '#d8f3dc';
      ind.style.color = '#012d1d';
    } else {
      ind.style.borderColor = '#dde4e6';
      ind.style.backgroundColor = '#ffffff';
      ind.style.color = '#717973';
    }
  });

  // Toggle prev button visibility
  if (prevBtn) {
    if (AssessmentState.currentStep === 1) {
      prevBtn.classList.add('opacity-40', 'pointer-events-none');
    } else {
      prevBtn.classList.remove('opacity-40', 'pointer-events-none');
    }
  }

  // Button text
  if (nextBtnText) {
    if (AssessmentState.currentStep === AssessmentState.totalSteps) {
      nextBtnText.textContent = 'ثبت‌نام و دریافت برنامه در تلگرام';
      if (nextBtn) {
        nextBtn.classList.add('bg-secondary', 'hover:bg-primary');
      }
    } else {
      nextBtnText.textContent = 'مرحله بعد';
    }
  }
}

function calculateLiveMetrics() {
  const hM = AssessmentState.height / 100;
  const wKg = AssessmentState.weight;
  
  // BMI
  const rawBmi = wKg / (hM * hM);
  AssessmentState.bmi = Math.round(rawBmi * 10) / 10;

  if (AssessmentState.bmi < 18.5) {
    AssessmentState.bmiStatus = 'کمبود وزن (نیازمند دریافت کالری مازاد)';
  } else if (AssessmentState.bmi < 24.9) {
    AssessmentState.bmiStatus = 'وزن متناسب و نرمال';
  } else if (AssessmentState.bmi < 29.9) {
    AssessmentState.bmiStatus = 'اضافه‌وزن (نیاز به اصلاح الگوی تغذیه)';
  } else {
    AssessmentState.bmiStatus = 'چاقی درجه یک / دو (نیاز به مدیریت بالینی کالری)';
  }

  // BMR (Mifflin-St Jeor)
  let bmrVal = (10 * wKg) + (6.25 * AssessmentState.height) - (5 * AssessmentState.age);
  if (AssessmentState.gender === 'male') {
    bmrVal += 5;
  } else {
    bmrVal -= 161;
  }
  AssessmentState.bmr = Math.round(bmrVal);

  // TDEE
  AssessmentState.tdee = Math.round(AssessmentState.bmr * AssessmentState.activityLevel);

  // Calorie targets according to goal
  if (AssessmentState.goal === 'weight_loss') {
    AssessmentState.targetCalories = Math.max(1200, AssessmentState.tdee - 500);
    AssessmentState.recommendedPlan = 'پلن ۳ ماهه کاهش وزن حرفه‌ای';
    AssessmentState.recommendedPrice = '۱,۲۰۰,۰۰۰ تومان';
  } else if (AssessmentState.goal === 'muscle_gain') {
    AssessmentState.targetCalories = AssessmentState.tdee + 350;
    AssessmentState.recommendedPlan = 'پلن ۳ ماهه عضله‌سازی و تناسب';
    AssessmentState.recommendedPrice = '۱,۳۵۰,۰۰۰ تومان';
  } else if (AssessmentState.goal === 'fatty_liver') {
    AssessmentState.targetCalories = AssessmentState.tdee - 300;
    AssessmentState.recommendedPlan = 'پلن درمانی پاکسازی کبد چرب و سم‌زدایی';
    AssessmentState.recommendedPrice = '۱,۱۰۰,۰۰۰ تومان';
  } else {
    AssessmentState.targetCalories = AssessmentState.tdee;
    AssessmentState.recommendedPlan = 'پلن تثبیت وزن و اصلاح الگوی غذایی';
    AssessmentState.recommendedPrice = '۹۸۰,۰۰۰ تومان';
  }

  // Water needs (35ml per kg)
  AssessmentState.waterNeeds = Math.round((wKg * 0.033) * 10) / 10;
  // Protein (1.4g to 1.8g per kg)
  AssessmentState.proteinNeeds = Math.round(wKg * 1.5);
}

function renderAnalysisResults() {
  const bmiEl = document.getElementById('res-bmi');
  const bmiStatusEl = document.getElementById('res-bmi-status');
  const bmrEl = document.getElementById('res-bmr');
  const tdeeEl = document.getElementById('res-tdee');
  const calEl = document.getElementById('res-cal');
  const waterEl = document.getElementById('res-water');
  const proteinEl = document.getElementById('res-protein');
  const planEl = document.getElementById('res-plan');
  const priceEl = document.getElementById('res-price');

  if (bmiEl) bmiEl.textContent = toPersianNum(AssessmentState.bmi);
  if (bmiStatusEl) bmiStatusEl.textContent = AssessmentState.bmiStatus;
  if (bmrEl) bmrEl.textContent = toPersianNum(AssessmentState.bmr) + ' کالری';
  if (tdeeEl) tdeeEl.textContent = toPersianNum(AssessmentState.tdee) + ' کالری';
  if (calEl) calEl.textContent = toPersianNum(AssessmentState.targetCalories) + ' کالری';
  if (waterEl) waterEl.textContent = toPersianNum(AssessmentState.waterNeeds) + ' لیتر (حدود ' + toPersianNum(Math.round(AssessmentState.waterNeeds * 4)) + ' لیوان)';
  if (proteinEl) proteinEl.textContent = toPersianNum(AssessmentState.proteinNeeds) + ' گرم در روز';
  if (planEl) planEl.textContent = AssessmentState.recommendedPlan;
  if (priceEl) priceEl.textContent = AssessmentState.recommendedPrice;
}

function orderAssessmentPlan() {
  openTelegramOrder(AssessmentState.recommendedPlan, AssessmentState.recommendedPrice, {
    height: AssessmentState.height,
    weight: AssessmentState.weight,
    age: AssessmentState.age,
    gender: AssessmentState.gender,
    goal: AssessmentState.goalLabel,
    bmi: AssessmentState.bmi
  });
}
