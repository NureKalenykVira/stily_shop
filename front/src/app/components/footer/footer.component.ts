import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  constructor(public router: Router) {}

  footerSections = [
    {
      title: 'СЕРВІС',
      links: ['Оплата', 'Доставка', 'Повернення і обмін', 'Контакти']
    },
    {
      title: 'МІЙ STILY SHOP',
      links: ['Аккаунт', 'Обране', 'Кошик', 'Замовлення']
    },
    {
      title: 'КОНТАКТИ',
      links: ['+38 (ОХХ) ХХ ХХ ХХ', 'info@stilyshop.ua', 'Політика конфіденційності']
    }
  ];

  openedSectionIndex: number | null = null;

  toggleSection(index: number) {
    this.openedSectionIndex = this.openedSectionIndex === index ? null : index;
  }

  isSectionOpen(index: number): boolean {
    return this.openedSectionIndex === index;
  }
}
