import { formatDate, formatMAD, type Quote } from "./data";

export function quoteTotals(q: Pick<Quote, "unitPrice" | "quantity" | "discount" | "delivery" | "vat">) {
  const gross = q.unitPrice * q.quantity;
  const discountAmount = (gross * q.discount) / 100;
  const subtotal = gross - discountAmount + q.delivery;
  const vatAmount = (subtotal * q.vat) / 100;
  return { gross, discountAmount, subtotal, vatAmount, total: subtotal + vatAmount };
}

/** Standalone printable HTML for a quote (used in preview iframe + PDF download). */
export function quoteDocumentHtml(q: Quote): string {
  const t = quoteTotals(q);
  const row = (label: string, value: string, strong = false) =>
    `<div class="row${strong ? " strong" : ""}"><span>${label}</span><span>${value}</span></div>`;

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<title>Devis ${q.id} — CENTRE 3D</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#eef1ee;font-family:"Helvetica Neue",Arial,sans-serif;color:#16211a}
  .page{width:210mm;min-height:297mm;margin:0 auto;background:#fff;padding:16mm 15mm;display:flex;flex-direction:column}
  header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2f7d43;padding-bottom:14px}
  .brand{font-size:26px;font-weight:800;letter-spacing:.14em;color:#2f7d43}
  .brand small{display:block;font-size:10px;letter-spacing:.18em;color:#6b7a70;font-weight:600;margin-top:4px}
  .doc{text-align:right}
  .doc h1{margin:0;font-size:20px;letter-spacing:.1em;text-transform:uppercase}
  .doc p{margin:3px 0;font-size:11px;color:#6b7a70}
  .parties{display:flex;gap:14px;margin:22px 0}
  .card{flex:1;border:1px solid #dbe3dd;border-radius:8px;padding:12px 14px}
  .card h2{margin:0 0 6px;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#6b7a70}
  .card p{margin:2px 0;font-size:12px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  th{background:#f2f6f2;text-align:left;padding:9px 10px;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#4d5c53}
  td{padding:11px 10px;border-bottom:1px solid #e6ece7}
  .num{text-align:right}
  .totals{margin-left:auto;width:78mm;margin-top:18px;font-size:12px}
  .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #e2e8e3}
  .row span:first-child{color:#6b7a70}
  .row.strong{border-bottom:none;border-top:2px solid #2f7d43;margin-top:6px;padding-top:10px;font-size:15px;font-weight:800;color:#2f7d43}
  .terms{margin-top:26px;font-size:11px;color:#4d5c53;line-height:1.6}
  footer{margin-top:auto;border-top:1px solid #dbe3dd;padding-top:10px;font-size:9.5px;color:#8a978e;text-align:center}
  @media print{body{background:#fff}.page{width:auto;min-height:auto;padding:12mm}@page{size:A4;margin:0}}
</style></head>
<body><div class="page">
  <header>
    <div class="brand">CENTRE 3D<small>MACHINES &amp; ÉQUIPEMENTS AGRICOLES</small></div>
    <div class="doc">
      <h1>Devis ${q.id}</h1>
      <p>Date : ${formatDate(q.createdAt)}</p>
      <p>Valable jusqu'au : ${formatDate(q.validUntil)}</p>
      <p>Statut : ${q.status}</p>
    </div>
  </header>

  <div class="parties">
    <div class="card">
      <h2>Émetteur</h2>
      <p><strong>CENTRE 3D SARL</strong></p>
      <p>Zone industrielle Sidi Ghanem, Marrakech, Maroc</p>
      <p>contact@centre3d.ma · +212 5 24 00 00 00</p>
      <p>Conseiller : ${q.rep}</p>
    </div>
    <div class="card">
      <h2>Client</h2>
      <p><strong>${q.company}</strong></p>
      <p>${q.clientName}</p>
      <p>Réf. client : ${q.clientId}</p>
    </div>
  </div>

  <table>
    <thead><tr><th>Désignation</th><th class="num">Qté</th><th class="num">PU HT</th><th class="num">Remise</th><th class="num">Total HT</th></tr></thead>
    <tbody>
      <tr>
        <td><strong>${q.machineName}</strong><br /><span style="color:#6b7a70">Réf. ${q.machineId} · garantie constructeur incluse</span></td>
        <td class="num">${q.quantity}</td>
        <td class="num">${formatMAD(q.unitPrice)}</td>
        <td class="num">${q.discount} %</td>
        <td class="num">${formatMAD(t.gross - t.discountAmount)}</td>
      </tr>
      <tr>
        <td>Transport et mise en service</td>
        <td class="num">1</td>
        <td class="num">${formatMAD(q.delivery)}</td>
        <td class="num">0 %</td>
        <td class="num">${formatMAD(q.delivery)}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    ${row("Total brut HT", formatMAD(t.gross))}
    ${row(`Remise (${q.discount} %)`, `- ${formatMAD(t.discountAmount)}`)}
    ${row("Livraison", formatMAD(q.delivery))}
    ${row("Sous-total HT", formatMAD(t.subtotal))}
    ${row(`TVA (${q.vat} %)`, formatMAD(t.vatAmount))}
    ${row("Total TTC", formatMAD(t.total), true)}
  </div>

  <div class="terms">
    <strong>Conditions de paiement :</strong> ${q.paymentTerms}<br />
    <strong>Délai de livraison :</strong> 2 à 6 semaines selon disponibilité en dépôt.<br />
    Devis valable 30 jours. Prix en dirhams marocains, TVA en vigueur au Maroc.
  </div>

  <footer>CENTRE 3D SARL · RC Marrakech · ICE 0027 4512 0000 · Devis ${q.id} généré le ${formatDate(new Date().toISOString())}</footer>
</div></body></html>`;
}

/** Opens the print dialog on the document so the user can save it as PDF. */
export function downloadQuotePdf(q: Quote) {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return false;
  win.document.write(quoteDocumentHtml(q));
  win.document.close();
  win.document.title = `Devis-${q.id}-CENTRE-3D`;
  win.focus();
  setTimeout(() => win.print(), 400);
  return true;
}
