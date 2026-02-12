import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargoTypeComponent } from './cargo-type.component';

describe('CargoTypeComponent', () => {
  let component: CargoTypeComponent;
  let fixture: ComponentFixture<CargoTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargoTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargoTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
