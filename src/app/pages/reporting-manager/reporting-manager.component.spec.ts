import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingManagerComponent } from './reporting-manager.component';

describe('ReportingManagerComponent', () => {
  let component: ReportingManagerComponent;
  let fixture: ComponentFixture<ReportingManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportingManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportingManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
