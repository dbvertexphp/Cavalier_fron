import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyRoleComponent } from './party-role.component';

describe('PartyRoleComponent', () => {
  let component: PartyRoleComponent;
  let fixture: ComponentFixture<PartyRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartyRoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartyRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
