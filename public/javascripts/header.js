; (function () {
    let lastKnownScrollPosition = 0;
    let ticking = false;
    let panel;

    document.addEventListener('DOMContentLoaded', () => {
         panel = document.getElementsByClassName("header-panel")[0];
         if (!panel) { return; }

         document.addEventListener("scroll", () => {
              lastKnownScrollPosition = window.scrollY;

              if (!ticking) {
                   window.requestAnimationFrame(() => {
                        doSomething(lastKnownScrollPosition);
                        ticking = false;
                   });

                   ticking = true;
              }
         });
    });

    let scrollPos = 0;
    let translateY = 0;
    const maxTranslateY = -57;

    function doSomething(currentScrollPos) {
         if (currentScrollPos > scrollPos) {
              // Scrolling down
              translateY = Math.max(maxTranslateY, translateY - (currentScrollPos - scrollPos));
         } else {
              // Scrolling up
              translateY = Math.min(0, translateY + (scrollPos - currentScrollPos));
         }
         
         scrollPos = currentScrollPos;
         panel.style.transform = `translateY(${translateY}px)`;
    }
})();