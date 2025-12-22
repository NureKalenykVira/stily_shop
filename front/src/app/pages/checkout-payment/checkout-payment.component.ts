import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { CartService, CartLine } from '../../services/cart.service';
import { CartProductCardComponent } from '../../components/cart-product-card/cart-product-card.component';
import { ToastService } from '../../services/toast.service';
import { OrdersService } from '../../services/orders.service';

type PaymentMethod = 'cod' | 'card';

type DeliveryState = {
  methodId: string;
  methodLabel?: string;
  price: number;
  pickupPoint: any;
  address: {
    firstName: string; lastName: string; street: string; house: string; flat: string;
    zip: string; city: string; phone: string; isDefault: boolean;
  }
} | null;

@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, NgForOf, NgIf, CartProductCardComponent],
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss']
})
export class CheckoutPaymentComponent implements OnInit {
  cart: CartLine[] = [];
  method: PaymentMethod = 'cod';
  isProcessing = false;

  delivery: DeliveryState = null;

  card = { holder: '', number: '', expiry: '', cvc: '' };

  numberLuhnError = false;
  expiryPastError = false;

  constructor(
    private cartService: CartService,
    private toast: ToastService,
    private router: Router,
    private orders: OrdersService, // <-- додаємо сервіс замовлень
  ) {}

  ngOnInit(): void {
    this.cart = this.cartService.getCart();
    const raw = sessionStorage.getItem('checkoutDelivery');
    this.delivery = raw ? (JSON.parse(raw) as DeliveryState) : null;
  }

  get itemsTotal(): number {
    return this.cart.reduce((s, p) => s + p.price * (p.quantity || 1), 0);
  }

  get grandTotal(): number {
    return this.itemsTotal + (this.delivery?.price ?? 0);
  }

  // ---------- helpers для картки ----------
  private digitsOnly(v: string): string {
    return (v || '').replace(/\D/g, '');
  }

  onCardNumberChange(v: string) {
    const d = this.digitsOnly(v).slice(0, 16);
    const parts = d.match(/.{1,4}/g) || [];
    this.card.number = parts.join(' ');
    this.numberLuhnError = d.length >= 13 && !this.luhnCheck(d);
  }

  onExpiryChange(v: string) {
    const d = this.digitsOnly(v).slice(0, 4);
    this.card.expiry = d.length <= 2 ? d : d.slice(0, 2) + '/' + d.slice(2);
    this.expiryPastError = !this.isExpiryValid(this.card.expiry);
  }

  private luhnCheck(num: string): boolean {
    let sum = 0, dbl = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let n = parseInt(num[i], 10);
      if (dbl) { n *= 2; if (n > 9) n -= 9; }
      sum += n; dbl = !dbl;
    }
    return sum % 10 === 0 && num.length >= 13 && num.length <= 19;
  }

  private isExpiryValid(exp: string): boolean {
    const m = exp.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!m) return false;
    const mm = parseInt(m[1], 10);
    const yy = parseInt(m[2], 10);
    const year = 2000 + yy;
    const now = new Date();
    const endOfMonth = new Date(year, mm, 0);
    return endOfMonth > new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  // ---------- сабміт ----------
  async submit(form: NgForm) {
    if (!this.cart.length) { this.toast.show('Кошик порожній'); return; }

    if (this.method === 'card') {
      form.control.markAllAsTouched();

      const num = this.digitsOnly(this.card.number);
      const numberOk = this.luhnCheck(num);
      const expiryOk = this.isExpiryValid(this.card.expiry);
      const cvcOk = /^\d{3,4}$/.test(this.card.cvc || '');
      const holderOk = /^[A-Za-zА-Яа-яЇїІіЄєҐґ'\-\s]{2,}$/.test(this.card.holder || '');

      this.numberLuhnError = !numberOk;
      this.expiryPastError = !expiryOk;

      if (!(numberOk && expiryOk && cvcOk && holderOk)) {
        this.toast.show('Перевірте дані картки');
        return;
      }
    }

    // валідність доставки
    if (!this.delivery) { this.toast.show('Немає даних доставки'); return; }

    this.isProcessing = true;
    try {
      // 1) payload
      const items = this.cart.map(p => ({
        product_id: p.id,
        quantity: p.quantity || 1,
        size: p.size,
        color: p.color, // очікується код типу "#000000"
      }));

      const addr = this.delivery.address;
      const payload = {
        guest: {
          first_name: addr.firstName,
          last_name:  addr.lastName,
          email:      '', // TODO: якщо є логін — підставимо
          phone:      addr.phone,
        },
        delivery: {
          method: this.delivery.methodId || 'nova-poshta-pickup',
          label:  this.delivery.methodLabel || '',
          price:  this.delivery.price || 0,
          pickup_point_id:   this.delivery.pickupPoint?.id,
          pickup_point_name: this.delivery.pickupPoint?.name,
        },
        address: {
          full_name: `${addr.firstName} ${addr.lastName}`,
          street: addr.street, house: addr.house, flat: addr.flat || '',
          city: addr.city, zip: addr.zip, phone: addr.phone,
        },
        payment_method: this.method, // 'cod' | 'card' | 'paypal'
        items,
      } as const;

      // 2) створюємо замовлення
      const created = await firstValueFrom(this.orders.createOrder(payload));

      // 3) якщо потрібне підтвердження оплати – викликаємо мок
      if (this.method !== 'cod') {
        await firstValueFrom(this.orders.confirmPayment(created.public_id));
      }

      // 4) зберігаємо метадані для success-сторінки
      sessionStorage.setItem('lastCart', JSON.stringify(this.cart));
      sessionStorage.setItem('checkoutDelivery', JSON.stringify(this.delivery));
      sessionStorage.setItem('orderMeta', JSON.stringify({
        orderId: created.public_id,
        method: this.method,
      }));

      this.cartService.clearCart();
      this.router.navigate(['/checkout-success'], { state: { orderId: created.public_id, method: this.method } });
    } catch (e) {
      console.error(e);
      this.toast.show('Не вдалося створити/оплатити замовлення. Спробуйте ще раз');
    } finally {
      this.isProcessing = false;
    }
  }
}
