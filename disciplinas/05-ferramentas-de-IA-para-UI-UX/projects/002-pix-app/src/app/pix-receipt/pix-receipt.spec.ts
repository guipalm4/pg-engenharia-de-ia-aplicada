import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PixReceipt } from './pix-receipt';

describe('PixReceipt', () => {
  let component: PixReceipt;
  let fixture: ComponentFixture<PixReceipt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PixReceipt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PixReceipt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
