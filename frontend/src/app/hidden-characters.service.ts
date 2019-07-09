import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HiddenCharactersService {

  constructor(private http: HttpClient) { }

  getAllHiddenCharacters(userName: string): Observable<string[]> {
    return this.http
      .get<string[]>("http://localhost:4200/api/" + userName + "/hidden-characters")
  }

  hideCharacter(userName: string, character: string): Observable<any> {
    return this.http.post("http://localhost:4200/api/" + userName + "/hidden-characters/" + character,
      null,
      { responseType: "arraybuffer" })
  }
}