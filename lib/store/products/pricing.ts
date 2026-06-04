export function getConsumerPrice(dbPrice: number | string | { toString(): string }): string {
  const price = typeof dbPrice === "object" ? Number(dbPrice.toString()) : Number(dbPrice);
  if (!price || isNaN(price)) return "0";
  const iva = Math.round(price * 0.19);
  const flowCommission = Math.round((price + iva) * 0.037961);
  return (price + iva + flowCommission).toFixed(0);
}
