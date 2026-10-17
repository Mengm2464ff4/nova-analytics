(function () {
  const script = document.currentScript;
  const siteId = script?.getAttribute("data-site");
  const endpoint = script?.getAttribute("data-endpoint") || "/api/track";

  if (!siteId || siteId === "undefined") {
    console.warn("[Nova Analytics] Missing data-site");
    return;
  }

  let visitorId = localStorage.getItem("na_vid");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("na_vid", visitorId);
  }

  function sendPageview() {
    const payload = {
      siteId: siteId,
      visitorId: visitorId,
      type: "pageview",
      url: location.href,
      path: location.pathname + location.search,
      title: document.title,
      referrer: document.referrer || undefined,
      screenW: window.screen.width,
      screenH: window.screen.height,
    };

    fetch(endpoint, {         // ← ប្រើ endpoint variable
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }

  if (document.readyState === "complete") {
    sendPageview();
  } else {
    window.addEventListener("load", sendPageview);
  }
})();