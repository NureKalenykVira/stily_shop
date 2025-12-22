import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminCustomersService, AdminCustomerRow } from '../../../services/admin-customers.service';

@Component({
  standalone: true,
  selector: 'app-admin-customers',
  imports: [CommonModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {
  q = signal('');
  customers = signal<AdminCustomerRow[]>([]);

  constructor(private api: AdminCustomersService) {}

  ngOnInit(): void { this.reload(); }

  private reload() {
    this.api.list({ q: this.q(), limit: 200, sort: 'created_desc' })
      .subscribe(rows => this.customers.set(rows));
  }

  filtered = computed(() => {
    const v = this.q().trim().toLowerCase();
    if (!v) return this.customers();
    return this.customers().filter(c => {
      const addrText = this.formatAddress(c).toLowerCase();
      const hay = [
        c.firstName, c.lastName, c.email, c.addrPhone, addrText
      ].join(' ').toLowerCase();
      return hay.includes(v);
    });
  });

  onSearchInput(ev: Event) {
    this.q.set((ev.target as HTMLInputElement).value ?? '');
    this.reload();
  }

  formatAddress(c: AdminCustomerRow): string {
    const flat = c.addrFlat ? `/${c.addrFlat}` : '';
    const parts = [
      `${c.addrStreet} ${c.addrHouse}${flat}`.trim(),
      `${c.addrZIP} ${c.addrCity}`.trim()
    ].filter(Boolean);
    return parts.join(', ');
  }
}
