if (document.location.hostname !== 'localhost') {
     (function (m, e, t, r, i, k, a) {
          m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) };
          m[i].l = 1 * new Date();
          for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === r) { return; } }
          k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
     })
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

     ym(99497501, "init", {
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true
     });

     (function (src, id) {
          for (var j = 0; j < document.scripts.length; j++) { if (document.scripts[j].src === src) { return; } }
          const script = document.createElement("script");
          script.async = 1;
          script.src = src + '?id=' + id;
          script.onload = () => {
               console.log('sdf');
               window.dataLayer = window.dataLayer || [];
               function gtag() { dataLayer.push(arguments); }
               gtag('js', new Date());
               gtag('config', id);
          }

          const someScript = document.getElementsByTagName("script")[0];
          someScript.parentNode.insertBefore(script, someScript);

     })('https://www.googletagmanager.com/gtag/js', 'G-9ZFMKML10Y');
}