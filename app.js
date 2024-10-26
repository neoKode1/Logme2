const { sendEmail } = require('./public/scripts/emailService');

function adjustForMobile() {
  if (window.innerWidth <= 768) {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      table.classList.add('mobile-friendly');
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializePage();
  adjustForMobile();
});

window.addEventListener('resize', adjustForMobile);
