import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-product-card.component.html',
  styleUrls: ['./cart-product-card.component.scss']
})
export class CartProductCardComponent {
  @Input() productId!: number;
  @Input() imageUrl!: string;
  @Input() name!: string;
  @Input() price!: number;
  @Input() status!: string;
  @Input() size!: string;
  @Input() color!: string;
  @Input() quantity: number = 1;
  @Input() minimal: boolean = false;
  @Input() clickable: boolean = true;

  @Output() remove = new EventEmitter<void>();
  @Output() quantityChange = new EventEmitter<number>();

  constructor(private router: Router) {}

  onRemove(event: MouseEvent) {
    event.stopPropagation();
    this.remove.emit();
  }

  increaseQuantity(event: MouseEvent) {
    event.stopPropagation();
    this.quantity++;
    this.quantityChange.emit(this.quantity);
  }

  decreaseQuantity(event: MouseEvent) {
    event.stopPropagation();
    if (this.quantity > 1) {
      this.quantity--;
      this.quantityChange.emit(this.quantity);
    }
  }

  goToProduct() {
    if (this.clickable) {
      this.router.navigate(['/products', this.productId]);
    }
  }
}
