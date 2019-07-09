import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HiddenCharactersService {

  constructor(private http: HttpClient) { }

  getAllHiddenCharacters(userName: string): Observable<string[]> {
    return this.http
      .get<string[]>(environment.apiURL + "/" + userName + "/hidden-characters")
  }

  hideCharacter(userName: string, character: string): Observable<any> {
    return this.http.post(environment.apiURL + "/" + userName + "/hidden-characters/" + character,
      null,
      { responseType: "arraybuffer" })
  }
}