import { TestBed } from '@angular/core/testing';

import { CheckPermissionService } from './check-permission.service';

describe('CheckPermissionService', () => {
  let service: CheckPermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckPermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
