import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Sentence } from 'src/model/sentence';
import { environment } from 'src/environments/environment';
import { KanjiDetail } from 'src/model/kanji-detail';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getRandomSentence(kanji: string): Observable<Sentence> {
    return this.http
      .get<Sentence>(environment.apiURL + "/iccanobif/random-sentence/" + kanji)
  }

  getRandomSentences(): Observable<Sentence[]> {
    return this.http
      .get<Sentence[]>(environment.apiURL + "/iccanobif/random-sentence")
  }

  getKanjiDetail(kanji: string): Observable<KanjiDetail> {
    return this.http
      .get<any>(environment.apiURL + "/kanji/" + kanji)
      .pipe(
        map(apiOutput => {
          return {
            character: kanji,
            readings: apiOutput.readings,
            sentences: apiOutput.sentences.map((s: any) => {
              const output = new Sentence()
              output.englishText = s.eng
              output.kanjiText = s.jpn
              output.kanaText = s.kana
              return output
            }),
            meanings: apiOutput.meanings,
            jigen: apiOutput.jigen,
          };
        })
      )
  }
}
