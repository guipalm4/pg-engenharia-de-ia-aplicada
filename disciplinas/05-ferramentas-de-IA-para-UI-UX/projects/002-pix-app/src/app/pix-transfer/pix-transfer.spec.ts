import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PixTransfer } from './pix-transfer';

describe('PixTransfer', () => {
  let component: PixTransfer;
  let fixture: ComponentFixture<PixTransfer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PixTransfer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PixTransfer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
