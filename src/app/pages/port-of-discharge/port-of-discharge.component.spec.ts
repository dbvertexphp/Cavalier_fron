import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortOfDischargeComponent } from './port-of-discharge.component';

describe('PortOfDischargeComponent', () => {
  let component: PortOfDischargeComponent;
  let fixture: ComponentFixture<PortOfDischargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortOfDischargeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortOfDischargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
