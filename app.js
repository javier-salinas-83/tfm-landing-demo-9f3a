const CLARITY_ID = "vbu06v2068"; // DEV (cámbialo por el ID del proyecto TFM cuando toque)

function loadClarity(){
  (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", CLARITY_ID);
}

function setConsent(value){
  localStorage.setItem("analytics_consent", value ? "yes" : "no");
  const banner = document.getElementById("consentBanner");
  if(banner) banner.style.display = "none";
  if(value){ loadClarity(); }
}

window.addEventListener("load", () => {
  const consent = localStorage.getItem("analytics_consent");
  if(consent === "yes"){ loadClarity(); return; }
  if(consent === "no"){ return; }
  const banner = document.getElementById("consentBanner");
  if(banner) banner.style.display = "block";
});

function trackConversion(name){
  // 1) Clarity (si está cargado y el usuario aceptó)
  try{
    if(typeof clarity === "function"){
      clarity("event", name);
    }
  }catch(e){}

  // 2) Google Analytics (si gtag está disponible)
  try{
    if(typeof gtag === "function"){
      gtag("event", name, {
        event_category: "conversion",
        event_label: name
      });
    }
  }catch(e){}
}
// --- Validación hCaptcha en formulario de contacto (modo automático) ---
window.addEventListener("load", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // hCaptcha automático deja el token aquí:
    const tokenField = form.querySelector('textarea[name="h-captcha-response"]');
    const token = tokenField ? tokenField.value.trim() : "";

    if (!token) {
      alert("Por favor, completa el captcha antes de enviar.");
      return;
    }

    // OK: ahora sí contamos la conversión
    if (typeof window.trackConversion === "function") {
      window.trackConversion("contact_form_submit");
    }

    alert("Demo: formulario validado con captcha (no envía datos).");

    // (Opcional) resetear captcha para permitir re-enviar
    if (window.hcaptcha && typeof window.hcaptcha.reset === "function") {
      window.hcaptcha.reset();
    }

    // (Opcional) limpiar campos
    // form.reset();
  });
});
