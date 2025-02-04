self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Sadece "devnar.github.io/masa" altındaki dosyaları yakala
  if (url.pathname.startsWith("/masa")) {
      event.respondWith(
          caches.match(event.request).then((response) => {
              return response || fetch(event.request);
          })
      );
  }
});
