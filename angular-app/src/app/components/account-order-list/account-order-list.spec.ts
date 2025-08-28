import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountOrderList } from './account-order-list';

describe('AccountOrderList', () => {
  let component: AccountOrderList;
  let fixture: ComponentFixture<AccountOrderList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountOrderList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountOrderList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
