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
  try{
    if(typeof clarity === "function"){
      clarity("event", name);
    }
  }catch(e){}
}
function trackConversion(eventName){
  // GA4
  if (typeof gtag === "function") {
    gtag("event", eventName);
  }
  // (opcional) Clarity
  if (typeof clarity === "function") {
    clarity("event", eventName);
  }
}
