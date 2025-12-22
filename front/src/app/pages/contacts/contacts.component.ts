import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-contacts',
  imports: [CommonModule, FormsModule, ScrollToTopComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {

  constructor(private router: Router, public toastService: ToastService) {}

  topicOptions: string[] = ['Замовлення', 'Оплата', 'Відправлення та доставка', 'Повернення', 'Обмін', 'Інше'];
  selectedOption: string = '';
  dropdownOpen = false;

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectOption(option: string) {
    this.selectedOption = option;
    this.dropdownOpen = false;
  }

  formData = {
    fullName: '',
    email: '',
    phone: '',
    message: '',
    orderNumber: '',
    productNumber: '',
    consent: false
  };

  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('Надіслано:', this.formData);

      this.toastService.show('Повідомлення успішно надіслано!');

      form.resetForm({
        fullName: '',
        email: '',
        phone: '',
        message: '',
        orderNumber: '',
        productNumber: '',
        consent: false
      });

      this.selectedOption = '';
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
