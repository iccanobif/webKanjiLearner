import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Sentence } from 'src/model/sentence';
import { environment } from 'src/environments/environment';
import { KanjiDetail, Word } from 'src/model/kanji-detail';
import { DictionaryEntry } from './dictionary-entry';
import Cache from 'js-cache';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

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

  unhideCharacter(userName: string, character: string): Observable<any> {
    return this.http.delete(environment.apiURL + "/" + userName + "/hidden-characters/" + character,
      { responseType: "arraybuffer" })
  }

  // kanjiDetailCache: { kanji: string, kanjiDetail: KanjiDetail }[] = []
  kanjiDetailCache = new Cache();

  getKanjiDetail(kanji: string): Observable<KanjiDetail> {
    const cachedValue = this.kanjiDetailCache.get(kanji)
    if (cachedValue)
      return of(cachedValue)

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
              output.splitKanjiText = s.splits
              output.kanaText = s.kana
              return output
            }),
            meanings: apiOutput.meanings,
            jigen: apiOutput.jigen
              ? {
                splitKanjiText: apiOutput.jigen
              } as Sentence
              : null,
            wordsFromExamples: apiOutput.exampleWords.map((w: any) => {
              const output = new Word
              output.kanjiText = w.word
              output.frequency = w.count
              output.readings = w.readings
              return output
            })
          };
        }),
        tap((detail: KanjiDetail) => {
          this.kanjiDetailCache.set(kanji, detail, 1000 * 60 * 60)
        })
      )
  }

  getDictionaryEntry(word: string): Observable<DictionaryEntry> {
    return this.http.get<any>(environment.apiURL + "/dictionary/" + word).pipe(
      map(data => {
        return {
          japaneseDefinitions: data.japaneseDefinitions.map(j => {
            return {
              kanjiElements: j.kanjiElements,
              readingElements: j.readingElements,
              glosses: j.glosses,
            }
          }),
          chineseDefinitions: data.chineseDefinitions
        }
      })
    )
  }
}
