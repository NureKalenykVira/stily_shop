import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  constructor(private toast: ToastService) {}
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  save(form: any) {
    if (
      form.valid &&
      this.newPassword === this.confirmPassword &&
      this.newPassword !== this.currentPassword
    ) {
      // тут буде запит на API

      this.toast.show('Пароль успішно змінено');
      form.resetForm();
    }
  }

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }
}
