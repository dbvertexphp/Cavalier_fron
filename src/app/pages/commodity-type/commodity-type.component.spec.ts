import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommodityTypeComponent } from './commodity-type.component';

describe('CommodityTypeComponent', () => {
  let component: CommodityTypeComponent;
  let fixture: ComponentFixture<CommodityTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommodityTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommodityTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
