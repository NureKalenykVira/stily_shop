import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type ApiStatus = 'active'|'draft'|'archived';

export interface ApiProduct {
  id: number;
  name: string;         // бек віддає name
  price: number;
  images: string[];
  colors: string[];
  sizes: string[];
  sku?: string;
  fabric?: string[];
  type?: string;
  color?: string;
  status: ApiStatus;
}

@Injectable({ providedIn: 'root' })
export class AdminProductsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/products`; // http://localhost:8080/api/products

  // ---- LIST: завжди повертаємо масив ----
  list(opts: { q?: string; status?: ApiStatus; category?: string; limit?: number; offset?: number; sort?: string } = {}) {
    let params = new HttpParams();
    const normalized = {
      limit:  opts.limit  ?? 100,
      offset: opts.offset ?? 0,
      status: opts.status,
      q:       opts.q,
      category: opts.category,
      sort:     opts.sort,
    };
    Object.entries(normalized).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http.get<ApiProduct[]>(this.base, { params });
  }

create(p: {
  sku: string;
  title: string;
  category?: string | null;
  description?: string | null;
  price: number;
  stock: number;
  status?: 'active'|'draft'|'archived';
  images?: string[];
  colors?: string[];
  sizes?: string[];
  fabric?: string[];
}) {
  const s = (arr?: string[]) => JSON.stringify(arr ?? []);

  const payload = {
    sku: p.sku,
    title: p.title,
    category: p.category ?? null,
    description: p.description ?? null,     // <-- description (НЕ 'descr')
    price: p.price,
    stock: p.stock,
    status: p.status ?? 'active',

    images_json: s(p.images),
    colors_json: s(p.colors),
    sizes_json:  s(p.sizes),
    fabric_json: s(p.fabric),
  };

  return this.http.post<{id:number}>(`${environment.apiBase}/products`, payload);
}
  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  update(p: {
    id: number;
    sku: string;
    title: string;
    category?: string | null;
    description?: string | null;
    price: number;
    stock: number;
    status?: 'active'|'draft';
    images?: string[];
    colors?: string[];
    sizes?: string[];
    fabric?: string[];
  }) {
    const s = (arr?: string[]) => JSON.stringify(arr ?? []);
    const payload = {
      sku: p.sku,
      title: p.title,
      category: p.category ?? null,
      description: p.description ?? null,
      price: p.price,
      stock: p.stock,
      status: p.status ?? 'active',
      images_json: s(p.images),
      colors_json: s(p.colors),
      sizes_json:  s(p.sizes),
      fabric_json: s(p.fabric),
    };
    return this.http.put<{updated:number}>(`${environment.apiBase}/products/${p.id}`, payload);
  }
}

