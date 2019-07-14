import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DictionaryEntry } from './dictionary-entry';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DictionaryEntryResolverService implements Resolve<DictionaryEntry> {

  constructor(private api: ApiService) { }

  resolve(route: ActivatedRouteSnapshot): Observable<DictionaryEntry>
  {
    const word = route.paramMap.get("word")
    return this.api.getDictionaryEntry(word)
  }
}
