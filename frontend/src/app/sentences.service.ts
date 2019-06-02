import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Sentence } from 'src/model/sentence';


@Injectable({
  providedIn: 'root'
})
export class SentencesService {

  constructor(private http: HttpClient) { }

  getRandomSentence(): Observable<Sentence> {

    return this.http
      .get<Sentence>("http://localhost:4200/api/getRandomSentence/人")
      // TODO HANDLE ERRORS
  }
}
