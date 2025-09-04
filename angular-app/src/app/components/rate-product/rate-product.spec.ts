import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateProduct } from './rate-product';

describe('RateProduct', () => {
  let component: RateProduct;
  let fixture: ComponentFixture<RateProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RateProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RateProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
