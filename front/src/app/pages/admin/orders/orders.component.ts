import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminOrdersService, AdminOrderRow } from '../../../services/admin-orders.service';

type Status = 'new' | 'paid' | 'shipped' | 'cancelled';
type PayMethod = 'cod' | 'card';

@Component({
  standalone: true,
  selector: 'app-admin-orders',
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  q = signal('');
  status = signal<'all' | Status>('all');
  pay = signal<'all' | PayMethod>('all');

  orders = signal<AdminOrderRow[]>([]);

  constructor(private api: AdminOrdersService) {}

  ngOnInit(): void {
    this.reload();
  }

  private reload(): void {
    this.api
      .list({
        q: this.q(),
        status: this.status(),
        pay: this.pay(),
        limit: 200,
        sort: 'created_desc',
      })
      .subscribe(rows => this.orders.set(rows));
  }

  filtered = computed(() => {
    const v = this.q().trim().toLowerCase();
    const st = this.status();
    const pay = this.pay();

    return this.orders()
      .filter(o => (st === 'all' || o.status === st))
      .filter(o => (pay === 'all' || o.payment === pay))
      .filter(o => {
        if (!v) return true;
        const name = [o.customer.firstName ?? '', o.customer.lastName ?? ''].join(' ').trim();
        const hay = [o.id, name, o.customer.email ?? '', o.customer.phone ?? '']
          .join(' ')
          .toLowerCase();
        return hay.includes(v);
      });
  });

  itemsCount(o: AdminOrderRow): number { return o.itemsCount; }
  itemsTotal(o: AdminOrderRow): number { return o.itemsTotal; }

  setStatus(_o: AdminOrderRow, _s: Status) {
    // TODO
  }

  displayName(o: AdminOrderRow): string {
    const fn = o.customer.firstName ?? '';
    const ln = o.customer.lastName ?? '';
    const full = `${fn} ${ln}`.trim();
    return full || (o.customer.kind === 'guest' ? 'Гість' : 'Користувач');
  }

  displayPhone(o: AdminOrderRow): string {
    return (o.customer.phone ?? '').trim();
  }

  paymentLabel(m: PayMethod) { return m === 'cod' ? 'Готівка' : 'Картка'; }
  deliveryLabel(code: string): string {
    switch (code) {
      case 'nova-poshta-courier': return 'Курʼєр НП';
      case 'nova-poshta-pickup':  return 'Відділення НП';
      case '': return '—';
      default:  return code;
    }
  }

  onSearchInput(ev: Event) { this.q.set((ev.target as HTMLInputElement).value ?? ''); this.reload(); }
  onStatusChange(ev: Event) { this.status.set((ev.target as HTMLSelectElement).value as any); this.reload(); }
  onPayChange(ev: Event) { this.pay.set((ev.target as HTMLSelectElement).value as any); this.reload(); }
}
