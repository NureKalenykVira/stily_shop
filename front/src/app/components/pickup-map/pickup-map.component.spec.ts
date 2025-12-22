import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickupMapComponent } from './pickup-map.component';

describe('PickupMapComponent', () => {
  let component: PickupMapComponent;
  let fixture: ComponentFixture<PickupMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickupMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickupMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
