; (function () {
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }

    const id = 'G-9ZFMKML10Y';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    script.onload = () => {
        gtag('js', new Date());
        gtag('config', id);
    }

    document.head.appendChild(script);
})();

