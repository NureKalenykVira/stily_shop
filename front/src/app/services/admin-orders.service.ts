import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type AdminOrderRow = {
  id: string;
  createdAt: string;
  payment: 'cod'|'card';
  status: 'new'|'paid'|'shipped'|'cancelled';
  itemsCount: number;
  itemsTotal: number;
  delivery: 'nova-poshta-courier' | 'nova-poshta-pickup' | string;
  deliveryPrice: number;
  total: number;
  customer: {
    kind: 'guest'|'user';
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
};

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}

  list(opts?: { q?: string; status?: string; pay?: string; limit?: number; offset?: number; sort?: string }) {
    let params = new HttpParams();
    if (opts) {
      Object.entries(opts).forEach(([k,v]) => {
        if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
      });
    }
    return this.http.get<AdminOrderRow[]>(`${this.base}/admin/orders`, { params });
  }
}
