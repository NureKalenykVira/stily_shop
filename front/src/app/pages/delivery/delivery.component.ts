import { Component, ViewChildren, QueryList, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-delivery',
  imports: [CommonModule, ScrollToTopComponent],
  templateUrl: './delivery.component.html',
  styleUrl: './delivery.component.scss'
})
export class DeliveryComponent {
  constructor(private router: Router) {}
  openedIndex: number | null = null;

  @ViewChildren('answer') answers!: QueryList<ElementRef<HTMLElement>>;

  ngAfterViewChecked(): void {
    this.answers.forEach((el, index) => {
      const element = el.nativeElement;
      if (this.openedIndex === index) {
        element.style.maxHeight = element.scrollHeight + 'px';
        element.style.opacity = '1';
      } else {
        element.style.maxHeight = '0px';
        element.style.opacity = '0';
      }
    });
  }

  toggle(index: number): void {
    this.openedIndex = this.openedIndex === index ? null : index;
  }

  goHome() {
    this.router.navigate(['/']);
  }

  askUs() {
    this.router.navigate(['/contacts']);
  }

  faqList = [
  {
    question: 'Які служби доставки ви використовуєте?',
    answer: 'Ми надсилаємо замовлення Новою Поштою, Укрпоштою та Meest Express.'
  },
  {
    question: 'Скільки коштує доставка?',
    answer: 'Вартість доставки залежить від обраної служби та населеного пункту. При замовленні від 1500 грн — доставка безкоштовна.'
  },
  {
    question: 'Скільки часу займає доставка?',
    answer: 'Зазвичай доставка триває 1–3 робочі дні, залежно від регіону.'
  },
  {
    question: 'Чи можу я відстежити своє замовлення?',
    answer: 'Так, після відправлення ми надішлемо вам номер ТТН для відстеження.'
  },
  {
    question: 'Чи можлива доставка за кордон?',
    answer: 'Так, ми здійснюємо міжнародну доставку в деякі країни ЄС. Для уточнення умов <a href="/contacts">зв’яжіться з нами</a>.'
  },
  {
    question: 'Чи можу я змінити адресу доставки після оформлення замовлення?',
    answer: 'Так, якщо замовлення ще не відправлено. <a href="/contacts">Зв’яжіться з нами</a> якомога швидше.'
  },
  {
    question: 'Що робити, якщо я не встиг забрати посилку з відділення?',
    answer: 'Посилка зберігається у відділенні 5–7 днів. Якщо ви не встигли забрати її — вона повернеться до нас, і ми зв’яжемося з вами.'
  },
  {
    question: 'Чи можу я оформити доставку кур’єром до дверей?',
    answer: 'Так, така опція доступна у великих містах. Оберіть її під час оформлення замовлення.'
  },
  {
    question: 'Коли моє замовлення буде відправлено?',
    answer: 'Зазвичай ми обробляємо та відправляємо замовлення протягом 24 годин у робочі дні.'
  },
  {
    question: 'Чи можна забрати замовлення самостійно?',
    answer: 'Наразі ми працюємо лише онлайн і не маємо пункту самовивозу.'
  }
];

}
