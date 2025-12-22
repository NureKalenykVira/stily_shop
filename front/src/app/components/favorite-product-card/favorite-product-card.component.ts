import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favorite-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorite-product-card.component.html',
  styleUrls: ['./favorite-product-card.component.scss']
})
export class FavoriteProductCardComponent {
  @Input() productId!: number;
  @Input() imageUrl!: string;
  @Input() name!: string;
  @Input() price!: number;
  @Input() status!: string;

  @Output() remove = new EventEmitter<void>();

  onRemove() {
    this.remove.emit();
  }
}
