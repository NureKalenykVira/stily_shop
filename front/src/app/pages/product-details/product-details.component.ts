import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import Hammer from 'hammerjs';
import { MatDialog } from '@angular/material/dialog';
import { SizeGuideModalComponent } from '../../components/size-guide-modal/size-guide-modal.component';
import { ToastService } from '../../services/toast.service';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { ApiProduct } from '../../services/products.service';
import { ProductsService } from '../../services/products.service';
import { CartService, CartLine } from '../../services/cart.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollToTopComponent],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit, AfterViewInit {
  product: (ApiProduct & {
    type?: string; color?: string; sizes?: string[]; colors?: string[]; images?: string[];
  }) | undefined;

  selectedImage = '';
  selectedColor: string | null = null; // очікуємо hex
  selectedSize: string | null = null;
  quantity = 1;
  isFavorite = false;
  currentIndex = 0;
  swipeClass = '';
  screenIsMobile = false;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private toast: ToastService,
    private productsApi: ProductsService,
    private cart: CartService
  ) {}

ngOnInit(): void {
  const id = Number(this.route.snapshot.paramMap.get('id'));
  this.productsApi.getProduct(id).subscribe({
    next: (p: ApiProduct) => {
      this.product = p;

      if (p.images && p.images.length) {
        this.selectedImage = p.images[0]!;
      }
      if (p.colors && p.colors.length) {
        this.selectedColor = p.colors[0]!;
      }
    },
    error: (e) => console.error(e)
  });
}

  ngAfterViewInit(): void {
    const el = document.querySelector('.main-image') as HTMLElement | null;
    if (!el) return;
    const hammer = new Hammer(el);
    hammer.on('swipeleft', () => this.onSwipeLeft());
    hammer.on('swiperight', () => this.onSwipeRight());
  }

  increaseQuantity(): void { this.quantity++; }
  decreaseQuantity(): void { this.quantity = Math.max(1, this.quantity - 1); }

  addToCart(): void {
    if (!this.product) return;

    if (!this.selectedSize) {
      this.toast.show('Оберіть розмір');
      return;
    }
    if (!this.selectedColor) {
      this.toast.show('Оберіть колір');
      return;
    }

    const line: CartLine = {
      id: this.product.id,
      name: this.product.name,
      price: this.product.price,
      image: this.product.images?.[0],
      size: this.selectedSize,
      color: this.getColorName(this.selectedColor) || this.selectedColor,
      quantity: this.quantity,
      status: 'available'
    };

    this.cart.add(line);
    this.toast.show('Товар додано до кошика');
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    const msg = this.isFavorite ? 'Додано до обраного' : 'Видалено з обраного';
    this.toast.show(msg);
  }

  nextImage(): void {
    if (!this.product?.images) return;
    if (this.currentIndex < this.product.images.length - 1) {
      this.swipeClass = 'swiping-left';
      this.currentIndex++;
      this.selectedImage = this.product.images[this.currentIndex]!;
      setTimeout(() => (this.swipeClass = ''), 300);
    }
  }

  prevImage(): void {
    if (!this.product?.images) return;
    if (this.currentIndex > 0) {
      this.swipeClass = 'swiping-right';
      this.currentIndex--;
      this.selectedImage = this.product.images[this.currentIndex]!;
      setTimeout(() => (this.swipeClass = ''), 300);
    }
  }

  onSwipeLeft(): void { this.nextImage(); }
  onSwipeRight(): void { this.prevImage(); }

  trackByIndex(index: number): number { return index; }

  openSizeGuide(): void {
    this.dialog.open(SizeGuideModalComponent, {
      panelClass: 'size-guide-dialog',
      maxWidth: '90vw'
    });
  }

  tabs = [
    { key: 'details', label: 'Деталі товару' },
    { key: 'delivery', label: 'Доставка' },
    { key: 'returns', label: 'Повернення' }
  ];
  selectedTab = 'details';
  selectTab(key: string) { this.selectedTab = key; }

  getColorName(colorCode: string | null): string | null {
    const colorMap: { [key: string]: string } = {
      '#000000': 'Чорний',
      '#ffffff': 'Білий',
      '#e6e0d4': 'Бежевий',
      '#a79b8e': 'Світло-коричневий',
      '#dcdcdc': 'Світло-сірий',
      '#1b1f2b': 'Темно-синій',
      '#f5f5f0': 'Молочний',
      '#1f4d3a': 'Зелений',
      '#bcbcbc': 'Сірий меланж'
    };
    return colorCode ? colorMap[colorCode.toLowerCase()] || colorCode : null;
  }
}
