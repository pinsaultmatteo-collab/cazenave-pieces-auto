import Script from "next/script";

/** Identifiant de configuration fourni par Locomotive pour le site Cazenave. */
const WEBCHAT_CONFIG_ID = "497fda1b-e1bc-49d9-a05c-76de44b770d5";

/**
 * Locomotive affiche une bulle « Une question ? » 5 secondes après son
 * chargement, mais la masque définitivement (localStorage) dès que le
 * visiteur a ouvert le chat une fois. On la réactive à chaque nouvelle
 * visite : fermée, elle reste fermée jusqu'à la fin de la visite.
 */
const REOPEN_TEASER = `try{if(!sessionStorage.getItem("cz-webchat-visit")){sessionStorage.setItem("cz-webchat-visit","1");localStorage.removeItem("loco-webchat-bubble-closed")}}catch(e){}`;

/**
 * Assistant de discussion Locomotive (bulle en bas de l'écran), chargé une
 * fois la page affichée pour ne pas ralentir le site.
 */
export function Webchat() {
  // Attribut propre à Locomotive, transmis tel quel à la balise <script>.
  const attrs: Record<string, string> = { webchatconfigid: WEBCHAT_CONFIG_ID };
  return (
    <>
      <Script id="loco-webchat-teaser" strategy="afterInteractive">
        {REOPEN_TEASER}
      </Script>
      <Script id="loco-webchat-script" src="https://webchat.locomotive.eu/webchat/widget/index.js" strategy="lazyOnload" {...attrs} />
    </>
  );
}
