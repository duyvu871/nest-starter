// Simple JavaScript for basic interactions
document.addEventListener('DOMContentLoaded', function() {
  console.log('App loaded');

  // Example: Toggle mobile menu (if needed)
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }
});