// ============================
// Analytics / Consent (Clarity)
// ============================
const CLARITY_ID = "vbu06v2068"; // DEV (cámbialo por el ID del proyecto TFM cuando toque)

function loadClarity() {
  (function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", CLARITY_ID);
}

function setConsent(value) {
  localStorage.setItem("analytics_consent", value ? "yes" : "no");
  const banner = document.getElementById("consentBanner");
  if (banner) banner.style.display = "none";
  if (value) {
    loadClarity();
  }
}
window.setConsent = setConsent;

window.addEventListener("load", () => {
  const consent = localStorage.getItem("analytics_consent");
  if (consent === "yes") {
    loadClarity();
    return;
  }
  if (consent === "no") {
    return;
  }
  const banner = document.getElementById("consentBanner");
  if (banner) banner.style.display = "block";
});

// ============================
// Conversion tracking helper
// ============================
function trackConversion(name) {
  // 1) Clarity (si está cargado y el usuario aceptó)
  try {
    if (typeof clarity === "function") {
      clarity("event", name);
    }
  } catch (e) {}

  // 2) Google Analytics (si gtag está disponible)
  try {
    if (typeof gtag === "function") {
      gtag("event", name, {
        event_category: "conversion",
        event_label: name,
      });
    }
  } catch (e) {}
}
window.trackConversion = trackConversion;

// ============================
// Form submit -> Power Automate
// ============================
window.addEventListener("load", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  // ⬇️ Pega aquí la URL de tu Flow (When an HTTP request is received)
  const FLOW_URL = "https://default281412e02f0e4e2b87901e1d44ea0a.80.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/a3b28c53d36e47a597f6ec30ed1d1c3a/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=5T5R9C2eCVbCHyy5s31zQJEISJyxpFuWWt2bwUwn4N8";

  // helper: convertir FormData a objeto
  const formToObject = (f) => {
    const fd = new FormData(f);
    const obj = {};
    for (const [k, v] of fd.entries()) {
      // Si el campo es checkbox, FormData suele devolver "on" cuando está marcado
      if (obj[k] !== undefined) {
        // por si hubiera campos repetidos
        if (!Array.isArray(obj[k])) obj[k] = [obj[k]];
        obj[k].push(v);
      } else {
        obj[k] = typeof v === "string" ? v.trim() : v;
      }
    }
    return obj;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1) Leer token de hCaptcha (hCaptcha lo escribe aquí al completarlo)
    const tokenField = form.querySelector('textarea[name="h-captcha-response"]');
    const token = tokenField ? tokenField.value.trim() : "";

    if (!token) {
      alert("Por favor, completa el captcha antes de reservar/enviar.");
      return;
    }

    // 2) Construir payload con TODOS los campos del formulario
    const payload = formToObject(form);

    // normalizar checkbox "consentimiento" si existe
    if ("consentimiento" in payload) {
      // Si está marcado: "on". Si no, no existe en FormData.
      payload.consentimiento = payload.consentimiento === "on" || payload.consentimiento === true;
    }

    // 3) Añadir token al payload con un nombre claro
    payload.hcaptchaToken = token;

    // 4) Validación mínima (al menos teléfono o email si existen)
    // (Si tu formulario no tiene esos campos, no pasa nada)
    const telefono = (payload.telefono || "").toString().trim();
    const email = (payload.email || "").toString().trim();
    if (("telefono" in payload || "email" in payload) && !telefono && !email) {
      alert("Indica al menos teléfono o email para poder contactarte.");
      return;
    }

    // 5) Enviar al Flow
    try {
      const r = await fetch(FLOW_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Intentar leer JSON si existe
      const text = await r.text();
      let res = {};
      if (text) {
        try {
          res = JSON.parse(text);
        } catch {
          res = { raw: text };
        }
      }

      if (!r.ok || res.ok === false) {
        alert("No se ha podido enviar. Revisa el captcha e inténtalo de nuevo.");
        return;
      }

      // conversión OK
      if (typeof window.trackConversion === "function") {
        window.trackConversion("reserva_submit_ok");
      }

      alert("¡Solicitud recibida! Te contactaremos para confirmar la reserva.");

      // reset captcha para permitir re-enviar
      if (window.hcaptcha && typeof window.hcaptcha.reset === "function") {
        window.hcaptcha.reset();
      }

      // limpiar formulario
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Error de red/CORS. Inténtalo de nuevo.");
    }
  });
});
