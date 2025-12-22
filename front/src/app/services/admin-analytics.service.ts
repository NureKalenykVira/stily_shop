import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SummaryDTO {
  revenue_month: number;
  total_customers: number;
  avg_check: number;
  median_check: number;
  most_frequent_product: string;
  min_day: { date: string; customers: number } | null;
  max_day: { date: string; customers: number } | null;
}

export interface ByDayDTO { date: string; customers: number; }
export interface NameValue { label: string; value: number; }
export interface NameValue { label: string; value: number; }
export interface KVDTO { label: string; value: number; }
export interface RevenueByDayDTO { date: string; revenue: number; }

@Injectable({ providedIn: 'root' })
export class AdminAnalyticsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/analytics`;

  summary(): Observable<SummaryDTO> {
    return this.http.get<SummaryDTO>(`${this.base}/summary`);
  }

  byDay(): Observable<ByDayDTO[]> {
    return this.http.get<ByDayDTO[]>(`${this.base}/customers-by-day`);
  }

  topProducts(): Observable<NameValue[]> {
    return this.http.get<NameValue[]>(`${this.base}/top-products`);
  }

  companionsPopular(): Observable<NameValue[]> {
    return this.http.get<NameValue[]>(`${this.base}/companions-popular`);
  }

  pairsFrequent() {
    return this.http.get<NameValue[]>(`${this.base}/pairs-frequent`);

  }

  pairsRare() {
    return this.http.get<NameValue[]>(`${this.base}/pairs-rare`);
  }

  paymentMethods(): Observable<KVDTO[]> {
    return this.http.get<KVDTO[]>(`${this.base}/payment-methods`);
  }

  deliveryMethods(): Observable<KVDTO[]> {
    return this.http.get<KVDTO[]>(`${this.base}/delivery-methods`);
  }

  revenueByDay(): Observable<RevenueByDayDTO[]> {
    return this.http.get<RevenueByDayDTO[]>(`${this.base}/revenue-by-day`);
  }
}
