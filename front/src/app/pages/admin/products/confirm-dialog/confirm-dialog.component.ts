import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  template: `
    <div class="dlg">
      <h3 class="title">{{ data.title }}</h3>
      <p class="text">{{ data.text }}</p>

      <div class="actions">
        <button class="btn" (click)="ref.close(false)">Скасувати</button>
        <button class="btn btn-danger" (click)="ref.close(true)">Видалити</button>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .dlg { padding:16px; background:#fff; }
    .title { margin:0 0 8px 0; font-weight:700; font-size:18px; }
    .text { margin:0 0 8px 0; font-size:15px; color:#222; }

    .actions { display:flex; justify-content:flex-end; gap:8px; margin-top:10px; }
    .btn {
      display:inline-block; padding:8px 14px; border-radius:14px; border:1px solid #ddd;
      background:#fff; cursor:pointer; font-weight:500;
      transition: background .15s, border-color .15s, box-shadow .15s;
    }
    .btn:hover { background:#f7f7f7; border-color:#ccc; box-shadow:0 0 8px rgba(0,0,0,.05); }

    /* ТВОЇ КОЛЬОРИ ДЛЯ DANGER */
    .btn-danger { background:#d32424; color:#fff; border-color:#d32424; }
    .btn-danger:hover { background:#b71b1b; border-color:#b71b1b; }
  `],
  // якщо тема/overlay раптом переб’є — зніми інкапсуляцію:
  // encapsulation: ViewEncapsulation.None
})
export class ConfirmDialogComponent {
  constructor(
    public ref: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; text: string }
  ) {}
}
