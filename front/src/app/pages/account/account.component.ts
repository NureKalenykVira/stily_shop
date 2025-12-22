import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routes } from '../../app.routes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  imports: [ CommonModule, RouterModule ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {
  constructor(private router: Router) {}

  logout() {
    console.log('Вихід із системи');
    this.router.navigate(['/']);
  }
}
