import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchDepartmentComponent } from './branch-department.component';

describe('BranchDepartmentComponent', () => {
  let component: BranchDepartmentComponent;
  let fixture: ComponentFixture<BranchDepartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchDepartmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
