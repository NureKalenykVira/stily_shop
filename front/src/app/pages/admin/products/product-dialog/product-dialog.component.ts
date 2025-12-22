import { Component, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Product } from '../products.component';

@Component({
  standalone: true,
  selector: 'app-product-dialog',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="dlg">
    <div class="dlg__header">
      <h3>{{ data ? 'Редагувати товар' : 'Новий товар' }}</h3>
    </div>

    <div class="dlg__body">
      <form [formGroup]="form" class="grid">
        <label>Назва<input formControlName="title" /></label>
        <label>SKU<input formControlName="sku" /></label>
        <label>Категорія<input formControlName="category" /></label>
        <label>Ціна<input type="number" formControlName="price" /></label>
        <label>Склад<input type="number" formControlName="stock" /></label>
        <label>Статус
          <select formControlName="status">
            <option value="active">active</option>
            <option value="draft">draft</option>
          </select>
        </label>

        <label class="full">Фото (URL, через кому)
          <textarea rows="2" formControlName="images"></textarea>
        </label>

        <div class="preview" *ngIf="firstImage()">
          <img [src]="firstImage()" alt="" />
          <span class="muted">{{ imagesCountHint() }}</span>
        </div>

        <label>Кольори (через кому)<input formControlName="colors"/></label>
        <label>Розміри (через кому)<input formControlName="sizes"/></label>
        <label>Тканина (через кому)<input formControlName="fabric"/></label>
        <label>Опис<textarea rows="3" formControlName="description"></textarea></label>
      </form>
    </div>

    <div class="dlg__footer">
      <button class="btn" (click)="ref.close()">Скасувати</button>
      <button class="btn btn-primary" (click)="save()" [disabled]="form.invalid">Зберегти</button>
    </div>
  </div>
  `,
  styles: [`
  :host { display:block; }
  .dlg { background:#fff; }
  .dlg__header { padding: 16px 24px 12px; border-bottom: 1px solid #f0f0f0; }
  .dlg__header h3 { margin: 0; font-weight:700; font-size:20px; }

  .dlg__body { padding: 18px 24px 0 18px; }
  .grid {
    display:grid;
    grid-template-columns: 0.5fr 0.5fr;
    max-width: 900px;
    column-gap: 35px;
    row-gap: 14px;
    align-items: start;
  }
  .full { grid-column:1 / -1; }

  input, select, textarea {
    width:100%;
    border:1px solid #ddd; border-radius:12px;
    font-family:inherit; font-size:14px; line-height:20px;
    padding:11px 12px;
    background:#fff;
  }
  input:focus, select:focus, textarea:focus { outline:none; border-color:#191919; }
  textarea { min-height: 20px; resize: vertical; }
  select { height: 44px; }

  .preview {
    display:flex; align-items:center; gap:10px;
    grid-column:1/-1; margin-top:-2px;
  }
  .preview img { width:58px; height:58px; object-fit:cover; border-radius:12px; border:1px solid #ddd; }
  .muted { color:#777; font-size:12px; }

  .dlg__footer {
    border-top:1px solid #f0f0f0;
    padding: 12px 24px;
    display:flex; justify-content:flex-end; gap:8px;
  }

  .btn {
    display:inline-block; padding:10px 16px; border-radius:14px; border:1px solid #ddd;
    background:#fff; cursor:pointer; font-weight:600;
    transition: background .15s, border-color .15s, box-shadow .15s;
  }
  .btn:hover { background:#f7f7f7; border-color:#ccc; box-shadow:0 0 8px rgba(0,0,0,.05); }

  .btn-primary { background:#191919; color:#fff; border-color:#191919; }
  .btn-primary:hover { background:#222; border-color:#222; }
  .btn-primary:disabled { opacity:.5; cursor:not-allowed; }

  @media (max-width: 900px) {
    .grid { grid-template-columns: 1fr; }
  }
`]
})
export class ProductDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public ref: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Product | null
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      sku: ['', Validators.required],
      category: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      status: ['active'],
      description: [''],
      images: [''],
      colors: [''],
      sizes:  [''],
      fabric: [''],
    });

    if (data) {
      this.form.patchValue({
        ...data,
        images: (data.images || []).join(', '),
        colors: (data.colors || []).join(', '),
        sizes:  (data.sizes  || []).join(', '),
        fabric: (data.fabric || []).join(', '),
      });
    }
  }

  private toArray(s: string): string[] {
    return (s || '').split(',').map(x => x.trim()).filter(Boolean);
  }
  firstImage(): string | null {
    const raw = this.form.get('images')?.value as string;
    return this.toArray(raw)[0] ?? null;
  }
  imagesCountHint(): string {
    const n = this.toArray(this.form.get('images')?.value as string).length;
    return n > 1 ? `ще ${n - 1} фото` : '1 фото';
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const out: Product = {
      ...this.data,
      ...v,
      images: this.toArray(v.images),
      colors: this.toArray(v.colors),
      sizes:  this.toArray(v.sizes),
      fabric: this.toArray(v.fabric),
    };
    this.ref.close(out);
  }
}
