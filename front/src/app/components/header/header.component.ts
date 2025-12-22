import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isSearchActive = false;
  searchQuery = '';
  isMobileMenuOpen = false;
  isScrolled = false;
  constructor(public router: Router) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 10;
  }

  handleMouseLeave() {
    if (!this.searchQuery) {
      this.isSearchActive = false;
    }
  }

  handleBlur() {
    if (!this.searchQuery) {
      this.isSearchActive = false;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideMenu = target.closest('.mobile-menu') || target.closest('.burger');

    if (!clickedInsideMenu && this.isMobileMenuOpen) {
      setTimeout(() => this.isMobileMenuOpen = false, 100);
    }
  }

}
