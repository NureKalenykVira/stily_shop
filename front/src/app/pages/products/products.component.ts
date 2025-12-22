import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { ProductsService, ApiProduct } from '../../services/products.service';

type Product = ApiProduct & {
  sizes?: string[];
  type?: string;
  color?: string;
  colors?: string[];
  images?: string[];
  [key: string]: any;
};

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, ScrollToTopComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  constructor(private productsApi: ProductsService) {}

  // --- фільтри/стан (без змін) ---
  priceMin = 0;
  priceMax = 2000;
  appliedMin = 0;
  appliedMax = 2000;
  isPriceChanged = false;
  isPriceOpen = false;

  filters = [
    {
      label: 'Розмір',
      key: 'sizes',
      value: [] as string[],
      options: ['XS', 'S', 'M', 'L', 'XL', 'ХXL', 'ХХXL'],
      opened: false
    },
    {
      label: 'Тип продукту',
      key: 'type',
      value: [] as string[],
      options: ['Шорти', 'Штани', 'Футболка', 'Сорочка', 'Худі', 'Поло'],
      opened: false
    },
    {
      label: 'Колір',
      key: 'color',
      value: [] as string[],
      options: ['Чорний', 'Бежевий', 'Світло-коричневий', 'Світло-сірий', 'Темно-синій', 'Молочний', 'Зелений', 'Сірий меланж'],
      opened: false
    }
  ];

  colors = [
    { name: 'Чорний', code: '#000000' },
    { name: 'Бежевий', code: '#e6e0d4' },
    { name: 'Світло-коричневий', code: '#a79b8e' },
    { name: 'Світло-сірий', code: '#dcdcdc' },
    { name: 'Темно-синій', code: '#1b1f2b' },
    { name: 'Молочний', code: '#f5f5f0' },
    { name: 'Зелений', code: '#1f4d3a' },
    { name: 'Сірий меланж', code: '#bcbcbc' }
  ];

  products: Product[] = [];

ngOnInit(): void {
  this.productsApi.getProducts().subscribe({
    next: (list) => {
      this.products = list.map(p => ({ ...p, images: p.images ?? [], colors: p.colors ?? [], sizes: p.sizes ?? [] }));
      const maxPrice = Math.max(0, ...this.products.map(p => p.price ?? 0));
      this.priceMax = this.appliedMax = Math.ceil(maxPrice);
    },
    error: (e) => console.error('Помилка завантаження товарів', e)
  });
}

  syncSlider(type: 'min' | 'max') {
    if (this.priceMin > this.priceMax) {
      if (type === 'min') {
        this.priceMin = this.priceMax;
      } else {
        this.priceMax = this.priceMin;
      }
    }
  }

  applyPriceFilter() {
    this.appliedMin = this.priceMin;
    this.appliedMax = this.priceMax;
    this.isPriceChanged = true;
  }

  get filteredProducts(): Product[] {
    return this.products.filter(product => {
      const inPriceRange =
        product.price >= this.appliedMin && product.price <= this.appliedMax;

      const matchesFilters = this.filters.every(filter => {
        if (filter.value.length === 0) return true;
        const productValue = product[filter.key];
        if (Array.isArray(productValue)) {
          return productValue.some((val: string) => filter.value.includes(val));
        } else {
          return filter.value.includes(productValue);
        }
      });

      return inPriceRange && matchesFilters;
    });
  }

  getColorCode(colorName: string): string {
    const found = this.colors.find(c => c.name === colorName);
    return found ? found.code : '#000';
  }

  isSortOpen = false;
  selectedSort = 'Рекомендовані';
  sortOptions = ['Рекомендовані', 'Новинки', 'Назва A-Z', 'Назва Z-A', 'Ціна від найнижчої', 'Ціна від найвищої'];

  viewModes = [3, 4];
  viewMode = 3;

  hasSelectedFilters(): boolean {
    return this.isPriceChanged || this.filters.some(f => f.value.length > 0);
  }

  getSelectedFilters(): { label: string; filter?: any }[] {
    const selected: { label: string; filter?: any }[] = [];

    if (this.isPriceChanged) {
      selected.push({ label: `${this.priceMin} - ${this.priceMax} грн` });
    }

    this.filters.forEach(filter => {
      filter.value.forEach(val => {
        selected.push({ label: val, filter });
      });
    });

    return selected;
  }

  removeFilter(item: { label: string; filter?: any }): void {
    if (item.filter) {
      const index = item.filter.value.indexOf(item.label);
      if (index !== -1) item.filter.value.splice(index, 1);
    } else {
      this.isPriceChanged = false;
      this.priceMin = 0;
      this.priceMax = 2000;
      this.appliedMin = 0;
      this.appliedMax = 2000;
    }
  }

  clearAllFilters(): void {
    this.isPriceChanged = false;
    this.priceMin = 0;
    this.priceMax = 2000;
    this.appliedMin = 0;
    this.appliedMax = 2000;
    this.filters.forEach(f => (f.value = []));
  }

  toggleOption(filter: any, option: string) {
    const index = filter.value.indexOf(option);
    if (index > -1) {
      filter.value.splice(index, 1);
    } else {
      filter.value.push(option);
    }
  }

  isFilterModalOpen = false;

  openFilterModal() {
    this.isFilterModalOpen = true;
  }

  closeFilterModal() {
    this.isFilterModalOpen = false;
  }

  isMobileView = window.innerWidth <= 768;

  isSortModalOpen = false;

  openSortModal() {
    this.isSortModalOpen = true;
  }

  closeSortModal() {
    this.isSortModalOpen = false;
  }

  get selectedFilterCount(): number {
    let count = this.filters.reduce((acc, f) => acc + f.value.length, 0);
    if (this.isPriceChanged) count++;
    return count;
  }

  selectSort(option: string) {
    this.selectedSort = option;
    this.isSortOpen = false;

    switch (option) {
      case 'Рекомендовані':
        this.products = [...this.products];
        break;
      case 'Новинки':
        this.products = [...this.products].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        break;
      case 'Назва A-Z':
        this.products = [...this.products].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'Назва Z-A':
        this.products = [...this.products].sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'Ціна від найнижчої':
        this.products = [...this.products].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'Ціна від найвищої':
        this.products = [...this.products].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
    }
  }
}
