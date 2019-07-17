import { TestBed } from '@angular/core/testing';

import { ScrollPositionRestorerService } from './scroll-position-restorer.service';

describe('ScrollPositionRestorerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ScrollPositionRestorerService = TestBed.get(ScrollPositionRestorerService);
    expect(service).toBeTruthy();
  });
});
