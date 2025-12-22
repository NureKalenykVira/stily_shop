import { Component, ViewChildren, QueryList, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-payment',
  imports: [CommonModule, ScrollToTopComponent],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
  standalone: true
})
export class PaymentComponent {

  constructor(private router: Router) {}
  openedIndex: number | null = null;

  @ViewChildren('answer') answers!: QueryList<ElementRef<HTMLElement>>;

  faqList = [
  {
    question: 'Які варіанти оплати ви пропонуєте?',
    answer: 'Ми приймаємо оплату банківською карткою, через Google Pay, Apple Pay, а також накладеним платежем.'
  },
  {
    question: 'Як оплатити покупку онлайн?',
    answer: `
      Знайшовши необхідні товари на нашому сайті, додай їх до “кошика”. Натисни “Купити”, щоб оформити замовлення, обери час та адресу доставки, та додай послуги, якщо потрібно. Потім обери спосіб оплати та введи дані банківської картки.<br><br>
      У разі виникнення проблем під час замовлення, зв’яжись з нашим співробітником <a href="/contacts"> Центру підтримки клієнтів</a> по телефону, через чат або електронну пошту.
    `
  },
  {
    question: 'Що робити, якщо моя картка не приймається для оплати?',
    answer: `
      Зроби ще одну спробу та переконайся, що дані вказано без помилок. Зв’яжись зі своїм банком і з’ясуй, чи не встановлено ліміту для здійснення покупок в Інтернеті. Якщо з боку твого банку немає ніяких обмежень та проблема не зникла, запиши або зроби знімок екрана з номером помилки та зв’яжись з <a href="/contacts"> нами</a>.
    `
  },
  {
    question: 'Як можна розрахуватися за товари у магазині?',
    answer: `
      У магазині доступні такі варіанти оплати:
      <ul>
        <li>Готівка у гривнях</li>
        <li>Банківські картки</li>
        <li>Подарункові картки</li>
      </ul>
    `
  },
  {
    question: 'Чому я не отримую підтвердження оплати?',
    answer: 'Іноді підтвердження затримується. Перевірте спам або зверніться до <a href="/contacts"> служби підтримки</a>.'
  },
  {
    question: 'Як я можу оформити замовлення за безготівковим розрахунком?',
    answer: 'Для цього зв’яжіться з <a href="/contacts"> нами</a> — ми надамо рахунок-фактуру для оплати.'
  },
  {
    question: 'Як можна розрахуватися за товари онлайн?',
    answer: 'Доступні картки Visa/MasterCard, Apple Pay, Google Pay, Monobank та Приват24.'
  },
  {
    question: 'Чому ви повертаєте кошти лише на ту картку, з якої було здійснено покупку?',
    answer: 'Це вимога платіжних систем — повернення можливе лише на оригінальний платіжний засіб.'
  },
  {
    question: 'Чи є оплата онлайн безпечною та надійною?',
    answer: 'Так, усі платежі проходять через сертифіковані платформи з використанням захищених протоколів.'
  },
  {
    question: 'Як швидко я отримаю підтвердження після оплати?',
    answer: 'Зазвичай одразу. Якщо ні — зв’яжіться з <a href="/contacts"> нами</a>.'
  }
];

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
}
