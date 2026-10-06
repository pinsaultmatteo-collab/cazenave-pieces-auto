/**
 * Script exécuté avant l'affichage de la page : prépare la balise Google
 * avec le consentement refusé par défaut (mode consentement v2), puis, si le
 * visiteur a déjà accepté, charge la balise et configure GA4 (et Google Ads
 * quand un identifiant est fourni). `window.czGa.apply` sert ensuite au
 * bandeau cookies pour appliquer un nouveau choix sans recharger la page.
 *
 * Les clés de stockage et paramètres masqués reprennent ceux de
 * src/lib/analytics.ts.
 */
export function gtagBootstrap(gaId: string, adsId?: string): string {
  const config = JSON.stringify({ ga: gaId, ads: adsId ?? "" });
  return `(function(){
var C=${config},MAX=182*24*3600*1000;
window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments)}
window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
var done={script:false,ga:false,ads:false};
function clean(h){try{var u=new URL(h);['t','session_id','immat','email'].forEach(function(p){u.searchParams.delete(p)});return u.toString()}catch(e){return h}}
function apply(c){
if(!c)return;
var ads=c.ads?'granted':'denied';
gtag('consent','update',{analytics_storage:c.analytics?'granted':'denied',ad_storage:ads,ad_user_data:ads,ad_personalization:ads});
if(!done.script&&(c.analytics||(C.ads&&c.ads))){done.script=true;gtag('js',new Date());var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+C.ga;document.head.appendChild(s)}
if(c.analytics&&!done.ga){done.ga=true;var o={page_location:clean(location.href)};try{if(localStorage.getItem('cazenave.ga-debug')==='1')o.debug_mode=true}catch(e){}gtag('config',C.ga,o)}
if(C.ads&&c.ads&&!done.ads){done.ads=true;gtag('config',C.ads)}
window.czGaReady=done.ga;
}
window.czGa={apply:apply};
try{var c=JSON.parse(localStorage.getItem('cazenave.consent.v1')||'null');if(c&&Date.now()-new Date(c.date).getTime()<MAX)apply(c)}catch(e){}
})();`;
}
