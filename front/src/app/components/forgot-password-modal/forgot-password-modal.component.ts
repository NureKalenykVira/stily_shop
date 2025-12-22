import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-forgot-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.scss']
})
export class ForgotPasswordModalComponent {
  @Output() closeModal = new EventEmitter<void>();
  email: string = '';

  submitForm(form: NgForm) {
    if (form.invalid) return;

    console.log('Відправлено запит на скидання пароля:', this.email);

    form.resetForm();
    this.close();
  }

  close() {
    this.closeModal.emit();
  }

}
