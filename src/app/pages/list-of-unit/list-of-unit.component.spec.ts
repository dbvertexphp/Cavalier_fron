import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOfUnitComponent } from './list-of-unit.component';

describe('ListOfUnitComponent', () => {
  let component: ListOfUnitComponent;
  let fixture: ComponentFixture<ListOfUnitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOfUnitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOfUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
