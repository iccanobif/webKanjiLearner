import { TestBed } from '@angular/core/testing';

import { HiddenCharactersResolverService } from './hidden-characters-resolver.service';

describe('HiddenCharactersResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HiddenCharactersResolverService = TestBed.get(HiddenCharactersResolverService);
    expect(service).toBeTruthy();
  });
});
