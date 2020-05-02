import { TestBed } from '@angular/core/testing';

import { SentencesForWordResolverService } from './sentences-for-word-resolver.service';

describe('SentencesForWordResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SentencesForWordResolverService = TestBed.get(SentencesForWordResolverService);
    expect(service).toBeTruthy();
  });
});
