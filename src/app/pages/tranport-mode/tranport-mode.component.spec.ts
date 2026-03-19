import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranportModeComponent } from './tranport-mode.component';

describe('TranportModeComponent', () => {
  let component: TranportModeComponent;
  let fixture: ComponentFixture<TranportModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranportModeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranportModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
