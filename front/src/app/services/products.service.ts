import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export type ApiProduct = {
  id: number;
  name: string;
  price: number;
  images: string[];
  colors: string[];
  sizes: string[];
  sku?: string;
  fabric?: string[];
  type?: string;
  color?: string;
};

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private base = environment.apiBase;

  constructor(private http: HttpClient) {}

  getProducts(opts?: {
    q?: string;
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
    sort?: 'price_asc'|'price_desc'|'created_at_asc'|'created_at_desc';
  }): Observable<ApiProduct[]> {
    let params = new HttpParams();
    if (opts) {
      Object.entries(opts).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
      });
    }
    return this.http.get<ApiProduct[]>(`${this.base}/products`, { params });
  }

  getProduct(id: number) {
  return this.getProducts().pipe(
    map(list => {
      const p = list.find(x => x.id === id);
      if (!p) { throw new Error('Product not found'); }
      return p;
    })
  );
}
}
