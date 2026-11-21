export function totalOf(order: any): number {
  let total = 0;
  for (const item of order.items) {
    total += item.price * item.qty;
  }
  if (order.coupon) {
    total -= order.coupon.type === 'percent' ? (total * order.coupon.value) / 100 : order.coupon.value;
  }
  return Math.max(0, total);
}

export function labelOf(order: any): string {
  // @ts-ignore
  return `${order.customer.name} (${order.items.length} itens)`;
}
