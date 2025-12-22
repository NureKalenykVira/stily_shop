import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-size-guide-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './size-guide-modal.component.html',
  styleUrls: ['./size-guide-modal.component.scss']
})
export class SizeGuideModalComponent {
  section: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<SizeGuideModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  toggle(target: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.section = this.section === target ? null : target;
  }

  toggleParent(base: string): void {
    this.section = this.section?.startsWith(base) ? null : `${base}`;
  }
}
