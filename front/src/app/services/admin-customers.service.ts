import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type AdminCustomerRow = {
  id: number;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
  addrFullName: string;
  addrStreet: string;
  addrHouse: string;
  addrFlat: string;
  addrCity: string;
  addrZIP: string;
  addrPhone: string;
  addrIsDefault: boolean;
  ordersCount: number;
  lastOrderDate?: string;
};

@Injectable({ providedIn: 'root' })
export class AdminCustomersService {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}

  list(opts?: { q?: string; limit?: number; offset?: number; sort?: string }) {
    let params = new HttpParams();
    if (opts) Object.entries(opts).forEach(([k,v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<AdminCustomerRow[]>(`${this.base}/admin/customers`, { params });
  }
}
