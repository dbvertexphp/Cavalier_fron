import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortSetupComponent } from './port-setup.component';

describe('PortSetupComponent', () => {
  let component: PortSetupComponent;
  let fixture: ComponentFixture<PortSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortSetupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
