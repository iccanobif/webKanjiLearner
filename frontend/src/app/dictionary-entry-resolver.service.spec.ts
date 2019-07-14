import { TestBed } from '@angular/core/testing';

import { DictionaryEntryResolverService } from './dictionary-entry-resolver.service';

describe('DictionaryEntryResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DictionaryEntryResolverService = TestBed.get(DictionaryEntryResolverService);
    expect(service).toBeTruthy();
  });
});
