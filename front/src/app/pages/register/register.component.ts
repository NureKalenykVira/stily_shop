import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptTerms: false,
    acceptMarketing: false,
    selectAll: false
  };

  constructor(private router: Router, private toast: ToastService) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  onRegister(form: NgForm): void {
    if (form.valid) {
      console.log('Дані для реєстрації:', this.registerData);
      // Реєстрація API

      form.resetForm();
      this.toast.show('Особистий профіль створено');
      this.router.navigate(['/account']);
    }
  }

  toggleAll(): void {
    const val = this.registerData.selectAll;
    this.registerData.acceptTerms = val;
    this.registerData.acceptMarketing = val;
  }

  showPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
