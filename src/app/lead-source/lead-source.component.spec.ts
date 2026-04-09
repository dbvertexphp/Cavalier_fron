import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadSourceComponent } from './lead-source.component';

describe('LeadSourceComponent', () => {
  let component: LeadSourceComponent;
  let fixture: ComponentFixture<LeadSourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadSourceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeadSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
