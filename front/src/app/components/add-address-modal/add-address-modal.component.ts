import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-address-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-address-modal.component.html',
  styleUrls: ['./add-address-modal.component.scss']
})
export class AddAddressModalComponent {
  @Output() close = new EventEmitter<void>();
  type: 'delivery' | 'billing' = 'delivery';
  billingSubtype: 'individual' | 'company' = 'individual';

  address = {
    firstName: '',
    lastName: '',
    street: '',
    house: '',
    flat: '',
    zip: '',
    city: '',
    phone: '',
    isDefault: false
  };

  closeModal() {
    this.close.emit();
  }

  save(form: NgForm) {
    if (form.invalid) return;

    console.log('Збереження адреси:', this.address);
    form.resetForm();
    this.closeModal();
  }

}
