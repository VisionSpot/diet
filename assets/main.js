/**
 * خوراک آرا (احمدی دایت) - جاوااسکریپت اصلی و تعاملی
 * Main Vanilla JS for Navigation, Telegram Ordering & Utilities
 */

// Persian Number Formatter
function toPersianNum(num) {
  if (num === null || num === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
}

// Telegram Ordering System
const TELEGRAM_CONFIG = {
  username: 'AhmadiDiet', // Change to your Telegram bot or admin username
  channel: 'KhorakAra_Diet',
  supportPhone: '۰۲۱-۸۸۹۹۰۰۱۱',
};

/**
 * Generates and opens a pre-filled Telegram order message
 * @param {string} planTitle
 * @param {string} planPrice
 * @param {object} customData
 */
function openTelegramOrder(planTitle = 'رژیم کاهش وزن حرفه‌ای', planPrice = '۱,۲۰۰,۰۰۰ تومان', customData = {}) {
  let message = `🌿 سلام و درود به تیم خوراک آرا (احمدی دایت)\n`;
  message += `من متقاضی ثبت‌نام و دریافت برنامه زیر هستم:\n\n`;
  message += `📌 نام پکیج: ${planTitle}\n`;
  message += `💰 مبلغ دوره: ${planPrice}\n`;

  if (customData.height) message += `📏 قد: ${toPersianNum(customData.height)} سانتی‌متر\n`;
  if (customData.weight) message += `⚖️ وزن فعلی: ${toPersianNum(customData.weight)} کیلوگرم\n`;
  if (customData.age) message += `🎂 سن: ${toPersianNum(customData.age)} سال\n`;
  if (customData.gender) message += `👤 جنسیت: ${customData.gender === 'female' ? 'خانم' : 'آقا'}\n`;
  if (customData.goal) message += `🎯 هدف اصلی: ${customData.goal}\n`;
  if (customData.bmi) message += `📊 شاخص BMI: ${toPersianNum(customData.bmi)}\n`;

  message += `\nلطفاً راهنمایی‌های لازم جهت پرداخت و شروع اختصاصی رژیم را ارسال فرمایید. سپاسگزارم 🙏`;

  const encoded = encodeURIComponent(message);
  const telegramUrl = `https://t.me/${TELEGRAM_CONFIG.username}?text=${encoded}`;
  
  // Show notification then open
  showToast(`در حال اتصال به تلگرام جهت سفارش «${planTitle}»...`, 'info');
  setTimeout(() => {
    window.open(telegramUrl, '_blank');
  }, 400);
}

/**
 * Toast Notification system
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'check_circle';
  if (type === 'info') icon = 'info';
  if (type === 'error') icon = 'error';
  if (type === 'water') icon = 'water_drop';

  toast.innerHTML = `
    <span class="material-symbols-outlined filled text-secondary-container" style="color: #a0f4c8;">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Mobile Menu Drawer Handler
document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenuBtn = document.getElementById('close-mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
      setTimeout(() => {
        mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
      }, 10);
    });

    if (closeMenuBtn) {
      closeMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => {
          mobileMenu.classList.add('hidden');
        }, 300);
      });
    }
  }

  // Auto-convert static numbers marked with .persian-num
  document.querySelectorAll('.persian-num').forEach(el => {
    el.textContent = toPersianNum(el.textContent);
  });
});
