import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageBoxesComponent } from './package-boxes.component';

describe('PackageBoxesComponent', () => {
  let component: PackageBoxesComponent;
  let fixture: ComponentFixture<PackageBoxesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageBoxesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackageBoxesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
