import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePermisionsComponent } from './role-permisions.component';

describe('RolePermisionsComponent', () => {
  let component: RolePermisionsComponent;
  let fixture: ComponentFixture<RolePermisionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolePermisionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolePermisionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
