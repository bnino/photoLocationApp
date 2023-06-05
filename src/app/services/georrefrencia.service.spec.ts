import { TestBed } from '@angular/core/testing';

import { GeorrefrenciaService } from './georrefrencia.service';

describe('GeorrefrenciaService', () => {
  let service: GeorrefrenciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeorrefrenciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
