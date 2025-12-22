import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AddAddressModalComponent } from '../../../components/add-address-modal/add-address-modal.component';
import { AddressCardComponent } from '../../../components/address-card/address-card.component';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, RouterModule, AddAddressModalComponent, AddressCardComponent],
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss']
})
export class AddressesComponent {
  deliveryAddress: {
    fullName: string;
    addressText: string;
    phone: string;
    isDefault: boolean;
  } | null = {
    fullName: 'Віра Каленик',
    addressText: 'вул. Козацька 15/52<br>81100 Пустомити',
    phone: '+380669898198',
    isDefault: true
  };

  billingAddress: string | null = null;
  showModal = false;

  addAddress() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  editAddress(type: 'delivery' | 'billing') {
    console.log('Редагування адреси:', type);
    // тут можна відкрити модалку з даними
  }

  deleteAddress(type: 'delivery' | 'billing') {
    console.log('Видалення адреси:', type);
    // тут логіка видалення
  }
}
