import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesStageComponent } from './sales-stage.component';

describe('SalesStageComponent', () => {
  let component: SalesStageComponent;
  let fixture: ComponentFixture<SalesStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesStageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
