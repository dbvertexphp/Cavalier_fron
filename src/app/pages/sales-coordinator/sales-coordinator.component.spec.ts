import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesCoordinatorComponent } from './sales-coordinator.component';

describe('SalesCoordinatorComponent', () => {
  let component: SalesCoordinatorComponent;
  let fixture: ComponentFixture<SalesCoordinatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesCoordinatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesCoordinatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
