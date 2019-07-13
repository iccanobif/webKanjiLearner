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

}
