import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
const B = "https://api-preprod.opisto.fr:8443/v2.15";
const auth = await fetch(B + "/auth/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ CasseId: Number(process.env.OPISTO_CASSE_ID), Username: process.env.OPISTO_USERNAME, Password: process.env.OPISTO_PASSWORD, SecretId: process.env.OPISTO_SECRET_ID }) }).then((r) => r.json());
for (const t of [1, 2, 3, 4, 5]) {
  const r = await fetch(`${B}/vehicles/brands/${t}`, { headers: { Token: auth.AccessToken } });
  const j = await r.json().catch(() => null);
  const list = Array.isArray(j) ? j : [];
  console.log(`type ${t}: ${r.status} ${list.length} marques | avec logo: ${list.filter((b) => b.Logo).length} | ex: ${list.slice(0, 3).map((b) => b.Name + " → " + (b.Logo || "-")).join(" ; ")}`);
}
