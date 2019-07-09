import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Sentence } from 'src/model/sentence';

@Injectable({
  providedIn: 'root'
})
export class SentencesService {

  constructor(private http: HttpClient) { }

  getRandomSentence(kanji: string): Observable<Sentence> {
    return this.http
      .get<Sentence>("http://localhost:4200/api/iccanobif/random-sentence/" + kanji)
  }

  getRandomSentences(): Observable<Sentence[]> {
    return this.http
      .get<Sentence[]>("http://localhost:4200/api/iccanobif/random-sentence")
  }
}
