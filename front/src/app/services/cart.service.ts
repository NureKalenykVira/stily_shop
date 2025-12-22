import { Injectable } from '@angular/core';

export type CartLine = {
  id: number;          // product id
  name: string;
  price: number;
  image?: string;
  status?: 'available' | 'low' | 'unavailable';
  size?: string;
  color?: string;
  quantity: number;
};

const KEY = 'stilyshop_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private products: CartLine[] = JSON.parse(localStorage.getItem(KEY) || '[]');

  private persist() { localStorage.setItem(KEY, JSON.stringify(this.products)); }

  setCart(products: CartLine[]) { this.products = [...products]; this.persist(); }

  getCart(): CartLine[] { return [...this.products]; }

  add(line: CartLine) {
    const i = this.products.findIndex(
      x => x.id === line.id && x.size === line.size && x.color === line.color
    );
    if (i >= 0) this.products[i].quantity += line.quantity;
    else this.products.push(line);
    this.persist();
  }

  updateQuantity(id: number, qty: number) {
    const i = this.products.findIndex(x => x.id === id);
    if (i >= 0) { this.products[i].quantity = qty; this.persist(); }
  }

  remove(id: number) {
    this.products = this.products.filter(x => x.id !== id);
    this.persist();
  }

  clearCart() { this.products = []; this.persist(); }
}
