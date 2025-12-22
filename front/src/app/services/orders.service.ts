import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

type CartLine = {
  id: number; price: number; quantity?: number;
  size?: string; color?: string;
};

export type OrderCreate = {
  guest: { first_name: string; last_name: string; email: string; phone: string; };
  delivery: { method: string; label: string; price: number; pickup_point_id?: string; pickup_point_name?: string; };
  address: { full_name: string; street: string; house: string; flat: string; city: string; zip: string; phone: string; };
  payment_method: 'cod' | 'card';
  items: { product_id: number; quantity: number; size?: string; color?: string; }[];
};

export type OrderCreated = {
  id: number; public_id: string;
  items_total: number; delivery_price: number; grand_total: number;
  payment_status: 'pending' | 'paid' | 'refunded';
};

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  createOrder(payload: OrderCreate): Observable<OrderCreated> {
    return this.http.post<OrderCreated>(`${this.base}/orders`, payload);
  }

  confirmPayment(publicId: string): Observable<{ ok: boolean; status: 'paid' | 'pending' | 'refunded' }> {
    return this.http.post<{ ok: boolean; status: 'paid' | 'pending' | 'refunded' }>(
      `${this.base}/orders/${publicId}/pay/confirm`,
      {}
    );
  }

  getOrder(publicId: string) {
    return this.http.get(`${this.base}/orders/${publicId}`);
  }
}
