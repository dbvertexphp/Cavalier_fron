import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortOfLoadingComponent } from './port-of-loading.component';

describe('PortOfLoadingComponent', () => {
  let component: PortOfLoadingComponent;
  let fixture: ComponentFixture<PortOfLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortOfLoadingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortOfLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
