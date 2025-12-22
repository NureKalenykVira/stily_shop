import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeGuideModalComponent } from './size-guide-modal.component';

describe('SizeGuideModalComponent', () => {
  let component: SizeGuideModalComponent;
  let fixture: ComponentFixture<SizeGuideModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SizeGuideModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SizeGuideModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
