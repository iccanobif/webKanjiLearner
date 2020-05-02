import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { HiddenCharactersService } from './hidden-characters.service';

@Injectable({
  providedIn: 'root'
})
export class HiddenCharactersResolverService implements Resolve<Set<string>> {

  constructor(private hiddenCharactersService: HiddenCharactersService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Set<string>> | Observable<never> {
    const username = route.paramMap.get("username")
    return this.hiddenCharactersService.getHiddenCharacters(username)
  }
}
