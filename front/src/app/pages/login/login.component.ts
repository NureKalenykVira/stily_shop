import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ForgotPasswordModalComponent } from '../../components/forgot-password-modal/forgot-password-modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ForgotPasswordModalComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(private router: Router) {}

  loginData = {
    email: '',
    password: ''
  };

  onLogin(form: NgForm) {
    if (form.valid) {
      console.log(this.loginData);
    }
    this.router.navigate(['/account']);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  register() {
    this.router.navigate(['/register']);
  }

  showForgotModal = false;

  openForgotModal() {
    this.showForgotModal = true;
  }

  closeForgotModal() {
    this.showForgotModal = false;
  }
}
