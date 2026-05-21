import Swal from 'sweetalert2';

function lockScroll() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.documentElement.style.setProperty('--scroll-lock-offset', `${scrollbarWidth}px`);
  }
}

function unlockScroll() {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  document.documentElement.style.removeProperty('--scroll-lock-offset');
}

export default Swal.mixin({
  scrollbarPadding: false,
  willOpen: lockScroll,
  didClose: unlockScroll,
});
