import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { KanjiDetail } from 'src/model/kanji-detail';
import { Observable, of } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class KanjiDetailResolverService implements Resolve<KanjiDetail> {
  constructor(private api: ApiService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<KanjiDetail> | Observable<never> {

    const character = route.paramMap.get("character")
    return this.api.getKanjiDetail(character)
  }
}
