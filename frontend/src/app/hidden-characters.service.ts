import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HiddenCharactersService {

  constructor(private http: HttpClient) { }

  getAllHiddenCharacters(userName: string): Observable<string[]> {
    return this.http
      .get<string[]>("http://localhost:8081/" + userName + "/hidden-characters")
  }
}