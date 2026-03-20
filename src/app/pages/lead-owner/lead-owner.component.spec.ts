import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadOwnerComponent } from './lead-owner.component';

describe('LeadOwnerComponent', () => {
  let component: LeadOwnerComponent;
  let fixture: ComponentFixture<LeadOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadOwnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
