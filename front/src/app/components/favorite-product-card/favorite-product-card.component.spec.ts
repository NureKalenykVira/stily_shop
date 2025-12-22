import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteProductCardComponent } from './favorite-product-card.component';

describe('FavoriteProductCardComponent', () => {
  let component: FavoriteProductCardComponent;
  let fixture: ComponentFixture<FavoriteProductCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteProductCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoriteProductCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
