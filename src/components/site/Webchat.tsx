"use client";

import { useEffect, useState } from "react";
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

/** Le bouton rond de Locomotive n'a pas de nom : on lui en donne un pour les lecteurs d'écran (accessibilité). */
const LABEL_BUTTON = `(function(){var n=0,t=setInterval(function(){var r=document.getElementById("loco-webchat"),s=r&&r.shadowRoot,b=(s&&s.getElementById("loco-webchat-message-button"))||document.getElementById("loco-webchat-message-button");if(b){b.setAttribute("aria-label","Ouvrir la discussion avec notre équipe");clearInterval(t)}else if(++n>60){clearInterval(t)}},1000)})();`;

/** Délai de chargement du chat sans geste du visiteur. */
const LOAD_AFTER_MS = 4000;
const FIRST_GESTURES = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

/**
 * Assistant de discussion Locomotive (bulle en bas de l'écran). Son script
 * (≈ 95 Ko, le plus lourd de la page) n'est chargé qu'au premier geste du
 * visiteur ou au bout de 4 secondes, pour laisser passer d'abord la page.
 */
export function Webchat() {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const go = () => setLoad(true);
    const t = window.setTimeout(go, LOAD_AFTER_MS);
    for (const e of FIRST_GESTURES) window.addEventListener(e, go, { once: true, passive: true });
    return () => {
      window.clearTimeout(t);
      for (const e of FIRST_GESTURES) window.removeEventListener(e, go);
    };
  }, []);

  // Attribut propre à Locomotive, transmis tel quel à la balise <script>.
  const attrs: Record<string, string> = { webchatconfigid: WEBCHAT_CONFIG_ID };
  return (
    <>
      <Script id="loco-webchat-teaser" strategy="afterInteractive">
        {REOPEN_TEASER + LABEL_BUTTON}
      </Script>
      {load && <Script id="loco-webchat-script" src="https://webchat.locomotive.eu/webchat/widget/index.js" strategy="afterInteractive" {...attrs} />}
    </>
  );
}
