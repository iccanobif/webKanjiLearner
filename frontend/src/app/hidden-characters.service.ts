import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HiddenCharactersService {

  cachedHiddenCharacters: Set<string>
  cachedUsername: string

  constructor(private api: ApiService) { }

  private load(username: string) {
    return this.api.getAllHiddenCharacters(username).pipe(
      tap((hiddenCharacters) => {
        this.cachedHiddenCharacters = new Set(hiddenCharacters);
        this.cachedUsername = username
      })
    )
  }

  getHiddenCharacters(username: string): Observable<Set<string>> {
    if (username == this.cachedUsername) {
      return of(this.cachedHiddenCharacters)
    }

    return this.load(username).pipe(
      map(hiddenCharacters => {
        return new Set(hiddenCharacters)
      })
    )
  }

  isHidden(username: string, character: string): Observable<boolean> {
    if (username == this.cachedUsername) {
      return of(this.cachedHiddenCharacters.has(character))
    }

    return this.load(username).pipe(
      map(hiddenCharacters => {
        return new Set(hiddenCharacters).has(character)
      })
    )
  }

  hide(username: string, character: string): Observable<any> {
    return this.api.hideCharacter(username, character).pipe(
      tap(() => {
        this.cachedHiddenCharacters.add(character)
      })
    )
  }

  unhide(username: string, character: string): Observable<any> {
    return this.api.unhideCharacter(username, character).pipe(
      tap(() => {
        this.cachedHiddenCharacters.delete(character)
      })
    )
  }


}
