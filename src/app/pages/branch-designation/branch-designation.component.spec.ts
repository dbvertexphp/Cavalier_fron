import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchDesignationComponent } from './branch-designation.component';

describe('BranchDesignationComponent', () => {
  let component: BranchDesignationComponent;
  let fixture: ComponentFixture<BranchDesignationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchDesignationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchDesignationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
