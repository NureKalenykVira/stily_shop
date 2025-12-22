import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartProductCardComponent } from '../../components/cart-product-card/cart-product-card.component';

type CartLine = {
  id: number; name: string; price: number;
  image?: string; size?: string; color?: string; quantity?: number;
  status?: string;
};

type DeliveryState = {
  methodId: string;
  methodLabel?: string;
  price: number;
  pickupPoint: { id: string; name: string } | null;
  address: {
    firstName: string; lastName: string; street: string; house: string; flat?: string;
    zip: string; city: string; phone: string; isDefault: boolean;
  }
} | null;

@Component({
  standalone: true,
  selector: 'app-checkout-success',
  imports: [CommonModule, RouterModule, CartProductCardComponent],
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.scss']
})
export class CheckoutSuccessComponent implements OnInit {
  orderId: string = '';
  items: CartLine[] = [];
  delivery: DeliveryState = null;
  paymentMethod: 'cod'|'card'|'paypal'|'unknown' = 'unknown';

  constructor(
      private router: Router,
    ) {}

  get itemsTotal(): number {
    return this.items.reduce((s, p) => s + p.price * (p.quantity || 1), 0);
  }
  get deliveryPrice(): number {
    return this.delivery?.price ?? 0;
  }
  get grandTotal(): number {
    return this.itemsTotal + this.deliveryPrice;
  }

  ngOnInit(): void {
    // 1) Дістаємо метадані замовлення
    const metaRaw = sessionStorage.getItem('orderMeta');
    const meta = metaRaw ? JSON.parse(metaRaw) as { orderId?: string|number; method?: string } : null;

    // Порядок пріоритетів: history.state → sessionStorage → згенерувати
    const state = history.state as any;
    this.orderId = (state?.orderId ?? meta?.orderId ?? this.generateOrderId()).toString();
    this.paymentMethod = (state?.method ?? meta?.method ?? 'unknown') as any;

    // 2) Товари (копія кошика на момент оформлення)
    const itemsRaw = sessionStorage.getItem('lastCart');
    this.items = itemsRaw ? (JSON.parse(itemsRaw) as CartLine[]) : [];

    // 3) Доставка/адреса
    const delRaw = sessionStorage.getItem('checkoutDelivery');
    this.delivery = delRaw ? (JSON.parse(delRaw) as DeliveryState) : null;
  }

  private generateOrderId(): string {
    return (Math.floor(Math.random() * 90000) + 10000).toString();
  }

  formatAddress(): string {
    const a = this.delivery?.address;
    if (!a) return '';
    const flat = a.flat ? `, кв. ${a.flat}` : '';
    return `${a.firstName} ${a.lastName}, ${a.street} ${a.house}${flat}, ${a.city}, ${a.zip}. Тел: ${a.phone}`;
  }

  paymentLabel(): string {
    switch (this.paymentMethod) {
      case 'cod': return 'Готівкою при отриманні';
      case 'card': return 'Банківською карткою';
      default: return 'Невідомо';
    }
  }
}
