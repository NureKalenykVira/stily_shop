import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: {
    id: number;
    name: string;
    price: number;
    colors: string[];
    images: string[];
  };
  @Input() name!: string;
  @Input() price!: number;
  @Input() colors!: string[]; // ['#000000', '#ffffff']
  @Input() images!: string[]; // [mainImage, hoverImage]

  isHovered = false;
}
