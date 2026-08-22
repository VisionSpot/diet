/**
 * خوراک آرا - پنل کاربری احمدی دایت
 * Interactive Dashboard: Water tracker, Meal checkboxes, Weight SVG chart & Telegram sync
 */

const DashboardState = {
  waterDrank: 4,
  waterTotal: 8,
  currentWeight: 78.5,
  targetWeight: 72.0,
  startWeight: 82.0,
  weightHistory: [
    { week: 'هفته ۱', weight: 82.0 },
    { week: 'هفته ۲', weight: 81.2 },
    { week: 'هفته ۳', weight: 80.5 },
    { week: 'هفته ۴', weight: 79.8 },
    { week: 'هفته ۵', weight: 79.1 },
    { week: 'هفته ۶', weight: 78.5 },
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  initWaterTracker();
  initMealCheckers();
  initDashboardActions();
  renderWeightChart();
});

function initWaterTracker() {
  const plusBtn = document.getElementById('water-plus');
  const minusBtn = document.getElementById('water-minus');
  const countEl = document.getElementById('water-count');
  const barEl = document.getElementById('water-progress-bar');

  function updateWaterUI() {
    if (countEl) {
      countEl.textContent = `${toPersianNum(DashboardState.waterTotal)} / ${toPersianNum(DashboardState.waterDrank)}`;
    }
    if (barEl) {
      const pct = Math.min(100, Math.round((DashboardState.waterDrank / DashboardState.waterTotal) * 100));
      barEl.style.width = `${pct}%`;
    }
  }

  if (plusBtn) {
    plusBtn.addEventListener('click', () => {
      if (DashboardState.waterDrank < 16) {
        DashboardState.waterDrank++;
        updateWaterUI();
        showToast(`یک لیوان آب ثبت شد (${toPersianNum(DashboardState.waterDrank)} لیوان تا کنون)`, 'water');
      }
    });
  }

  if (minusBtn) {
    minusBtn.addEventListener('click', () => {
      if (DashboardState.waterDrank > 0) {
        DashboardState.waterDrank--;
        updateWaterUI();
      }
    });
  }

  updateWaterUI();
}

function initMealCheckers() {
  document.querySelectorAll('.meal-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const mealCard = e.target.closest('.meal-card');
      if (mealCard) {
        if (e.target.checked) {
          mealCard.classList.add('opacity-75', 'bg-emerald-50/40');
          showToast('وعده غذایی با موفقیت علامت خورد ✅', 'success');
        } else {
          mealCard.classList.remove('opacity-75', 'bg-emerald-50/40');
        }
      }
    });
  });
}

function initDashboardActions() {
  // Telegram specialist message
  const chatSpecialistBtn = document.getElementById('btn-chat-specialist');
  if (chatSpecialistBtn) {
    chatSpecialistBtn.addEventListener('click', () => {
      const msg = encodeURIComponent(`سلام آقای احمدی / تیم پشتیبانی خوراک آرا، من «علی محمدی» هستم (کد کاربری ۴۰۴). سوالی درباره وعده غذایی امروز داشتم.`);
      window.open(`https://t.me/AhmadiDiet?text=${msg}`, '_blank');
    });
  }

  // Renew subscription
  const renewBtn = document.getElementById('btn-renew-plan');
  if (renewBtn) {
    renewBtn.addEventListener('click', () => {
      openTelegramOrder('تمدید دوره رژیم کاهش وزن استاندارد', '۱,۲۰۰,۰۰۰ تومان', {
        weight: 78.5,
        goal: 'رسیدن به ۷۲ کیلوگرم'
      });
    });
  }
}

function renderWeightChart() {
  const container = document.getElementById('weight-chart-container');
  if (!container) return;

  const data = DashboardState.weightHistory;
  const minW = 77;
  const maxW = 83;
  const width = 500;
  const height = 160;
  const paddingX = 40;
  const paddingY = 25;

  const stepX = (width - paddingX * 2) / (data.length - 1);
  const points = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const norm = (d.weight - minW) / (maxW - minW);
    const y = height - paddingY - norm * (height - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`;
  }, '');

  // Fill area under curve
  const areaD = `${pathD} L ${points[points.length - 1].x},${height - 10} L ${points[0].x},${height - 10} Z`;

  let svgHtml = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible">
      <defs>
        <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#a0f4c8" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#a0f4c8" stop-opacity="0.0" />
        </linearGradient>
      </defs>

      <!-- Background Grid lines -->
      <line x1="20" y1="30" x2="${width - 20}" y2="30" stroke="#dde4e6" stroke-dasharray="3,3" stroke-width="1" />
      <line x1="20" y1="80" x2="${width - 20}" y2="80" stroke="#dde4e6" stroke-dasharray="3,3" stroke-width="1" />
      <line x1="20" y1="130" x2="${width - 20}" y2="130" stroke="#dde4e6" stroke-dasharray="3,3" stroke-width="1" />

      <!-- Area fill -->
      <path d="${areaD}" fill="url(#chartGrad)" />

      <!-- Trend line -->
      <path d="${pathD}" fill="none" stroke="#0e6c4a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Circles & Labels -->
  `;

  points.forEach((p, idx) => {
    svgHtml += `
      <circle cx="${p.x}" cy="${p.y}" r="5" fill="#012d1d" stroke="#ffffff" stroke-width="2" class="cursor-pointer hover:r-7 transition-all">
        <title>${p.week}: ${toPersianNum(p.weight)} کیلوگرم</title>
      </circle>
      <text x="${p.x}" y="${height - 2}" text-anchor="middle" font-size="11" fill="#717973" font-family="Vazirmatn">${p.week}</text>
    `;
  });

  // Y-axis labels
  svgHtml += `
      <text x="15" y="34" font-size="10" fill="#717973" font-family="Vazirmatn">۸۲</text>
      <text x="15" y="84" font-size="10" fill="#717973" font-family="Vazirmatn">۸۰</text>
      <text x="15" y="134" font-size="10" fill="#717973" font-family="Vazirmatn">۷۸</text>
    </svg>
  `;

  container.innerHTML = svgHtml;
}
