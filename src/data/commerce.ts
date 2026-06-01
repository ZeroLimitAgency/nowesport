import { collectionItems } from "@/data/site";

export const cartLines = collectionItems.slice(0, 2).map((product, index) => ({
  product,
  quantity: index === 0 ? 1 : 2,
  size: index === 0 ? "M" : "L",
  customization: index === 0 ? "NOW 26" : "Sans flocage",
}));

export const orderSteps = [
  "Commande reçue",
  "Paiement validé",
  "Préparation atelier",
  "Expédition",
];

export const accountOrders = [
  {
    id: "NOW-2603-001",
    status: "Préparation",
    paymentStatus: "Payé",
    total: "49,99 EUR",
    createdAt: "03/03/2026",
    tracking: "Atelier merch",
  },
  {
    id: "NOW-2602-014",
    status: "Livré",
    paymentStatus: "Payé",
    total: "34,00 EUR",
    createdAt: "21/02/2026",
    tracking: "Colis remis au client",
  },
];

export const profileFields = [
  { label: "Identité", value: "Pseudo, nom, prénom" },
  { label: "Contact", value: "E-mail de connexion et support" },
  { label: "Préférences", value: "Tailles, flocage, notifications" },
  { label: "Sécurité", value: "Session Supabase et déconnexion" },
];

export function getMockCartTotal() {
  return cartLines.reduce((total, line) => {
    const normalized = line.product.price.replace(/[^\d,]/g, "").replace(",", ".");
    return total + Number(normalized) * line.quantity;
  }, 0);
}
