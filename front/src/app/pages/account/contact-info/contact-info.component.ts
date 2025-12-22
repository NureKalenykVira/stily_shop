import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-info.component.html',
  styleUrls: ['./contact-info.component.scss']
})
export class ContactInfoComponent {
  name = 'Віра';
  surname = 'Каленик';
  email = 'vera.kalenik2203l@gmail.com';

  save(form: any) {
    if (form.valid) {
      console.log('Збережено:', { name: this.name, surname: this.surname });
    }
  }
}
