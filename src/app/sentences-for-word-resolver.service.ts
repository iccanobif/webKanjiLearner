import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Sentence } from 'src/model/sentence';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { KanjiDetail } from 'src/model/kanji-detail';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SentencesForWordResolverService implements Resolve<Sentence[]> {

  constructor(private api: ApiService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Sentence[]> {
    const character = route.paramMap.get("character")
    const word = route.paramMap.get("word")

    return this.api.getKanjiDetail(character)
      .pipe(
        map((detail: KanjiDetail) => {
          return detail.sentences.filter(s => s.kanjiText.indexOf(word) >= 0)
        })
      )
  }
}
