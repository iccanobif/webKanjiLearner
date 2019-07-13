import { TestBed } from '@angular/core/testing';

import { KanjiDetailResolverService } from './kanji-detail-resolver.service';

describe('KanjiDetailResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KanjiDetailResolverService = TestBed.get(KanjiDetailResolverService);
    expect(service).toBeTruthy();
  });
});
