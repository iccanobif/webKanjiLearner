import { Injectable } from '@angular/core';
import { Sentence } from 'src/model/sentence';

@Injectable({
  providedIn: 'root'
})
export class SentencesService {

  constructor() { }

  getRandomSentence()
  {
    const sentence = new Sentence();
    sentence.kanji = "人";
    sentence.kanaText = "text in kana";
    sentence.englishText = "text in english";
    sentence.kanjiText = "text in kanji";

    return sentence;
  }
}
