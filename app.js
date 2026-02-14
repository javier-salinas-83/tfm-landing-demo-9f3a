const CLARITY_ID = "vfp3qzaoit"; // DEV (cámbialo por el ID del proyecto TFM cuando toque)

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
