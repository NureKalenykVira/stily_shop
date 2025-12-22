import { Component, ViewChildren, QueryList, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
  selector: 'app-returns',
  imports: [CommonModule, ScrollToTopComponent],
  templateUrl: './returns.component.html',
  styleUrl: './returns.component.scss'
})
export class ReturnsComponent {
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
    question: 'Чи можна повернути товар, якщо він не підійшов?',
    answer: 'Так, згідно із законодавством, ви можете повернути товар протягом 14 днів після отримання, якщо він не був у використанні.'
  },
  {
    question: 'Які умови для обміну товару?',
    answer: 'Товар повинен бути в первісному стані, з усіма бірками та упаковкою. Обмін можливий протягом 14 днів.'
  },
  {
    question: 'Як ініціювати повернення?',
    answer: 'Зв’яжіться з нами через <a href="/contacts">форму на сайті</a> або email із номером замовлення, і ми надамо подальші інструкції.'
  },
  {
    question: 'Чи потрібно сплачувати за доставку при поверненні?',
    answer: 'Так, витрати на зворотну доставку оплачує покупець, крім випадків браку або помилки з нашого боку.'
  },
  {
    question: 'Коли я отримаю гроші після повернення?',
    answer: 'Повернення коштів здійснюється протягом 3–5 робочих днів після перевірки товару.'
  },
  {
    question: 'Чи можна повернути речі зі знижкою?',
    answer: 'Так, товари з розпродажу також підлягають поверненню, якщо вони відповідають умовам повернення.'
  },
  {
    question: 'Я отримав бракований товар — що робити?',
    answer: 'Ми приносимо вибачення! <a href="/contacts">Зв’яжіться з нами</a> з фото браку, і ми запропонуємо обмін або повернення коштів.'
  },
  {
    question: 'Чи можу я обміняти розмір, якщо не підійшов?',
    answer: 'Так, обмін на інший розмір можливий при наявності відповідної моделі на складі.'
  },
  {
    question: 'Які речі не підлягають поверненню?',
    answer: 'Згідно з законодавством, поверненню не підлягають нижня білизна, панчішно-шкарпеткові вироби та інші товари інтимної гігієни.'
  },
  {
    question: 'Як оформити обмін, якщо я з іншого міста?',
    answer: 'Ми надсилаємо новий товар після отримання повернення. Просто вкажіть нову позицію та надішліть назад попередній товар.'
  }
];
}
