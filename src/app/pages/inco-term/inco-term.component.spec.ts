import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncoTermComponent } from './inco-term.component';

describe('IncoTermComponent', () => {
  let component: IncoTermComponent;
  let fixture: ComponentFixture<IncoTermComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncoTermComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncoTermComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
