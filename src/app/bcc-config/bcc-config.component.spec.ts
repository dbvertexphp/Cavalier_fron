import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BccConfigComponent } from './bcc-config.component';

describe('BccConfigComponent', () => {
  let component: BccConfigComponent;
  let fixture: ComponentFixture<BccConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BccConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BccConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
