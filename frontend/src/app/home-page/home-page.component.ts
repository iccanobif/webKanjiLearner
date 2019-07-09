import { Component, OnInit } from '@angular/core';
import { SentencesService } from '../sentences.service';
import { Sentence } from 'src/model/sentence';
import { HiddenCharactersService } from '../hidden-characters.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  title = 'webKanjiLearnerFrontend';
  sentenceList: Sentence[] = [];

  constructor(
    private sentencesService: SentencesService,
    private hiddenCharactersService: HiddenCharactersService
  ) { }

  ngOnInit() {

    this.sentencesService.getRandomSentences()
      .subscribe(sentenceList => {
        this.sentenceList = sentenceList;
      });
  }

  loadNewSentence(i: number) {
    this.sentencesService.getRandomSentence(this.sentenceList[i].kanji)
      .subscribe(s => {
        this.sentenceList[i] = s
      })
  }

  hideCharacter(i: number) {
    const character = this.sentenceList[i].kanji

    this.hiddenCharactersService.hideCharacter("iccanobif", character)
      .subscribe(() => {
        this.sentenceList.splice(i, 1)
      })
  }
}
