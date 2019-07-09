import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Sentence } from 'src/model/sentence';


@Injectable({
  providedIn: 'root'
})
export class SentencesService {

  constructor(private http: HttpClient) { }

  getRandomSentence(kanji: string): Observable<Sentence> {

    return this.http
      .get<Sentence>("http://localhost:4200/api/dummyuser/random-sentence/" + kanji)
      .pipe(
        catchError(err => {
          console.error(err);
          return throwError(err);
        })
      )
  }

  getRandomSentences(): Observable<Sentence> {

    return this.http
      .get<Sentence>("http://localhost:4200/api/dummyuser/random-sentence")
      .pipe(
        catchError(err => {
          console.error(err);
          return throwError(err);
        })
      )
  }
}
