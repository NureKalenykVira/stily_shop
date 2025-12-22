import { Component, signal, computed, inject, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ViewEncapsulation } from '@angular/core';
import { AdminProductsService, ApiStatus } from '../../../services/admin-products.service';

export interface Product {
  id: number;
  title: string;
  sku: string;
  category?: string | null;
  price: number;
  stock: number;
  status: 'active' | 'draft' | 'archived';
  description?: string | null;

  images?: string[];
  colors?: string[];
  sizes?: string[];
  fabric?: string[];
  [key: string]: any;
}

type UiStatus = ApiStatus | 'all';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductsComponent implements OnInit {
  private dialog = inject(MatDialog);
  private api = inject(AdminProductsService);

  products = signal<Product[]>([]);
  isLoading = signal(false);

  q = signal('');
  status = signal<UiStatus>('all');

  private searchTimer?: any;

  private refreshOnFilters = effect(() => {
    void this.status();
    void this.q();
    this.fetch();
  });

  ngOnInit(): void {

  }

  private toApiStatus(s: UiStatus): ApiStatus | undefined {
    return s === 'all' ? undefined : s;
  }

  onSearchInput(ev: Event) {
    const v = (ev.target as HTMLInputElement).value ?? '';
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.q.set(v), 250);
  }

  onStatusChange(ev: Event) {
    const v = (ev.target as HTMLSelectElement).value as ApiStatus | 'all';
    this.status.set(v);
  }

  filtered = computed(() => {
    const v = this.q().trim().toLowerCase();
    const st = this.status();
    return this.products().filter(p =>
      (st === 'all' || p.status === st) &&
      (!v || [p.title, p.sku, p.category ?? ''].some(x => (x ?? '').toLowerCase().includes(v)))
    );
  });

  add() {
    const ref = this.dialog.open(ProductDialogComponent, {
      width: '960px',
      maxWidth: '96vw',
      panelClass: 'admin-dialog',
      backdropClass: 'admin-backdrop',
      autoFocus: false
    });
    ref.afterClosed().subscribe((val: Product | null) => {
      if (!val) return;
      this.api.create({
        sku: (val.sku ?? '').trim(),
        title: (val.title ?? '').trim(),      // <- ВАЖЛИВО: title
        category: val.category ?? null,
        description: val.description ?? null,
        price: Number(val.price ?? 0),
        stock: Number(val.stock ?? 0),
        status: val.status ?? 'active',
        images: val.images ?? [],
        colors: val.colors ?? [],
        sizes:  val.sizes  ?? [],
        fabric: val.fabric ?? []
      }).subscribe(() => this.fetch());
    });
  }

  edit(p: Product) {
    const ref = this.dialog.open(ProductDialogComponent, {
      width: '960px',
      maxWidth: '96vw',
      panelClass: 'admin-dialog',
      backdropClass: 'admin-backdrop',
      autoFocus: false,
      data: p
    });
    ref.afterClosed().subscribe((val: Product | null) => {
      if (!val) return;
      const upd = {
        id: p.id,
        sku: val.sku ?? p.sku,
        title: (val.title ?? p.title),
        category: (val.category ?? p.category ?? null),
        description: (val.description ?? p.description ?? null),
        price: Number(val.price ?? p.price),
        stock: Number(val.stock ?? p.stock),
        status: (val.status ?? p.status),
        images: (val.images ?? p.images ?? []),
        colors: (val.colors ?? p.colors ?? []),
        sizes:  (val.sizes  ?? p.sizes  ?? []),
        fabric: (val.fabric ?? p.fabric ?? [])
      };
      this.api.update(upd as any).subscribe(() => this.fetch());
    });
  }

  confirmRemove(p: Product) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'admin-dialog',
      backdropClass: 'admin-backdrop',
      disableClose: true,
      data: { title: 'Видалити товар?', text: p.title }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.api.delete(p.id).subscribe(() => this.fetch());
    });
  }

  remove(p: Product) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'admin-dialog',
      backdropClass: 'admin-backdrop',
      data: { title: 'Видалити товар?', text: p.title }
    });
    ref.afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      this.api.delete(p.id).subscribe(() => this.fetch());
    });
  }

  private fetch() {
    this.isLoading.set(true);
    this.api.list({
      q: this.q() || undefined,
      status: this.toApiStatus(this.status()),
      limit: 100,
      offset: 0,
    }).subscribe({
      next: (rows) => {
        const fromJson = (v: any) => {
          if (Array.isArray(v)) return v;
          if (typeof v === 'string' && v.trim().startsWith('[')) {
            try { return JSON.parse(v); } catch { return []; }
          }
          return v ? [String(v)] : [];
        };
        const list: Product[] = (rows as any[]).map((r: any) => ({
          id: Number(r.id),
          title: r.title ?? r.name ?? '',
          sku: r.sku,
          category: r.category ?? r.type ?? null,
          description: r.description ?? null,
          price: Number(r.price ?? 0),
          stock: Number(r.stock ?? 0),
          status: (r.status ?? 'active') as any,
          images: fromJson(r.images ?? r.images_json),
          colors: fromJson(r.colors ?? r.colors_json),
          sizes:  fromJson(r.sizes  ?? r.sizes_json),
          fabric: fromJson(r.fabric ?? r.fabric_json),
          updated_at: r.updated_at
        }));
        this.products.set(list);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
