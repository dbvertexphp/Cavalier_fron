import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentTypeComponent } from './shipment-type.component';

describe('ShipmentTypeComponent', () => {
  let component: ShipmentTypeComponent;
  let fixture: ComponentFixture<ShipmentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
