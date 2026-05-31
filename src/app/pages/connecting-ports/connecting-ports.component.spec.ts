import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectingPortsComponent } from './connecting-ports.component';

describe('ConnectingPortsComponent', () => {
  let component: ConnectingPortsComponent;
  let fixture: ComponentFixture<ConnectingPortsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectingPortsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectingPortsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
