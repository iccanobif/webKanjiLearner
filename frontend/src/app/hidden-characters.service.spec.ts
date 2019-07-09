import { TestBed } from '@angular/core/testing';

import { HiddenCharactersService } from './hidden-characters.service';

describe('HiddenCharactersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HiddenCharactersService = TestBed.get(HiddenCharactersService);
    expect(service).toBeTruthy();
  });
});
