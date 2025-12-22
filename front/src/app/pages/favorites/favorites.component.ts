import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FavoriteProductCardComponent } from '../../components/favorite-product-card/favorite-product-card.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FavoriteProductCardComponent, ScrollToTopComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent {
  hasFavorites = true;

  favoriteProducts = [
    {
      id: 1,
      name: 'Шорти',
      price: 1100,
      image: 'assets/product/test-3.jpg',
      status: 'low'
    },
    {
      id: 2,
      name: 'Штани лляні бежеві',
      price: 750,
      image: 'assets/product/test-5.jpg',
      status: 'available'
    },
    {
      id: 3,
      name: 'Футболка Classic Grey',
      price: 750,
      image: 'assets/product/test-7.jpg',
      status: 'unavailable'
    }
  ];

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }

  toShop() {
    this.router.navigate(['/products']);
  }

  removeFromFavorites(productId: number) {
    this.favoriteProducts = this.favoriteProducts.filter(p => p.id !== productId);
    this.hasFavorites = this.favoriteProducts.length > 0;
  }

}
