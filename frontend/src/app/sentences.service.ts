import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Sentence } from 'src/model/sentence';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SentencesService {

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