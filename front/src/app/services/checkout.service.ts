import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type CheckoutItem = { productId: number; qty: number };
export type CheckoutRequest = { items: CheckoutItem[] };
export type CheckoutResponse = { orderId: number; total: number; status: 'paid'|'pending'|'cancelled' };

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  constructor(private http: HttpClient) {}
  checkout(payload: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>('/api/checkout', payload);
  }
}
